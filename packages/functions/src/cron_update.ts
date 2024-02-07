import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import { Queue } from "sst/node/queue";
import { UpdateUserEvent } from "./update_user";
import { NONE_PLAN } from "../../../libs/gitshow-lib/src";
import { prisma } from "@gitshow/db";

const dynamoDb = new DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function handler() {
  const timestampThreshold = new Date();

  const users = await prisma.user.findMany({
    where: { lastRefreshTimestamp: { lt: timestampThreshold } },
    select: {
      email: true,
      githubUsername: true,
      twitterOAuthToken: true,
      twitterOAuthTokenSecret: true,
      subscriptionType: true,
      lastRefreshTimestamp: true,
      refreshInterval: true,
      theme: true,
    },
  });

  const usersToRefresh = users.filter(
    (u) =>
      u.lastRefreshTimestamp.getTime() <
        timestampThreshold.getTime() + u.refreshInterval * 60 * 60 * 1000 &&
      u.subscriptionType != NONE_PLAN
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
