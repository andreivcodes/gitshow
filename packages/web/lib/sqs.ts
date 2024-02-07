import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
} from "@gitshow/gitshow-lib";
import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import { Queue } from "sst/node/queue";
import { Table } from "sst/node/table";
import { prisma } from "@gitshow/db";

const dynamoDb = new DynamoDB.DocumentClient();

const sqs = new AWS.SQS();

export interface UpdateHeaderEvent {
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
}

export const queueJob = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Invalid user");
  }

  await sqs
    .sendMessage({
      QueueUrl: Queue.UpdateQueue.queueUrl,
      MessageBody: JSON.stringify({
        email: email,
        githubUsername: user.githubUsername,
        twitterOAuthToken: user.twitterOAuthToken,
        twitterOAuthTokenSecret: user.twitterOAuthTokenSecret,
        type: user.subscriptionType,
        theme: user.theme,
      } as UpdateHeaderEvent),
    })
    .promise();
};
