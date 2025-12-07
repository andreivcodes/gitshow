import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { scrapeContributions } from "./scraper";
import { renderSvg } from "./svg";
import type { ContributionData, ThemeName } from "@/lib/schemas";

const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetches and renders GitHub contribution SVG for a user.
 *
 * Caching strategy:
 * 1. Next.js cache (via "use cache") - caches the rendered SVG for 1 hour
 * 2. Database cache - stores raw contribution data to avoid repeated scraping
 *
 * Tagged with "contributions" for on-demand revalidation when user changes theme.
 */
export async function getContributionSvg(
  username: string,
  theme: ThemeName
): Promise<string> {
  "use cache";
  cacheLife("hours");
  cacheTag("contributions", `user-${username}`);

  // Check database cache for raw contribution data
  const user = await db
    .selectFrom("user")
    .where("githubUsername", "=", username)
    .selectAll()
    .executeTakeFirst();

  const now = Date.now();
  const lastFetch = user?.lastFetchTimestamp
    ? new Date(user.lastFetchTimestamp).getTime()
    : 0;

  let contributionData: ContributionData;

  // Use database cached data if fresh
  if (user?.contribData && now - lastFetch < CACHE_EXPIRY_MS) {
    contributionData = user.contribData as unknown as ContributionData;
  } else {
    // Scrape fresh data from GitHub
    contributionData = await scrapeContributions(username, {
      browserlessUrl: process.env.BROWSERLESS_URL!,
      browserlessToken: process.env.BROWSERLESS_TOKEN!,
    });

    // Store in database cache
    if (user) {
      await db
        .updateTable("user")
        .set({
          contribData: JSON.stringify(contributionData),
          lastFetchTimestamp: new Date(),
        })
        .where("id", "=", user.id)
        .execute();
    }
  }

  return renderSvg(contributionData, theme);
}

// Re-export types and utilities for external use
export { themes } from "./themes";
// Re-export schema types for backwards compatibility
export type { ThemeName as AvailableThemeNames } from "@/lib/schemas";
export type { ContributionData, ContributionDay, ScraperConfig, Theme, ThemeName } from "@/lib/schemas";
export { scrapeContributions } from "./scraper";
export { renderSvg } from "./svg";
