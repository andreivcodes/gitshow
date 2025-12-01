import { config as dotenv_config } from "dotenv";
import express from "express";
import { TwitterApi } from "twitter-api-v2";
import { AvailableThemeNames, scrapeContributions, renderContribSvg } from "@gitshow/gitshow-lib";
import sharp from "sharp";
import schedule from "node-schedule";
import { db, RefreshInterval, Selectable, User, decryptToken, sql } from "@gitshow/db";

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

// Track active jobs for graceful shutdown
const activeJobs = new Set<string>();

// Schedule processing every minute
schedule.scheduleJob("* * * * *", async () => {
  // Use PostgreSQL advisory lock (atomic, multi-instance safe)
  const lockId = 123456789; // Arbitrary unique lock ID for job processing

  try {
    // Try to acquire lock (non-blocking)
    const lockResult = await db
      .selectFrom(sql`pg_try_advisory_lock(${lockId})`.as('lock'))
      .select(sql`pg_try_advisory_lock(${lockId})`.as('acquired'))
      .executeTakeFirst();

    if (!lockResult?.acquired) {
      console.log("Another instance is processing jobs, skipping...");
      return;
    }

    // Fetch up to 5 pending jobs
    const jobs = await db
      .selectFrom("jobQueue")
      .selectAll()
      .where("status", "=", "pending")
      .orderBy("createdAt", "asc")
      .limit(5)
      .execute();

    if (jobs.length > 0) {
      console.log(`Processing ${jobs.length} jobs.`);

      // Process jobs concurrently
      await Promise.all(
        jobs.map(async (job) => {
          activeJobs.add(job.userId);
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
          } finally {
            activeJobs.delete(job.userId);
          }
        })
      );
    }
  } catch (error) {
    console.error("Error in queue processing:", error);
  } finally {
    // Always release lock
    try {
      await db
        .selectFrom(sql`pg_advisory_unlock(${lockId})`.as('unlock'))
        .select(sql`pg_advisory_unlock(${lockId})`.as('released'))
        .execute();
    } catch (unlockError) {
      console.error("Failed to release advisory lock:", unlockError);
    }
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

async function updateUser(userId: string) {
  const user = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", userId)
    .executeTakeFirstOrThrow();

  const decryptedAccessToken = decryptToken(user.twitterOauthToken!, process.env.TOKENS_SECRET!);
  const decryptedAccessSecret = decryptToken(user.twitterOauthTokenSecret!, process.env.TOKENS_SECRET!);

  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: decryptedAccessToken,
    accessSecret: decryptedAccessSecret,
  });

  // Fetch current Twitter user info to update profile picture and username
  try {
    const twitterUser = await client.v1.verifyCredentials({
      include_email: false,
      skip_status: true,
    });
    
    const updates: any = {};
    
    // Update profile picture URL if it has changed
    if (twitterUser.profile_image_url_https) {
      const newProfilePictureUrl = twitterUser.profile_image_url_https.replace(
        "_normal.jpg",
        ".jpg"
      );
      
      if (newProfilePictureUrl !== user.twitterPicture) {
        updates.twitterPicture = newProfilePictureUrl;
        console.log(`Updated profile picture for user ${userId}`);
      }
    }
    
    // Update Twitter username (display name) if it has changed
    if (twitterUser.name && twitterUser.name !== user.twitterUsername) {
      updates.twitterUsername = twitterUser.name;
      console.log(`Updated Twitter display name for user ${userId}: ${user.twitterUsername} -> ${twitterUser.name}`);
    }
    
    // Update Twitter handle (@username) if it has changed
    if (twitterUser.screen_name && twitterUser.screen_name !== user.twitterTag) {
      updates.twitterTag = twitterUser.screen_name;
      console.log(`Updated Twitter handle for user ${userId}: @${user.twitterTag} -> @${twitterUser.screen_name}`);
    }
    
    // Apply all updates if any changes were detected
    if (Object.keys(updates).length > 0) {
      await db
        .updateTable("user")
        .where("id", "=", user.id)
        .set(updates)
        .execute();
    }
  } catch (error) {
    console.error(`Failed to fetch Twitter user info for ${userId}:`, error);
    // Continue with banner update even if profile update fails
  }

  const contributionData = await scrapeContributions(
    user.githubUsername!,
    {
      browserlessUrl: process.env.BROWSERLESS_URL!,
      browserlessToken: process.env.BROWSERLESS_TOKEN!,
    }
  );

  const bannerSvg = renderContribSvg(
    contributionData,
    user.theme as AvailableThemeNames,
    user.githubUsername!
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
const server = app.listen(PORT, () => {
  console.log(`Healthcheck is running at http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}, starting graceful shutdown...`);

  // Cancel scheduled jobs
  const jobs = schedule.scheduledJobs;
  Object.values(jobs).forEach(job => job.cancel());
  console.log("Cancelled all scheduled jobs");

  // Wait for active jobs to complete (max 30 seconds)
  const maxWait = 30000;
  const startTime = Date.now();

  while (activeJobs.size > 0 && Date.now() - startTime < maxWait) {
    console.log(`Waiting for ${activeJobs.size} jobs to complete...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (activeJobs.size > 0) {
    console.warn(`Forcing shutdown with ${activeJobs.size} jobs still running`);
  } else {
    console.log("All jobs completed successfully");
  }

  // Close HTTP server
  server.close(() => {
    console.log("HTTP server closed");
  });

  console.log("Graceful shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
