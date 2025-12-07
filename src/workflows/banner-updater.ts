import { sleep, FatalError } from "workflow";
import { TwitterApi } from "twitter-api-v2";
import { scrapeContributions, renderSvg } from "@/lib/contributions";
import { type ThemeName, RefreshInterval } from "@/lib/schemas";
import sharp from "sharp";
import { db, decryptToken } from "@/lib/db";

/**
 * Long-running workflow that continuously checks for users needing banner updates.
 * Runs forever with 1-hour sleep intervals between checks.
 *
 * IMPORTANT: This workflow function must be deterministic - it only orchestrates
 * step functions and uses sleep for delays. All side effects happen in steps.
 */
export async function bannerUpdaterLoop() {
  "use workflow";

  while (true) {
    // Step 1: Get list of user IDs that need updating
    const userIds = await getUsersNeedingUpdate();

    // Step 2: Process each user as a separate step (allows individual retries)
    for (const userId of userIds) {
      await updateUserBanner(userId);
    }

    // Sleep for 1 hour before next check
    await sleep("1 hour");
  }
}

/**
 * Step: Query users that need their banner updated.
 * Returns an array of user IDs to process.
 */
async function getUsersNeedingUpdate(): Promise<string[]> {
  "use step";

  const users = await db
    .selectFrom("user")
    .where("automaticallyUpdate", "=", true)
    .where("twitterAuthenticated", "=", true)
    .where("githubAuthenticated", "=", true)
    .select(["id", "lastUpdateTimestamp", "updateInterval"])
    .execute();

  const now = Date.now();

  const usersToRefresh = users.filter((user) => {
    if (!user.lastUpdateTimestamp) return true;

    const lastUpdate = new Date(user.lastUpdateTimestamp).getTime();
    const timeDiff = now - lastUpdate;

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
  });

  console.log(`[BannerUpdater] Found ${usersToRefresh.length} users needing update`);

  return usersToRefresh.map((u) => u.id);
}

/**
 * Step: Update a single user's Twitter banner with their GitHub contributions.
 * Each user update is a separate step, allowing individual retries on failure.
 *
 * Throws FatalError for permanent failures (invalid tokens, user not found).
 * Regular errors will be automatically retried.
 */
async function updateUserBanner(userId: string): Promise<void> {
  "use step";

  const user = await db.selectFrom("user").selectAll().where("id", "=", userId).executeTakeFirst();

  if (!user) {
    throw new FatalError(`User ${userId} not found`);
  }

  if (!user.twitterOauthToken || !user.twitterOauthTokenSecret) {
    throw new FatalError(`User ${userId} missing Twitter tokens`);
  }

  if (!user.githubUsername) {
    throw new FatalError(`User ${userId} missing GitHub username`);
  }

  const decryptedAccessToken = decryptToken(user.twitterOauthToken, process.env.TOKENS_SECRET!);
  const decryptedAccessSecret = decryptToken(
    user.twitterOauthTokenSecret,
    process.env.TOKENS_SECRET!
  );

  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY!,
    appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    accessToken: decryptedAccessToken,
    accessSecret: decryptedAccessSecret,
  });

  // Update Twitter profile info if changed
  try {
    const twitterUser = await client.v1.verifyCredentials({
      include_email: false,
      skip_status: true,
    });

    const updates: Record<string, string> = {};

    if (twitterUser.profile_image_url_https) {
      const newProfilePictureUrl = twitterUser.profile_image_url_https.replace(
        "_normal.jpg",
        ".jpg"
      );

      if (newProfilePictureUrl !== user.twitterPicture) {
        updates.twitterPicture = newProfilePictureUrl;
        console.log(`[BannerUpdater] Updated profile picture for user ${userId}`);
      }
    }

    if (twitterUser.name && twitterUser.name !== user.twitterUsername) {
      updates.twitterUsername = twitterUser.name;
      console.log(
        `[BannerUpdater] Updated Twitter display name for user ${userId}: ${user.twitterUsername} -> ${twitterUser.name}`
      );
    }

    if (twitterUser.screen_name && twitterUser.screen_name !== user.twitterTag) {
      updates.twitterTag = twitterUser.screen_name;
      console.log(
        `[BannerUpdater] Updated Twitter handle for user ${userId}: @${user.twitterTag} -> @${twitterUser.screen_name}`
      );
    }

    if (Object.keys(updates).length > 0) {
      await db.updateTable("user").where("id", "=", user.id).set(updates).execute();
    }
  } catch (error) {
    // Check for permanent Twitter auth failures
    if (error instanceof Error && error.message.includes("401")) {
      throw new FatalError(
        `Twitter authentication failed for user ${userId} - token may be revoked`
      );
    }
    console.error(`[BannerUpdater] Failed to fetch Twitter user info for ${userId}:`, error);
    // Continue with banner update even if profile update fails
  }

  // Scrape GitHub contributions
  const contributionData = await scrapeContributions(user.githubUsername, {
    browserlessUrl: process.env.BROWSERLESS_URL!,
    browserlessToken: process.env.BROWSERLESS_TOKEN!,
  });

  // Generate SVG
  const bannerSvg = renderSvg(contributionData, user.theme as ThemeName);

  // Convert to JPEG at Twitter's optimal banner size (1500x500)
  const bannerJpeg = await sharp(Buffer.from(bannerSvg), { density: 500 })
    .resize(1500, 500, { fit: "fill" })
    .jpeg({ quality: 90 })
    .toBuffer();

  // Upload to Twitter
  try {
    await client.v1.updateAccountProfileBanner(bannerJpeg);
  } catch (error) {
    // Check for permanent Twitter auth failures
    if (error instanceof Error && error.message.includes("401")) {
      throw new FatalError(
        `Twitter authentication failed for user ${userId} - token may be revoked`
      );
    }
    throw error; // Let other errors be retried
  }

  // Update last update timestamp
  await db
    .updateTable("user")
    .where("id", "=", user.id)
    .set({ lastUpdateTimestamp: new Date() })
    .execute();

  console.log(`[BannerUpdater] Successfully updated banner for user ${userId}`);
}
