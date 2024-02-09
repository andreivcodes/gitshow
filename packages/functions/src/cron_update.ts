import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { UpdateUserEvent } from "./update_user";
import { db, userTable, lt } from "@gitshow/db";
import { config } from "dotenv";

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
      subscriptionPlan: userTable.subscriptionPlan,
      lastUpdateTimestamp: userTable.lastUpdateTimestamp,
      updateInterval: userTable.updateInterval,
      theme: userTable.theme,
    })
    .from(userTable)
    .where(lt(userTable.lastUpdateTimestamp, timestampThreshold));

  const usersToRefresh = users.filter(
    (u) =>
      u.lastUpdateTimestamp!.getTime() <
      timestampThreshold.getTime() + u.updateInterval * 60 * 60 * 1000
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
          plan: user.subscriptionPlan,
          theme: user.theme,
        } as UpdateUserEvent),
      })
      .promise();

    console.log(
      `Update queued for ${user.githubUsername} - ${user.subscriptionPlan} ${user.theme} ${user.updateInterval}h!`
    );
  }
}
