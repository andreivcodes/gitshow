import { config as dotenv_config } from "dotenv";
import { PrismaClient, RefreshInterval } from "@prisma/client";
import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AES, enc } from "crypto-js";
import { AvailableThemeNames, contribSvg } from "@gitshow/gitshow-lib";
import sharp from "sharp";
import schedule from "node-schedule";
import amqplib from "amqplib";

dotenv_config();

let rbmq_conn: amqplib.Connection | undefined;
let rbmq_ch: amqplib.Channel | undefined;

const QUEUE_NAME = "update";

type Message = {
  userId: string;
};

async function setupQueue() {
  rbmq_conn = await amqplib.connect(process.env.RABBITMQ_URL!);
  rbmq_ch = await rbmq_conn.createChannel();
  await rbmq_ch.assertQueue(QUEUE_NAME);

  rbmq_ch.consume(QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString()) as Message;

      await update_user(message)
        .then(() => {
          console.log(`Updated ${message.userId}`);
          rbmq_ch!.ack(msg);
        })
        .catch((e) => {
          console.log(`Failed to update ${message.userId} - ${e}`);
          rbmq_ch!.nack(msg);
        });
    }
  });
}

setupQueue()
  .then(() => console.log("RabbitMQ set up!"))
  .catch((err) => {
    console.error("Error setting up RabbitMQ:", err);
    process.exit(1);
  });

schedule.scheduleJob("0 */6 * * *", async () => {
  const prisma = new PrismaClient();

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

    if (rbmq_ch) rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
  }
  prisma.$disconnect();
});

const update_user = async ({ userId }: { userId: string }) => {
  const prisma = new PrismaClient();

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

  await prisma.user.update({
    where: { id: user.id },
    data: { lastUpdateTimestamp: new Date() },
  });

  prisma.$disconnect();
};

const app = express();

app.get("/", (_req, res) => {
  res.send("OK");
});

app.listen(3000, () => {
  console.log(`Healthcheck is running at http://localhost:3000`);
});
