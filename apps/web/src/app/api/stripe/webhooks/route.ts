import { QUEUE_NAME, Rabbit_Message, prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe-server";
import { StripePlans } from "@gitshow/gitshow-lib";
import { SubscriptionPlan } from "@prisma/client";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import amqplib from "amqplib";

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

        let rbmq_conn = await amqplib.connect(process.env.RABBITMQ_URL!);
        let rbmq_ch = await rbmq_conn.createChannel();

        const message: Rabbit_Message = {
          userId: u.id,
        };

        if (rbmq_ch) rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
        rbmq_conn.close();
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

      let rbmq_conn = await amqplib.connect(process.env.RABBITMQ_URL!);
      let rbmq_ch = await rbmq_conn.createChannel();

      const message: Rabbit_Message = {
        userId: u.id,
      };

      if (rbmq_ch) rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
      rbmq_conn.close();

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
