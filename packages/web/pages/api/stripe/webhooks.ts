import { DynamoDB } from "aws-sdk";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import Stripe from "stripe";
import { FREE_PLAN_ID, PREMIUM_PLAN_ID } from "../../../lib/plans";
import { queueJob } from "../../../lib/sqs";
import { stripe } from "../../../lib/stripeServer";
import { buffer } from "micro";
import Cors from "micro-cors";
import { NextApiRequest, NextApiResponse } from "next";
import {
  AvailableSubscriptionTypes,
  FREE_PLAN,
  PREMIUM_PLAN,
  updateUser,
  NONE_PLAN,
} from "@gitshow/gitshow-lib";

interface Plan {
  type: AvailableSubscriptionTypes;
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
        let plan: Plan = { type: FREE_PLAN };

        switch (event.data.object.items.data[0].plan.id) {
          case FREE_PLAN_ID:
            plan = { type: FREE_PLAN };
            break;

          case PREMIUM_PLAN_ID:
            plan = { type: PREMIUM_PLAN };
            break;
          default:
            break;
        }

        try {
          console.log(`Update user ${user.email} to ${plan.type}}`);
          await updateUser(user.email, {
            subscriptionType: plan.type,
            lastSubscriptionTimestamp: new Date().toISOString(),
          });
        } catch (error) {
          throw new Error(`[STRIPE] Failed to update user ${error}`);
        }

        break;
      }

      case "customer.subscription.deleted":
        try {
          console.log(`Delete user ${user.email}`);
          await updateUser(user.email, {
            subscriptionType: NONE_PLAN,
          });
        } catch (error) {
          throw new Error(`[STRIPE] Failed to delete user ${error}`);
        }

        break;

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }
    await queueJob(user.email);
    res.json({ received: true });

    // Successfully constructed event.
    console.log("✅ Success:", event.id);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default cors(webhookHandler as any);
