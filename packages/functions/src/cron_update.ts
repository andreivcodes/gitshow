import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import { Queue } from "sst/node/queue";
import { Table } from "sst/node/table";
import { UpdateUserEvent } from "./update_user";

const dynamoDb = new DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function handler() {
  const timestampThreshold = new Date().getTime();
  const queryResult = await dynamoDb
    .query({
      TableName: Table.User.tableName,
      IndexName: "LastRefreshTimestampIndex",
      KeyConditionExpression: "LastRefreshTimestampIndex < :timestamp",
      ExpressionAttributeValues: { ":timestamp": timestampThreshold },
      ProjectionExpression:
        "email, githubUsername, twitterOAuthToken, twitterOAuthTokenSecret, subscriptionType",
    })
    .promise();

  const users = queryResult.Items || [];

  const usersToRefresh = users.filter(
    (u) =>
      u.lastRefreshTimestamp <
      timestampThreshold + u.refreshInterval * 60 * 60 * 1000
  );

  console.log(`Updating ${usersToRefresh.length} users.`);

  for (const user of usersToRefresh) {
    await sqs
      .sendMessage({
        QueueUrl: Queue.UpdateQueue.queueUrl,
        MessageBody: JSON.stringify({
          email: user.email,
          githubUsername: user.githubUsername,
          twitterOAuthToken: user.twitterOAuthToken,
          twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
          type: user.subscriptionType,
          theme: user.theme,
        } as UpdateUserEvent),
      })
      .promise();

    console.log(
      `Update queued for ${user.githubUsername} - ${user.subscriptionType} ${user.theme} ${user.refreshInterval}h!`
    );
  }
}
