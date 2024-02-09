import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { UpdateUserEvent } from "./update_user";
import { db, userTable, lt } from "@gitshow/db";
import { config } from "dotenv";
import { NONE_PLAN } from "@gitshow/gitshow-lib";

const sqs = new AWS.SQS();

export async function handler() {
  config();

  const timestampThreshold = new Date();

  const users = await db
    .select({
      email: userTable.email,
      githubUsername: userTable.githubUsername,
      twitterOAuthToken: userTable.twitterOAuthToken,
      twitterOAuthTokenSecret: userTable.twitterOAuthTokenSecret,
      subscriptionType: userTable.subscriptionType,
      lastRefreshTimestamp: userTable.lastRefreshTimestamp,
      refreshInterval: userTable.refreshInterval,
      theme: userTable.theme,
    })
    .from(userTable)
    .where(lt(userTable.lastRefreshTimestamp, timestampThreshold));

  const usersToRefresh = users.filter(
    (u) =>
      u.lastRefreshTimestamp!.getTime() <
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
