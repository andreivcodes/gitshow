import { NextRequest } from "next/server";
import { StripePlans, SubscriptionPlan } from "@gitshow/gitshow-lib";
import { stripe } from "@/lib/stripe-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@gitshow/db";

export interface CheckoutRequest {
  plan: SubscriptionPlan;
}

type SubscriptionIdMap = {
  [key in SubscriptionPlan]: string;
};

const productIds: SubscriptionIdMap = {
  [SubscriptionPlan.Free]: "",
  [SubscriptionPlan.Premium]: StripePlans.Premium,
};

export async function POST(req: NextRequest) {
  const { plan } = (await req.json()) as CheckoutRequest;

  const session = await getServerSession(authOptions);

  if (!session?.user.email) {
    return Response.json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  const u = await db.selectFrom("user").selectAll().where("email", "=", session.user.email).executeTakeFirst();

  if (!u || !u.stripeCustomerId)
    return Response.json({
      error: {
        code: "stripe-error",
        message: "Could not create checkout session",
      },
    });

  console.log(`Checkout for ${plan} - ${productIds[plan]}`);

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: u.stripeCustomerId,
    line_items: [
      {
        price: productIds[plan],
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL
  });

  if (!checkoutSession.url) {
    return Response.json({
      error: {
        code: "stripe-error",
        message: "Could not create checkout session",
      },
    });
  }

  return Response.json({
    session: checkoutSession,
  });
}
