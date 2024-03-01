import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { SubscriptionPlan, UpdateUserEvent, db } from "@gitshow/db";

const sqs = new AWS.SQS();

export const queueJob = async (email: string, bypassRatelimit?: boolean) => {

  const u = await db.selectFrom("user").selectAll().where("email", "=", email).executeTakeFirst();

  if (!u) {
    throw new Error("Invalid user");
  }

  const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const timeDifferenceInMillis =
    currentDate.getTime() - new Date(u.lastUpdateTimestamp ?? 0).getTime();

  if (
    u.subscriptionPlan == SubscriptionPlan.FREE &&
    timeDifferenceInMillis < oneMonthInMillis &&
    !bypassRatelimit
  )
    return;

  await sqs
    .sendMessage({
      QueueUrl: Queue.UpdateQueue.queueUrl,
      MessageBody: JSON.stringify({
        email: email,
        githubUsername: u.githubUsername,
        twitterOAuthToken: u.twitterOAuthToken,
        twitterOAuthTokenSecret: u.twitterOAuthTokenSecret,
        plan: u.subscriptionPlan,
        theme: u.theme,
      } as UpdateUserEvent),
    })
    .promise();
};
