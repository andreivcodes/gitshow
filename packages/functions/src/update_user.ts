import { SQSEvent } from "aws-lambda";
import { AES, enc } from "crypto-js";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";
import { Config } from "sst/node/config";
import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  contribSvg,
} from "@gitshow/svg-gen";

export interface UpdateUserEvent {
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  type: AvailableSubscriptionTypes;
  theme: AvailableThemeNames;
}

export const handler = async (event: SQSEvent) => {
  let result = [];

  for (const record of event.Records) {
    console.log(JSON.parse(record.body));

    const {
      githubUsername,
      twitterOAuthToken,
      twitterOAuthTokenSecret,
      type,
      theme,
    } = JSON.parse(record.body) as UpdateUserEvent;

    const client = new TwitterApi({
      appKey: Config.TWITTER_CONSUMER_KEY!,
      appSecret: Config.TWITTER_CONSUMER_SECRET!,
      accessToken: AES.decrypt(
        twitterOAuthToken,
        Config.TOKENS_ENCRYPT
      ).toString(enc.Utf8),
      accessSecret: AES.decrypt(
        twitterOAuthTokenSecret,
        Config.TOKENS_ENCRYPT
      ).toString(enc.Utf8),
    });

    const bannerSvg = await contribSvg(githubUsername, theme, type);

    const bannerPng = await sharp(Buffer.from(bannerSvg), { density: 500 })
      .png()
      .toBuffer();

    await client.v1.updateAccountProfileBanner(bannerPng);

    console.log(`Updated ${githubUsername}`);
    result.push({ message: `Updated ${githubUsername}` });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
