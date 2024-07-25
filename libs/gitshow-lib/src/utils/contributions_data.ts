import puppeteer, { Page } from "puppeteer";
import { ContributionDay, ContributionData } from "./contributions_types";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function fetchContributionData(page: Page, username: string): Promise<ContributionData> {
  await page.goto(`https://github.com/users/${username}/contributions`, { waitUntil: 'networkidle0' });

  await page.waitForSelector(".js-calendar-graph-table", { timeout: 15000 });

  const contributionsCount = await page.evaluate(() => {
    const contributionsElement = document.querySelector(".js-yearly-contributions h2");
    if (contributionsElement && contributionsElement.textContent) {
      const text = contributionsElement.textContent.trim();
      const countMatch = text.match(/^([0-9,]+)/);
      return countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 0;
    }
    return 0;
  });

  const contributionDays: ContributionDay[] = await page.evaluate(() => {
    const days = document.querySelectorAll(".ContributionCalendar-day");
    const contributionDays: ContributionDay[] = [];
    days.forEach((day) => {
      const date = day.getAttribute("data-date") || "";
      const level = day.getAttribute("data-level") || "0";
      if (date) {
        contributionDays.push({ date, level });
      }
    });
    return contributionDays;
  });

  const startDate = contributionDays[0]?.date || "";
  const endDate = contributionDays[contributionDays.length - 1]?.date || "";

  return {
    total: contributionsCount,
    range: {
      start: startDate,
      end: endDate,
    },
    contributions: contributionDays,
  };
}

export async function contribData(username: string): Promise<ContributionData> {
  let browser;
  let page;

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `${process.env.BROWSERLESS_WSS}?token=${process.env.BROWSERLESS_TOKEN}?launch={"args":["--user-data-dir==/datadir"]}`
    });

    page = await browser.newPage();

    const maxRetries = 3;
    let attempt = 0;
    let data;

    while (attempt < maxRetries) {
      try {
        data = await fetchContributionData(page, username);
        break; // Break if successful
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error; // Rethrow if max retries reached
        }
        console.warn(`Retrying (${attempt}/${maxRetries}) due to error: ${(error as Error).message}`);
      }
    }

    return data!;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;
  } finally {
    if (page && !page.isClosed()) {
      try {
        await page.close();
      } catch (error) {
        console.error("Error closing page:", error);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error("Error closing browser:", error);
      }
    }
  }
}
