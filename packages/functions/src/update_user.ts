import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  contribSvg,
} from "@gitshow/gitshow-lib";
import { prisma } from "@gitshow/db";
import { SQSEvent } from "aws-lambda";
import { AES, enc } from "crypto-js";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";

export interface UpdateUserEvent {
  email: string;
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
}

export const handler = async (event: SQSEvent) => {
  const result = [];

  for (const record of event.Records) {
    console.log(JSON.parse(record.body));

    const {
      email,
      githubUsername,
      twitterOAuthToken,
      twitterOAuthTokenSecret,
      type,
      theme,
    } = JSON.parse(record.body) as UpdateUserEvent;

    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
      accessToken: AES.decrypt(
        twitterOAuthToken,
        process.env.TOKENS_ENCRYPT!
      ).toString(enc.Utf8),
      accessSecret: AES.decrypt(
        twitterOAuthTokenSecret,
        process.env.TOKENS_ENCRYPT!
      ).toString(enc.Utf8),
    });

    const bannerSvg = await contribSvg(githubUsername, theme, type);

    const bannerPng = await sharp(Buffer.from(bannerSvg), { density: 500 })
      .png()
      .toBuffer();

    await client.v1.updateAccountProfileBanner(bannerPng);

    await prisma.user.update({
      where: { email },
      data: { lastRefreshTimestamp: new Date() },
    });

    console.log(`Updated ${githubUsername}`);
    result.push({ message: `Updated ${githubUsername}` });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
