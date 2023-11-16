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
      ExpressionAttributeValues: { ":subscriptionTypeVal": "standard" },
      ProjectionExpression:
        "githubUsername, twitterOAuthToken, twitterOAuthTokenSecret",
    })
    .promise();

  const standardUsers = queryResult.Items || [];

  console.log(`Updating ${standardUsers.length} standard users.`);

  for (const user of standardUsers) {
    await sqs
      .sendMessage({
        QueueUrl: Queue.UpdateQueue.queueUrl,
        MessageBody: JSON.stringify({
          githubUsername: user.githubUsername,
          twitterOAuthToken: user.twitterOAuthToken,
          twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
          type: user.subscriptionType,
          theme: "githubDark",
        } as UpdateUserEvent),
      })
      .promise();

    console.log(`Update queued for ${user.githubUsername}!`);
  }
}
