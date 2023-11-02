import { AES, enc } from "crypto-js";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";
import { contribSvg } from "./utils/contribution_svg";
import { db } from "../../db/src/index";
import { users } from "../../db/src/schema";
import { eq } from "drizzle-orm";

export async function handler() {
  const freeUsers = await db
    .select()
    .from(users)
    .where(eq(users.isFree, true))
    .execute();

  for (const user of freeUsers) {
    const githubUsername = user.githubUsername ?? "";
    const theme = "githubDark";

    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY ?? "",
      appSecret: process.env.TWITTER_CONSUMER_SECRET ?? "",
      accessToken: AES.decrypt(
        user.twitterOAuthToken ?? "",
        process.env.TOKENS_ENCRYPT ?? ""
      ).toString(enc.Utf8),
      accessSecret: AES.decrypt(
        user.twitterOAuthTokenSecret ?? "",
        process.env.TOKENS_ENCRYPT ?? ""
      ).toString(enc.Utf8),
    });

    const bannerSvg = await contribSvg(githubUsername, theme);

    const bannerPng = await sharp(Buffer.from(bannerSvg), { density: 500 })
      .png()
      .toBuffer();

    await client.v1.updateAccountProfileBanner(bannerPng);
  }

  return {
    statusCode: 200,
  };
}
