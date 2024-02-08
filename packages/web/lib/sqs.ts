import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
} from "@gitshow/gitshow-lib";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";

const sqs = new AWS.SQS();

export interface UpdateHeaderEvent {
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
}

export const queueJob = async (email: string) => {
  const u = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .then(takeUniqueOrNull);

  if (!u) {
    throw new Error("Invalid user");
  }

  await sqs
    .sendMessage({
      QueueUrl: Queue.UpdateQueue.queueUrl,
      MessageBody: JSON.stringify({
        email: email,
        githubUsername: u.githubUsername,
        twitterOAuthToken: u.twitterOAuthToken,
        twitterOAuthTokenSecret: u.twitterOAuthTokenSecret,
        type: u.subscriptionType,
        theme: u.theme,
      } as UpdateHeaderEvent),
    })
    .promise();
};
