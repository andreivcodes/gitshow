import { AvailableThemeNames } from "@gitshow/svg-gen";
import { DynamoDB } from "aws-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import Stripe from "stripe";
import { updateUser } from "../../../lib/db";
import { FREE_PLAN, PREMIUM_PLAN, STANDARD_PLAN } from "../../../lib/plans";
import { queueUpdateHeader } from "../../../lib/sqs";
import { stripe } from "../../../lib/stripeServer";

interface Plan {
	type: "free" | "standard" | "premium";
	theme?: AvailableThemeNames;
}

export const config = {
	api: {
		bodyParser: false,
	},
};

const dynamoDb = new DynamoDB.DocumentClient();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const webhookSecret: string = Config.STRIPE_WEBHOOK_SECRET;

	console.log("[STRIPE] Request");
	try {
		const sig = req.headers["stripe-signature"] as string;

		let event: Stripe.Event;

		console.log("[STRIPE] Construct event");
		try {
			event = stripe.webhooks.constructEvent(
				Buffer.from(req.body),
				sig,
				webhookSecret,
			);
		} catch (error) {
			throw new Error(`[STRIPE] Stripe webhook error: ${error}`);
		}

		console.log("[STRIPE] Event", event.type);

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
			throw new Error("[STRIPE] Invalid customer");
		}

		const user = users.Items[0];

		switch (event.type) {
			case "customer.subscription.created": {
				const e = event as Stripe.CustomerSubscriptionCreatedEvent;

				let plan: Plan = { type: "free", theme: "classic" };

				switch (e.data.object.items.data[0].plan.id) {
					case FREE_PLAN:
						plan = { type: "free", theme: "classic" };
						break;
					case STANDARD_PLAN:
						plan = { type: "standard", theme: "githubDark" };
						break;
					case PREMIUM_PLAN:
						plan = { type: "premium", theme: user.theme };
						break;
					default:
						break;
				}

				try {
					console.log(`Update user ${user.email} to ${plan.type}`);
					await updateUser(user.email, {
						subscriptionType: plan.type,
						theme: plan.theme,
						lastSubscriptionTimestamp: new Date().toISOString(),
					});
				} catch (error) {
					throw new Error(`[STRIPE] Failed to update user ${error}`);
				}

				await queueUpdateHeader(user.email);

				break;
			}

			case "customer.subscription.deleted":
				try {
					console.log(`Delete user ${user.email}`);
					await updateUser(user.email, {
						theme: "classic",
						subscriptionType: "none",
					});

					await queueUpdateHeader(user.email);
				} catch (error) {
					throw new Error(`[STRIPE] Failed to delete user ${error}`);
				}

				break;

			default:
				console.log(`🤷‍♀️ Unhandled event type: ${event.type}`);
				break;
		}
	} catch (error) {
		console.log("Subscriptions webhook error:", error);
		return res.status(400).json({
			error: "Subscriptions webhook error.",
			e: (error as Error).message,
		});
	}

	res.status(200).json({ received: true });
}
