import { scrapeContributions, renderContribSvg, ContributionData } from "@gitshow/gitshow-lib";
import { db } from "@gitshow/db";
import type { AvailableThemeNames } from "@gitshow/gitshow-lib";

const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function fetchContributions(
  username: string,
  theme: AvailableThemeNames
): Promise<string> {
  // 1. Check database cache
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

  // 2. Use cached data if fresh
  if (user?.contribData && now - lastFetch < CACHE_EXPIRY_MS) {
    contributionData = user.contribData as unknown as ContributionData;
  } else {
    // 3. Scrape fresh data
    contributionData = await scrapeContributions(username, {
      browserlessUrl: process.env.BROWSERLESS_URL!,
      browserlessToken: process.env.BROWSERLESS_TOKEN!,
    });

    // 4. Cache in database
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

  // 5. Render SVG
  return renderContribSvg(contributionData, theme, username);
}
