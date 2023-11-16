import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { UpdateUserEvent } from "./update_user";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";

const dynamoDb = new DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function handler() {
  const queryResult = await dynamoDb
    .query({
      TableName: Table.User.tableName,
      IndexName: "SubscriptionTypeIndex",
      KeyConditionExpression: "subscriptionType = :subscriptionTypeVal",
      ExpressionAttributeValues: { ":subscriptionTypeVal": "premium" },
      ProjectionExpression:
        "githubUsername, twitterOAuthToken, twitterOAuthTokenSecret",
    })
    .promise();

  const premiumUsers = queryResult.Items || [];

  console.log(`Updating ${premiumUsers.length} premium users.`);

  for (const user of premiumUsers) {
    await sqs
      .sendMessage({
        QueueUrl: Queue.UpdateQueue.queueUrl,
        MessageBody: JSON.stringify({
          githubUsername: user.githubUsername,
          twitterOAuthToken: user.twitterOAuthToken,
          twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
          type: user.subscriptionType,
          theme: user.theme,
        } as UpdateUserEvent),
      })
      .promise();

    console.log(`Update queued for ${user.githubUsername}!`);
  }
}
