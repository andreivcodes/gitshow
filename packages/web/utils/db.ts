import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";

export interface UserUpdateAttributes {
  name?: string;
  stripeCustomerId?: string;

  githubId?: string;
  githubUsername?: string;
  githubToken?: string;

  twitterId?: string;
  twitterUsername?: string;
  twitterOAuthToken?: string;
  twitterOAuthTokenSecret?: string;

  subscriptionType?: string;
  lastSubscriptionTimestamp?: string;
}
const dynamoDb = new DynamoDB.DocumentClient();

export const updateUser = async (
  email: string,
  updateData: UserUpdateAttributes
): Promise<void> => {
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: Table.User.tableName,
    Key: { email },
    UpdateExpression: "set ",
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {},
  };

  let updateExpressions: string[] = [];

  Object.keys(updateData).forEach((key) => {
    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;

    updateExpressions.push(`${attributeName} = ${attributeValue}`);
    params.ExpressionAttributeNames![attributeName] = key;
    params.ExpressionAttributeValues![attributeValue] =
      updateData[key as keyof UserUpdateAttributes];
  });

  params.UpdateExpression += updateExpressions.join(", ");

  try {
    await dynamoDb.update(params).promise();
    console.log("User updated successfully.");
  } catch (error) {
    console.error("Error updating user:", error);
  }
};
