import "server-only";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { stripe } from "../../../../utils/stripeServer";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";

const dynamoDb = new DynamoDB.DocumentClient();

export async function POST(req: NextRequest) {
  const body = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      {
        error: {
          code: "no-access",
          message: "You are not signed in.",
        },
      },
      { status: 401 }
    );
  }

  const user = await dynamoDb
    .get({
      TableName: Table.User.tableName,
      Key: { email: session.user.email! },
    })
    .promise();

  if (!user.Item)
    return NextResponse.json(
      {
        error: {
          code: "stripe-error",
          message: "Could not create checkout session",
        },
      },
      { status: 500 }
    );

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.Item.stripeCustomerId!,
    line_items: [
      {
        price: body,
        quantity: 1,
      },
    ],
    success_url:
      process.env.NEXT_PUBLIC_WEBSITE_URL + `?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: process.env.NEXT_PUBLIC_WEBSITE_URL,
    subscription_data: {
      metadata: {
        userId: user.Item.id!,
        email: user.Item.email!,
        stripeCustomerId: user.Item.stripeCustomerId!,
      },
    },
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      {
        error: {
          code: "stripe-error",
          message: "Could not create checkout session",
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ session: checkoutSession }, { status: 200 });
}
