import "server-only";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../db/src/index";
import { Config } from "sst/node/config";
import { stripe } from "../../../../utils/stripeServer";

const webhookSecret: string = Config.STRIPE_WEBHOOK_SECRET!;

const webhookHandler = async (req: NextRequest) => {
  try {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (err! instanceof Error) console.log(err);
      console.log(`❌ Error message: ${errorMessage}`);

      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${errorMessage}`,
          },
        },
        { status: 400 }
      );
    }

    console.log("✅ Success:", event.id);

    const subscription = event.data.object as Stripe.Subscription;

    switch (event.type) {
      case "customer.subscription.created":
        let created_event = event as Stripe.CustomerSubscriptionCreatedEvent;

        await db
          .updateTable("users")
          .set({
            isFree: false,
            isStandard:
              created_event.data.object.items.data[0].plan.id ==
              "price_1O7OaXHNuNMEdXGMt3aabIZx"
                ? true
                : false,
            isPremium:
              created_event.data.object.items.data[0].plan.id ==
              "price_1O7ObLHNuNMEdXGMc8dcCRW9"
                ? true
                : false,
            lastSubscriptionTimestamp: new Date(),
          })
          .where(
            "users.stripeCustomerId",
            "=",
            subscription.customer.toString()
          )
          .execute();

        break;

      case "customer.subscription.deleted":
        await db
          .deleteFrom("users")
          .where(
            "users.stripeCustomerId",
            "=",
            subscription.customer.toString()
          )
          .execute();

        break;

      case "customer.subscription.updated":
        let updated_event = event as Stripe.CustomerSubscriptionUpdatedEvent;

        await db
          .updateTable("users")
          .set({
            isFree: false,
            isStandard:
              updated_event.data.object.items.data[0].plan.id ==
              "price_1O7OaXHNuNMEdXGMt3aabIZx"
                ? true
                : false,
            isPremium:
              updated_event.data.object.items.data[0].plan.id ==
              "price_1O7ObLHNuNMEdXGMc8dcCRW9"
                ? true
                : false,
            lastSubscriptionTimestamp: new Date(),
          })
          .where(
            "users.stripeCustomerId",
            "=",
            subscription.customer.toString()
          )
          .execute();
        break;

      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }

    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: `Method Not Allowed`,
        },
      },
      { status: 405 }
    ).headers.set("Allow", "POST");
  }
};

export { webhookHandler as POST };
