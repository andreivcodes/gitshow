import {
  contribSvg,
  SubscriptionPlan,
  UpdateUserEvent,
} from "@gitshow/gitshow-lib";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";
import { SQSEvent } from "aws-lambda";
import { AES, enc } from "crypto-js";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";
import { config } from "dotenv";

export const handler = async (event: SQSEvent) => {
  config();
  const result = [];

  for (const record of event.Records) {
    console.log(JSON.parse(record.body));

    const event = JSON.parse(record.body) as UpdateUserEvent;

    const u = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, event.email))
      .then(takeUniqueOrNull);

    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
      accessToken: AES.decrypt(
        event.twitterOAuthToken,
        process.env.TOKENS_ENCRYPT!
      ).toString(enc.Utf8),
      accessSecret: AES.decrypt(
        event.twitterOAuthTokenSecret,
        process.env.TOKENS_ENCRYPT!
      ).toString(enc.Utf8),
    });

    const bannerSvg = await contribSvg(
      event.githubUsername,
      event.theme,
      event.plan
    );

    const bannerJpeg = await sharp(Buffer.from(bannerSvg), { density: 500 })
      .jpeg()
      .toBuffer();

    await client.v1.updateAccountProfileBanner(bannerJpeg);

    await db
      .update(userTable)
      .set({ lastUpdateTimestamp: new Date() })
      .where(eq(userTable.email, event.email));

    console.log(`Updated ${event.githubUsername}`);
    result.push({ message: `Updated ${event.githubUsername}` });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
