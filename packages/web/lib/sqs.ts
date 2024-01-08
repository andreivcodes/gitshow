import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
} from "@gitshow/gitshow-lib";
import AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";
import { Queue } from "sst/node/queue";
import { Table } from "sst/node/table";

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
  const user = await dynamoDb
    .get({
      TableName: Table.User.tableName,
      Key: { email },
    })
    .promise();

  if (!user.Item) {
    throw new Error("Invalid user");
  }

  await sqs
    .sendMessage({
      QueueUrl: Queue.UpdateQueue.queueUrl,
      MessageBody: JSON.stringify({
        githubUsername: user.Item.githubUsername,
        twitterOAuthToken: user.Item.twitterOAuthToken,
        twitterOAuthTokenSecret: user.Item.twitterOAuthTokenSecret,
        type: user.Item.subscriptionType,
        theme: user.Item.theme,
      } as UpdateHeaderEvent),
    })
    .promise();
};
