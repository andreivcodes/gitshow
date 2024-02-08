import { DynamoDB } from "aws-sdk";
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
  NONE_PLAN,
  AvailableThemeNames,
  AvailableIntervals,
} from "@gitshow/gitshow-lib";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";

interface Plan {
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
  interval: AvailableIntervals;
}

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

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

    const u = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, subscription.customer.toString()))
      .then(takeUniqueOrNull);

    if (!u) {
      throw new Error("[STRIPE] Invalid customer");
    }

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        let plan: Plan = { type: FREE_PLAN, theme: "classic", interval: 168 };

        switch (event.data.object.items.data[0].plan.id) {
          case FREE_PLAN_ID:
            plan = { type: FREE_PLAN, theme: "classic", interval: 168 };
            break;

          case PREMIUM_PLAN_ID:
            plan = { type: PREMIUM_PLAN, theme: "classic", interval: 168 };
            break;
          default:
            break;
        }

        try {
          console.log(
            `Update user ${u.email} to ${plan.type}} - ${plan.theme} - ${plan.interval}h`
          );

          await db
            .update(userTable)
            .set({
              subscriptionType: plan.type,
              theme: plan.theme,
              refreshInterval: plan.interval,
              lastSubscriptionTimestamp: new Date(),
            })
            .where(eq(userTable.email, u.email));
        } catch (error) {
          throw new Error(`[STRIPE] Failed to update user ${error}`);
        }

        break;
      }

      case "customer.subscription.deleted":
        try {
          console.log(`Delete user ${u.email}`);

          await db
            .update(userTable)
            .set({
              subscriptionType: NONE_PLAN,
            })
            .where(eq(userTable.email, u.email));
        } catch (error) {
          throw new Error(`[STRIPE] Failed to delete user ${error}`);
        }

        break;

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }
    await queueJob(u.email);
    res.json({ received: true });

    // Successfully constructed event.
    console.log("✅ Success:", event.id);
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default cors(webhookHandler as any);
