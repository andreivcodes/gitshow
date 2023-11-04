import "server-only";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "../../../../../db/src/index";
import { stripe } from "../../../../utils/stripeServer";

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

  const user = await db
    .selectFrom("users")
    .select(["users.stripeCustomerId", "users.email", "users.id"])
    .where("users.email", "=", session.user.email!)
    .execute();

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user[0].stripeCustomerId!,
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
        userId: user[0].id!,
        email: user[0].email!,
        stripeCustomerId: user[0].stripeCustomerId!,
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
