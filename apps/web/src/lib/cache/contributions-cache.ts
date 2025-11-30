import { contribSvg, AvailableThemeNames } from "@gitshow/gitshow-lib";
import { unstable_cache } from "next/cache";

// Create a cached version of the contribution SVG fetcher
// Cache for 1 hour, tagged by username for invalidation
const getCachedContributionSvgImpl = unstable_cache(
  async (githubUsername: string, theme: AvailableThemeNames) => {
    try {
      return await contribSvg(githubUsername, theme);
    } catch (error) {
      console.error("Error fetching contribution SVG:", error);
      return null;
    }
  },
  ["contribution-svg"],
  {
    revalidate: 3600, // 1 hour in seconds
    tags: ["contributions"],
  }
);

export async function getCachedContributionSvg(
  githubUsername: string,
  theme: AvailableThemeNames
) {
  return getCachedContributionSvgImpl(githubUsername, theme);
}
