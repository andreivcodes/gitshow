import { DynamoDB } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { Table } from "sst/node/table";
import { stripe } from "../../../lib/stripeServer";
import { getServerAuthSession } from "../../../server/auth";
import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  updateUser,
} from "@gitshow/gitshow-lib";
import { FREE_PLAN_ID, PREMIUM_PLAN_ID } from "../../../lib/plans";

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

  if (!session?.user) {
    return res.status(500).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  const user = await dynamoDb
    .get({
      TableName: Table.User.tableName,
      Key: { email: session.user.email },
    })
    .promise();

  if (!user.Item)
    return res.status(500).json({
      error: {
        code: "stripe-error",
        message: "Could not create checkout session",
      },
    });

  await updateUser(user.Item.email, { theme: theme });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.Item.stripeCustomerId,
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
        userId: user.Item.id,
        email: user.Item.email,
        stripeCustomerId: user.Item.stripeCustomerId,
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
