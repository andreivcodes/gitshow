import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  FREE_PLAN,
  NONE_PLAN,
  PREMIUM_PLAN,
  STANDARD_PLAN,
} from "@gitshow/svg-gen";
import { DynamoDB } from "aws-sdk";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import Stripe from "stripe";
import { updateUser } from "../../../lib/db";
import {
  FREE_PLAN_ID,
  PREMIUM_PLAN_ID,
  STANDARD_PLAN_ID,
} from "../../../lib/plans";
import { queueUpdateHeader } from "../../../lib/sqs";
import { stripe } from "../../../lib/stripeServer";
import { buffer } from "micro";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";

interface Plan {
  type: AvailableSubscriptionTypes;
  theme?: AvailableThemeNames;
}

const webhookSecret: string = Config.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});
const dynamoDb = new DynamoDB.DocumentClient();

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"]!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig,
        webhookSecret
      );
    } catch (err) {
      console.log(`❌ Error message: ${err}`);
      res.status(400).send(`Webhook Error: ${err}`);
      return;
    }

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
      throw new Error("[STRIPE] Invalid customer");
    }

    const user = users.Items[0];

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        let plan: Plan = { type: FREE_PLAN, theme: "classic" };

        switch (event.data.object.items.data[0].plan.id) {
          case FREE_PLAN_ID:
            plan = { type: FREE_PLAN, theme: "classic" };
            break;
          case STANDARD_PLAN_ID:
            plan = { type: STANDARD_PLAN, theme: "githubDark" };
            break;
          case PREMIUM_PLAN_ID:
            plan = { type: PREMIUM_PLAN, theme: user.theme };
            break;
          default:
            break;
        }

        try {
          console.log(`Update user ${user.email} to ${plan.type}`);
          await updateUser(user.email, {
            subscriptionType: plan.type,
            theme: plan.theme,
            lastSubscriptionTimestamp: new Date().toISOString(),
          });
        } catch (error) {
          throw new Error(`[STRIPE] Failed to update user ${error}`);
        }

        await queueUpdateHeader(user.email);

        break;
      }

      case "customer.subscription.deleted":
        try {
          console.log(`Delete user ${user.email}`);
          await updateUser(user.email, {
            theme: "classic",
            subscriptionType: NONE_PLAN,
          });

          await queueUpdateHeader(user.email);
        } catch (error) {
          throw new Error(`[STRIPE] Failed to delete user ${error}`);
        }

        break;

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }

    res.json({ received: true });

    // Successfully constructed event.
    console.log("✅ Success:", event.id);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default cors(webhookHandler as any);
