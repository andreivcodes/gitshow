"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { updateTag } from "next/cache";
import { db, decryptToken } from "@/lib/db";
import {
  ThemeNameSchema,
  RefreshIntervalSchema,
  safeParseInput,
  type ThemeName,
  type RefreshInterval,
  type VoidActionResult,
} from "@/lib/schemas";
import { z } from "zod";
import { scrapeContributions, renderSvg } from "@/lib/contributions";
import { TwitterApi } from "twitter-api-v2";
import sharp from "sharp";

/**
 * Helper to check if user is fully authenticated.
 * Returns the authenticated session or an error result.
 */
type AuthResult = { success: true; session: Session } | { success: false; error: string };

async function requireFullAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    session.user.githubAuthenticated === false ||
    session.user.twitterAuthenticated === false
  ) {
    return { success: false, error: "Not authenticated" };
  }

  return { success: true, session };
}

export async function initAction() {}

export async function setUpdateInterval(interval: RefreshInterval): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(RefreshIntervalSchema, interval);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db
      .updateTable("user")
      .where("id", "=", user.id)
      .set({ updateInterval: parsed.data })
      .execute();

    session.user.updateInterval = parsed.data;

    updateTag("contributions");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update interval:", error);
    return {
      success: false,
      error: "Failed to update interval. Please try again.",
    };
  }
}

export async function setUserTheme(theme: ThemeName): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(ThemeNameSchema, theme);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db.updateTable("user").where("id", "=", user.id).set({ theme: parsed.data }).execute();

    session.user.theme = parsed.data;

    updateTag("contributions");
    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return {
      success: false,
      error: "Failed to update theme. Please try again.",
    };
  }
}

export async function setAutomaticallyUpdate(update: boolean): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(z.boolean(), update);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db
      .updateTable("user")
      .where("id", "=", user.id)
      .set({ automaticallyUpdate: parsed.data })
      .execute();

    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update auto-update setting:", error);
    return {
      success: false,
      error: "Failed to update setting. Please try again.",
    };
  }
}

export async function deleteAccount(): Promise<VoidActionResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Delete the user account
    await db.deleteFrom("user").where("email", "=", session.user.email).execute();

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return {
      success: false,
      error: "Failed to delete account. Please try again.",
    };
  }
}

export async function forceUpdateBanner(): Promise<VoidActionResult> {
  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    if (!user.twitterOauthToken || !user.twitterOauthTokenSecret) {
      return { success: false, error: "Twitter not connected" };
    }

    if (!user.githubUsername) {
      return { success: false, error: "GitHub username not found" };
    }

    // Decrypt Twitter tokens
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
    await client.v1.updateAccountProfileBanner(bannerJpeg);

    // Update last update timestamp
    await db
      .updateTable("user")
      .where("id", "=", user.id)
      .set({ lastUpdateTimestamp: new Date() })
      .execute();

    // Invalidate cache
    updateTag("contributions");
    updateTag(`user-${user.githubUsername}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to force update banner:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update banner. Please try again.",
    };
  }
}
