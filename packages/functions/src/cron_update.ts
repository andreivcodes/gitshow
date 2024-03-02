import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { config } from "dotenv";
import { RefreshInterval, UpdateUserEvent, db } from "@gitshow/db";

const sqs = new AWS.SQS();

export async function handler() {
  config();

  const timestampThreshold = new Date();

  const users = await db.selectFrom("user")
    .selectAll()
    .where('automaticallyUpdate', '=', true)
    .where('twitterAuthenticated', '=', true)
    .where('githubAuthenticated', "=", true)
    .execute();


  const usersToRefresh = users.filter(
    (u) =>
      u.lastUpdateTimestamp &&
      ((u.updateInterval == RefreshInterval.EVERY_DAY && (new Date(u.lastUpdateTimestamp).getTime() <
        timestampThreshold.getTime() + 24 * 60 * 60 * 1000)) ||
        (u.updateInterval == RefreshInterval.EVERY_WEEK && (new Date(u.lastUpdateTimestamp).getTime() <
          timestampThreshold.getTime() + 168 * 60 * 60 * 1000)) ||
        (u.updateInterval == RefreshInterval.EVERY_MONTH && (new Date(u.lastUpdateTimestamp).getTime() <
          timestampThreshold.getTime() + 720 * 60 * 60 * 1000)))
  );

  console.log(`Updating ${usersToRefresh.length} users.`);

  for (const user of usersToRefresh) {
    sqs.sendMessage({
      QueueUrl: Queue.UpdateQueue.queueUrl,
      MessageBody: JSON.stringify({
        email: user.email,
        githubUsername: user.githubUsername,
        twitterOAuthToken: user.twitterOAuthToken,
        twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
        plan: user.subscriptionPlan,
        theme: user.theme,
      } as UpdateUserEvent),
    });

    console.log(
      `Update queued for ${user.githubUsername} - ${user.subscriptionPlan} ${user.theme} ${user.updateInterval}min!`
    );
  }
}
