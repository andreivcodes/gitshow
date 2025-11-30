"use cache";

import { contribSvg, AvailableThemeNames } from "@gitshow/gitshow-lib";
import { cacheLife, cacheTag } from "next/cache";

export async function getCachedContributionSvg(
  githubUsername: string,
  theme: AvailableThemeNames
) {
  cacheLife("hours"); // 1 hour cache (matches current 60*60)
  cacheTag(`user-${githubUsername}`); // Tagged for invalidation

  try {
    return await contribSvg(githubUsername, theme);
  } catch (error) {
    console.error("Error fetching contribution SVG:", error);
    return null;
  }
}
