import { DynamoDB } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../../lib/stripeServer";
import { getServerAuthSession } from "../../../server/auth";
import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
} from "@gitshow/gitshow-lib";
import { FREE_PLAN_ID, PREMIUM_PLAN_ID } from "../../../lib/plans";
import { db, userTable, eq, takeUniqueOrThrow } from "@gitshow/db";

const dynamoDb = new DynamoDB.DocumentClient();

type SubscriptionIdMap = {
  [key in AvailableSubscriptionTypes]: string;
};

const productIds: SubscriptionIdMap = {
  free: FREE_PLAN_ID,
  premium: PREMIUM_PLAN_ID,
  none: "",
};

export interface CheckoutRequest {
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body);
  const { type, theme } = req.body as CheckoutRequest;

  const session = await getServerAuthSession({ req, res });

  if (!session?.user.email) {
    return res.status(500).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  const u = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, session.user.email))
    .then(takeUniqueOrThrow);

  if (!u || !u.stripeCustomerId)
    return res.status(500).json({
      error: {
        code: "stripe-error",
        message: "Could not create checkout session",
      },
    });

  await db
    .update(userTable)
    .set({ theme: theme })
    .where(eq(userTable.email, u.email));

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: u.stripeCustomerId!,
    line_items: [
      {
        price: productIds[type],
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL,
    subscription_data: {
      metadata: {
        userId: u.id,
        email: u.email,
        stripeCustomerId: u.stripeCustomerId!,
      },
    },
  });

  if (!checkoutSession.url) {
    return res.status(500).json({
      error: {
        code: "stripe-error",
        message: "Could not create checkout session",
      },
    });
  }

  return res.status(200).json({
    session: checkoutSession,
  });
}
