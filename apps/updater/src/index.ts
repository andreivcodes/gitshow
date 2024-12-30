import { config as dotenv_config } from "dotenv";
import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AvailableThemeNames, contribSvg } from "@gitshow/gitshow-lib";
import sharp from "sharp";
import schedule from "node-schedule";
import AES from "crypto-js/aes";
import CryptoJS from "crypto-js";
import { db, RefreshInterval, Selectable, User } from "@gitshow/db";

dotenv_config();

// Validate environment variables
const requiredEnvVars = [
  "TOKENS_SECRET",
  "TWITTER_CONSUMER_KEY",
  "TWITTER_CONSUMER_SECRET",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Schedule event creation once an hour
schedule.scheduleJob("0 * * * *", async () => {
  try {
    const users = await db
      .selectFrom("user")
      .where("automaticallyUpdate", "=", true)
      .where("twitterAuthenticated", "=", true)
      .where("githubAuthenticated", "=", true)
      .selectAll()
      .execute();

    const usersToRefresh = users.filter(shouldRefreshUser);

    console.log(`Creating update events for ${usersToRefresh.length} users.`);

    for (const user of usersToRefresh) {
      console.log(`Creating update event for ${user.id}`);

      await db.insertInto("jobQueue").values({ userId: user.id }).execute();
    }
  } catch (error) {
    console.error("Error in event creation job:", error);
  }
});

// Mutex flag to ensure atomic processing
let isProcessing = false;

// Schedule processing every minute
schedule.scheduleJob("* * * * *", async () => {
  if (isProcessing) {
    // If the queue is already being processed, skip this iteration
    return;
  }

  // Acquire the mutex
  isProcessing = true;

  try {
    const job = await db
      .selectFrom("jobQueue")
      .selectAll()
      .where("status", "=", "pending")
      .orderBy("status asc")
      .executeTakeFirst();

    if (job) {
      try {
        await updateUser(job.userId);
        console.log(`Updated ${job.userId}`);

        await db
          .updateTable("jobQueue")
          .where("id", "=", job.id)
          .set({ status: "processed" })
          .execute();
      } catch (e) {
        console.error(`Failed to update ${job.userId} - ${e}`);

        await db
          .updateTable("jobQueue")
          .where("id", "=", job.id)
          .set({ status: "failed" })
          .execute();
      }
    }
  } catch (error) {
    console.error("Error in queue processing:", error);
  } finally {
    // Release the mutex
    isProcessing = false;
  }
});

function shouldRefreshUser(user: Selectable<User>): boolean {
  if (!user.lastUpdateTimestamp) return true;

  const now = new Date();
  const lastUpdate = new Date(user.lastUpdateTimestamp);
  const timeDiff = now.getTime() - lastUpdate.getTime();

  switch (user.updateInterval) {
    case RefreshInterval.EVERY_DAY:
      return timeDiff > 24 * 60 * 60 * 1000;
    case RefreshInterval.EVERY_WEEK:
      return timeDiff > 7 * 24 * 60 * 60 * 1000;
    case RefreshInterval.EVERY_MONTH:
      return timeDiff > 30 * 24 * 60 * 60 * 1000;
    default:
      return false;
  }
}

function decryptToken(encryptedToken: string): string {
  const decrypted = AES.decrypt(encryptedToken, process.env.TOKENS_SECRET!);
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

async function updateUser(userId: string) {
  const user = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  const decryptedAccessToken = decryptToken(user.twitterOauthToken!);
  const decryptedAccessSecret = decryptToken(user.twitterOauthTokenSecret!);

  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: decryptedAccessToken,
    accessSecret: decryptedAccessSecret,
  });

  const bannerSvg = await contribSvg(
    user.githubUsername!,
    user.theme as AvailableThemeNames
  );
  const bannerJpeg = await sharp(Buffer.from(bannerSvg), { density: 500 })
    .jpeg()
    .toBuffer();

  await client.v1.updateAccountProfileBanner(bannerJpeg);

  await db
    .updateTable("user")
    .where("id", "=", user.id)
    .set({ lastUpdateTimestamp: new Date() })
    .execute();
}

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Healthcheck is running at http://localhost:${PORT}/health`);
});
