import { queueJob } from "@/lib/sqs";
import { stripe } from "@/lib/stripe-server";
import { StripePlans, SubscriptionPlan, db } from "@gitshow/db";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return NextResponse.json({ message: err.message }, { status: 400 });
    } else {
      console.error("Unknown error");
      return NextResponse.json({ message: "unknown error" }, { status: 400 });
    }
  }

  const subscription = event.data.object as Stripe.Subscription;
  const customerId = subscription.customer.toString();
  const priceId = subscription.items.data[0].price.id;

  console.log(`${event.type} - ${customerId} - ${priceId}`);

  const u = await db.selectFrom("user").selectAll().where("stripeCustomerId", "=", customerId).executeTakeFirst();

  console.log(u);

  if (!u) {
    return NextResponse.json({ message: "invalid customer" });
  }

  switch (event.type) {
    case "customer.subscription.created": {
      if (priceId == StripePlans.Premium) {

        await db.updateTable("user")
          .where("stripeCustomerId", "=", customerId)
          .set({ "subscriptionPlan": SubscriptionPlan.PREMIUM, lastSubscriptionTimestamp: new Date() }).execute();

        await queueJob(u.email!, true);
      }
      break;
    }
    case "customer.subscription.deleted": {

      await db.updateTable("user")
        .where("stripeCustomerId", "=", customerId)
        .set({ subscriptionPlan: SubscriptionPlan.FREE, theme: "classic", lastSubscriptionTimestamp: new Date() }).execute();

      await queueJob(u.email!, true);
      break;
    }
    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
      return NextResponse.json({ message: "unknown event" });
  }

  return NextResponse.json({ message: "success" });
}
