import { config as dotenv_config } from "dotenv";
import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AvailableThemeNames, contribSvg } from "@gitshow/gitshow-lib";
import sharp from "sharp";
import schedule from "node-schedule";
import { PrismaClient, RefreshInterval } from "@prisma/client"
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";

dotenv_config();

const prisma = new PrismaClient();

type Message = {
  userId: string;
};

async function processQueue() {
  while (true) {
    const message = await prisma.queue.findFirst({
      where: { status: "pending" },
      orderBy: { createdAt: 'asc' }
    });

    if (message) {
      try {
        await update_user({ userId: message.userId });
        console.log(`Updated ${message.userId}`);

        await prisma.queue.update({
          where: { id: message.id },
          data: { status: "processed" }
        });
      } catch (e) {
        console.log(`Failed to update ${message.userId} - ${e}`);
        await prisma.queue.update({
          where: { id: message.id },
          data: { status: "failed" }
        });
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before checking again
    }
  }
}

processQueue()
  .then(() => console.log("Queue processing started!"))
  .catch((err) => {
    console.error("Error starting queue processing:", err);
    process.exit(1);
  });

schedule.scheduleJob("0 */6 * * *", async () => {
  const users = await prisma.user.findMany({
    where: {
      automaticallyUpdate: true,
      twitterAuthenticated: true,
      githubAuthenticated: true,
    },
  });

  const usersToRefresh = users.filter(
    (u) =>
      u.lastUpdateTimestamp &&
      ((u.updateInterval == RefreshInterval.EVERY_DAY &&
        new Date(u.lastUpdateTimestamp).getTime() < new Date().getTime() + 24 * 60 * 60 * 1000) ||
        (u.updateInterval == RefreshInterval.EVERY_WEEK &&
          new Date(u.lastUpdateTimestamp).getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000) ||
        (u.updateInterval == RefreshInterval.EVERY_MONTH &&
          new Date(u.lastUpdateTimestamp).getTime() < new Date().getTime() + 30 * 24 * 60 * 60 * 1000)),
  );

  console.log(`Updating ${usersToRefresh.length} users.`);

  for (const user of usersToRefresh) {
    console.log(`Request update for ${user.id}`);

    const message: Message = {
      userId: user.id,
    };

    await prisma.queue.create({
      data: { userId: message.userId }
    });
  }
});

const update_user = async ({ userId }: { userId: string }) => {
  const user = await prisma.user.findFirstOrThrow({ where: { id: userId } });

  var accessToken = AES.decrypt(user.twitterOAuthToken!, process.env.TOKENS_SECRET!);
  var decryptedAccessToken = JSON.parse(accessToken.toString(CryptoJS.enc.Utf8));

  var accessSecret = AES.decrypt(user.twitterOAuthTokenSecret!, process.env.TOKENS_SECRET!);
  var decryptedAccessSecret = JSON.parse(accessSecret.toString(CryptoJS.enc.Utf8));

  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: decryptedAccessToken,
    accessSecret: decryptedAccessSecret,
  });

  const bannerSvg = await contribSvg(user.githubUsername!, user.theme as AvailableThemeNames);

  const bannerJpeg = await sharp(Buffer.from(bannerSvg), { density: 500 }).jpeg().toBuffer();

  await client.v1.updateAccountProfileBanner(bannerJpeg);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastUpdateTimestamp: new Date() },
  });
};

const app = express();

app.get("/", (_req, res) => {
  res.send("OK");
});

app.listen(3001, () => {
  console.log(`Healthcheck is running at http://localhost:3000`);
});
