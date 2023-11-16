import Stripe from "stripe";
import { stripe } from "../../../lib/stripeServer";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";
import { updateUser } from "../../../lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { Config } from "sst/node/config";
import { FREE_PLAN, PREMIUM_PLAN, STANDARD_PLAN } from "../../../lib/plans";
import { queueUpdateHeader } from "../../../lib/sqs";
import { AvailableThemeNames } from "@gitshow/svg-gen";

interface Plan {
  type: "free" | "standard" | "premium";
  theme?: AvailableThemeNames;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const dynamoDb = new DynamoDB.DocumentClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const webhookSecret: string = Config.STRIPE_WEBHOOK_SECRET;

  console.log("[STRIPE] Request");
  try {
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    console.log("[STRIPE] Construct event");
    try {
      const rawBody = await readRawBody(req);

      event = stripe.webhooks.constructEvent(
        rawBody as string,
        sig,
        webhookSecret
      );
    } catch (error: any) {
      throw new Error(`[STRIPE] Stripe webhook error: ${error}`);
    }

    console.log("[STRIPE] Event", event.type);

    const subscription = event.data.object as Stripe.Subscription;

    const users = await dynamoDb
      .query({
        TableName: Table.User.tableName,
        IndexName: "StripeCustomerIndex",
        KeyConditionExpression: "stripeCustomerId = :stripeCustomerId",
        ExpressionAttributeValues: {
          ":stripeCustomerId": subscription.customer.toString(),
        },
      })
      .promise();

    if (users.Count === 0 || !users.Items) {
      throw new Error(`[STRIPE] Invalid customer`);
    }

    const user = users.Items[0];

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        let e = event as Stripe.CustomerSubscriptionCreatedEvent;

        let plan: Plan = { type: "free", theme: "classic" };

        switch (e.data.object.items.data[0].plan.id) {
          case FREE_PLAN:
            plan = { type: "free", theme: "classic" };
            break;
          case STANDARD_PLAN:
            plan = { type: "standard", theme: "githubDark" };
            break;
          case PREMIUM_PLAN:
            plan = { type: "premium", theme: user.theme };
            break;
          default:
            break;
        }

        try {
          console.log(`Update user ${user.email} to ${plan.type}`);
          await updateUser(user.email, {
            subscriptionType: plan.type,
            lastSubscriptionTimestamp: new Date().toISOString(),
          });
        } catch (error) {
          throw new Error(`[STRIPE] Failed to update user ${error}`);
        }

        await queueUpdateHeader(user.email);

        break;

      case "customer.subscription.deleted":
        try {
          console.log(`Delete user ${user.email}`);
          await updateUser(user.email, {
            subscriptionType: "none",
          });
        } catch (error) {
          throw new Error(`[STRIPE] Failed to delete user ${error}`);
        }

        break;

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.log("Subscriptions webhook error:", error);
    return res.status(400).json({
      error: "Subscriptions webhook error.",
      e: (error as Error).message,
    });
  }

  res.status(200).json({ received: true });
}

function readRawBody(stream: any) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk: any) => {
      data += chunk;
    });
    stream.on("end", () => resolve(data));
    stream.on("error", (err: any) => reject(err));
  });
}
