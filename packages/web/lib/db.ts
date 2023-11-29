import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";

export interface UserUpdateAttributes {
	name?: string;
	stripeCustomerId?: string;

	githubAuthenticated?: string;
	twitterAuthenticated?: string;

	githubId?: string;
	githubUsername?: string;
	githubToken?: string;

	twitterId?: string;
	twitterUsername?: string;
	twitterTag?: string;
	twitterPicutre?: string;
	twitterOAuthToken?: string;
	twitterOAuthTokenSecret?: string;

	theme?: string;
	subscriptionType?: string;
	lastSubscriptionTimestamp?: string;
}
const dynamoDb = new DynamoDB.DocumentClient();

export const updateUser = async (
	email: string,
	updateData: UserUpdateAttributes,
): Promise<void> => {
	const params: DynamoDB.DocumentClient.UpdateItemInput = {
		TableName: Table.User.tableName,
		Key: { email },
		UpdateExpression: "set ",
		ExpressionAttributeNames: {},
		ExpressionAttributeValues: {},
	};

	const updateExpressions: string[] = [];

	for (const key of Object.keys(updateData)) {
		const attributeName = `#${key}`;
		const attributeValue = `:${key}`;

		if (params.ExpressionAttributeNames && params.ExpressionAttributeValues) {
			updateExpressions.push(`${attributeName} = ${attributeValue}`);
			params.ExpressionAttributeNames[attributeName] = key;
			params.ExpressionAttributeValues[attributeValue] =
				updateData[key as keyof UserUpdateAttributes];
		}
	}

	params.UpdateExpression += updateExpressions.join(", ");

	try {
		await dynamoDb.update(params).promise();
		console.log("User updated successfully.");
	} catch (error) {
		console.error("Error updating user:", error);
	}
};
