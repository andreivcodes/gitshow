import { AES, enc } from "crypto-js";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";
import { contribSvg } from "./utils/contribution_svg";
import { db } from "../../db/src/index";
import { Config } from "sst/node/config";

export async function handler() {
  const freeUsers = await db
    .selectFrom("users")
    .select([
      "users.githubUsername",
      "users.twitterOAuthToken",
      "users.twitterOAuthTokenSecret",
    ])
    .where("users.isFree", "=", true)
    .execute();

  console.log(`Updating ${freeUsers.length} free users.`);

  for (const user of freeUsers) {
    const githubUsername = user.githubUsername ?? "";
    const theme = "dracula";

    const client = new TwitterApi({
      appKey: Config.TWITTER_CONSUMER_KEY,
      appSecret: Config.TWITTER_CONSUMER_SECRET,
      accessToken: AES.decrypt(
        user.twitterOAuthToken ?? "",
        Config.TOKENS_ENCRYPT
      ).toString(enc.Utf8),
      accessSecret: AES.decrypt(
        user.twitterOAuthTokenSecret ?? "",
        Config.TOKENS_ENCRYPT
      ).toString(enc.Utf8),
    });

    const bannerSvg = await contribSvg(githubUsername, theme, "free");

    const bannerPng = await sharp(Buffer.from(bannerSvg), { density: 500 })
      .png()
      .toBuffer();

    await client.v1.updateAccountProfileBanner(bannerPng);

    console.log(`Updated ${user.githubUsername}`);
  }
}
