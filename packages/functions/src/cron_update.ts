import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { config } from "dotenv";
import { UpdateUserEvent } from "@gitshow/gitshow-lib";
import { db } from "@gitshow/db";

const sqs = new AWS.SQS();

export async function handler() {
  config();

  const timestampThreshold = new Date();

  const users = await db.selectFrom("user").selectAll()
    .where((eb) => eb.and([
      eb('automaticallyUpdate', '=', true),
      eb('twitterAuthenticated', '=', true),
      eb('githubAuthenticated', "=", true)
    ])).execute();


  const usersToRefresh = users.filter(
    (u) =>
      u.lastUpdateTimestamp!.getTime() <
      timestampThreshold.getTime() + u.updateInterval * 60 * 60 * 1000
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
