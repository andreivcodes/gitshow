import Redis from "ioredis";
import { config as dotenv_config } from "dotenv";
import { PrismaClient, RefreshInterval } from "@prisma/client";
import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AES, enc } from "crypto-js";
import { AvailableThemeNames, contribSvg } from "@gitshow/gitshow-lib";
import sharp from "sharp";
import cron from "node-cron";

dotenv_config();

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

const app = express();

app.get("/", (_req, res) => {
  res.send("ok");
});

app.listen(3000, () => {
  console.log(`Healthcheck is running at http://localhost:3000`);
});

cron.schedule("0 */6 * * *", async () => {
  const timestampThreshold = new Date();

  const users = await prisma.user.findMany({
    where: { automaticallyUpdate: true, twitterAuthenticated: true, githubAuthenticated: true },
  });

  const usersToRefresh = users.filter(
    (u) =>
      u.lastUpdateTimestamp &&
      ((u.updateInterval == RefreshInterval.EVERY_DAY &&
        new Date(u.lastUpdateTimestamp).getTime() < timestampThreshold.getTime() + 24 * 60 * 60 * 1000) ||
        (u.updateInterval == RefreshInterval.EVERY_WEEK &&
          new Date(u.lastUpdateTimestamp).getTime() < timestampThreshold.getTime() + 168 * 60 * 60 * 1000) ||
        (u.updateInterval == RefreshInterval.EVERY_MONTH &&
          new Date(u.lastUpdateTimestamp).getTime() < timestampThreshold.getTime() + 720 * 60 * 60 * 1000)),
  );

  console.log(`Updating ${usersToRefresh.length} users.`);

  for (const user of usersToRefresh) {
    await redis.publish("update", JSON.stringify({ userId: user.id }));
  }
});

redis.subscribe("update", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
  }
});

redis.on("message", async (channel, message) => {
  console.log(`Got message ${message} on ${channel}`);
  const { userId }: { userId: string } = JSON.parse(message);

  await update_user({ userId });
});

const update_user = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });

  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: AES.decrypt(user.twitterOAuthToken!, process.env.TOKENS_ENCRYPT!).toString(enc.Utf8),
    accessSecret: AES.decrypt(user.twitterOAuthTokenSecret!, process.env.TOKENS_ENCRYPT!).toString(enc.Utf8),
  });

  const bannerSvg = await contribSvg(user.githubUsername!, user.theme as AvailableThemeNames, user.subscriptionPlan);

  const bannerJpeg = await sharp(Buffer.from(bannerSvg), { density: 500 }).jpeg().toBuffer();

  await client.v1.updateAccountProfileBanner(bannerJpeg);

  await prisma.user.update({ where: { id: user.id }, data: { lastUpdateTimestamp: new Date() } });
};
