import { prisma, redis } from "@/lib/db";
import { stripe } from "@/lib/stripe-server";
import { StripePlans } from "@gitshow/gitshow-lib";
import { SubscriptionPlan } from "@prisma/client";
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

  const u = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  console.log(u);

  if (!u) {
    return NextResponse.json({
      message: "invalid customer",
    });
  }

  switch (event.type) {
    case "customer.subscription.created": {
      if (priceId == StripePlans.Premium) {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionPlan: SubscriptionPlan.PREMIUM,
            lastSubscriptionTimestamp: new Date(),
          },
        });

        await redis.publish("update", JSON.stringify({ userId: u.id }));
      }
      break;
    }
    case "customer.subscription.deleted": {
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionPlan: SubscriptionPlan.FREE,
          theme: "normal",
          lastSubscriptionTimestamp: new Date(),
        },
      });

      await redis.publish("update", JSON.stringify({ userId: u.id }));

      break;
    }
    default:
      console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
      return NextResponse.json({
        message: "unknown event",
      });
  }

  return NextResponse.json({
    message: "success",
  });
}
