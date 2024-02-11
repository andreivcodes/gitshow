import { queueJob } from "@/lib/sqs";
import { stripe } from "@/lib/stripe-server";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";
import {
  StripePlans,
  SubscriptionPlan,
  UpdateInterval,
} from "@gitshow/gitshow-lib";
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

  const u = await db
    .select()
    .from(userTable)
    .where(eq(userTable.stripeCustomerId, customerId))
    .then(takeUniqueOrNull);

  console.log(u);

  if (!u) {
    return NextResponse.json({ message: "invalid customer" });
  }

  switch (event.type) {
    case "customer.subscription.created": {
      if (priceId == StripePlans.Premium) {
        await db
          .update(userTable)
          .set({
            subscriptionPlan: SubscriptionPlan.Premium,
            lastSubscriptionTimestamp: new Date(),
          })
          .where(eq(userTable.stripeCustomerId, customerId));

        await queueJob(u.email, true);
      }
      break;
    }
    case "customer.subscription.deleted": {
      await db
        .update(userTable)
        .set({
          subscriptionPlan: SubscriptionPlan.Free,
          theme: "classic",
          updateInterval: UpdateInterval.EVERY_MONTH,
        })
        .where(eq(userTable.stripeCustomerId, customerId));

      await queueJob(u.email, true);
      break;
    }
    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
      return NextResponse.json({ message: "unknown event" });
  }

  return NextResponse.json({ message: "success" });
}
