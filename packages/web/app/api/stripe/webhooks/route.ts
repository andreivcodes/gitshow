import "server-only";

import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { Config } from "sst/node/config";
import { stripe } from "../../../../utils/stripeServer";
import { Queue } from "sst/node/queue";
import AWS from "aws-sdk";
import { AvailableThemeNames } from "../../../../utils/themes";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";
import { updateUser } from "../../../../utils/db";

const dynamoDb = new DynamoDB.DocumentClient();

const sqs = new AWS.SQS();

export interface UpdateUserEvent {
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  type: "free" | "standard" | "premium";
  theme: AvailableThemeNames;
}

interface Plan {
  type: "free" | "standard" | "premium";
  theme: AvailableThemeNames;
}

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

    const users = await dynamoDb
      .query({
        TableName: Table.User.tableName,
        IndexName: "StripeCustomerIndex",
        KeyConditionExpression: "stripeCustomerId = :stripeCustomerId",
        ExpressionAttributeValues: {
          ":stripeCustomerId": subscription.customer.toString(),
        },
      })
      .promise();

    if (users.Count === 0 || !users.Items) {
      throw new Error("User not found");
    }

    const user = users.Items[0];

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        let e = event as Stripe.CustomerSubscriptionCreatedEvent;

        let plan: Plan = { type: "free", theme: "normal" };

        switch (e.data.object.items.data[0].plan.id) {
          case "price_1O7OaXHNuNMEdXGMt3aabIZx":
            plan = { type: "standard", theme: "githubDark" };
            break;
          case "price_1O7ObLHNuNMEdXGMc8dcCRW9":
            plan = { type: "premium", theme: "blue" };
            break;
          case "price_1O8rSiHNuNMEdXGMHyQzaTsh":
            plan = { type: "free", theme: "normal" };
            break;
          default:
            break;
        }

        try {
          await updateUser(user.email, {
            subscriptionType: plan.type,
            lastSubscriptionTimestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to update user:", error);
        }

        await sqs
          .sendMessage({
            QueueUrl: Queue.UpdateQueue.queueUrl,
            MessageBody: JSON.stringify({
              githubUsername: user.githubUsername,
              twitterOAuthToken: user.twitterOAuthToken,
              twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
              type: plan.type,
              theme: plan.theme,
            } as UpdateUserEvent),
          })
          .promise();

        break;

      case "customer.subscription.deleted":
        try {
          await dynamoDb
            .delete({
              TableName: Table.User.tableName,
              Key: { email: user.email },
            })
            .promise();
        } catch (error) {
          console.error("Failed to delete user:", error);
        }

        break;

      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ An error occurred: ${errorMessage}`);

    return NextResponse.json(
      {
        error: {
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
};

export { webhookHandler as POST };
