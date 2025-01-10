import puppeteer, { Page, Browser } from "puppeteer";
import { ContributionDay, ContributionData } from "./contributions_types";
import { config as dotenvConfig } from "dotenv";
import { db } from "@gitshow/db";
dotenvConfig();

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // Initial delay, exponential backoff applied
const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 24 hours

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function isPageValid(page: Page): Promise<boolean> {
  try {
    await page.evaluate(() => true);
    return true;
  } catch {
    return false;
  }
}

async function fetchContributionData(
  page: Page,
  username: string
): Promise<ContributionData> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      if (!(await isPageValid(page))) {
        throw new Error("Page is not valid");
      }

      await page.goto(`https://github.com/users/${username}/contributions`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
      await delay(5000);

      await page.waitForSelector(".js-calendar-graph-table", {
        timeout: 30000,
      });

      const contributionsCount = await page.evaluate(() => {
        const contributionsElement = document.querySelector(
          ".js-yearly-contributions h2"
        );
        if (contributionsElement && contributionsElement.textContent) {
          const text = contributionsElement.textContent.trim();
          const countMatch = text.match(/^([0-9,]+)/);
          return countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 0;
        }
        return 0;
      });

      const contributionDays: ContributionDay[] = await page.evaluate(() => {
        const days = document.querySelectorAll(".ContributionCalendar-day");
        return Array.from(days)
          .map((day) => ({
            date: day.getAttribute("data-date") || "",
            level: day.getAttribute("data-level") || "0",
          }))
          .filter((day) => day.date);
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
    } catch (error) {
      attempt++;
      console.warn(
        `Retrying (${attempt}/${MAX_RETRIES}) due to error: ${
          (error as Error).message
        }`
      );
      await delay(Math.pow(2, attempt) * RETRY_DELAY); // Exponential backoff
      if (attempt >= MAX_RETRIES) throw error;
    }
  }
  throw new Error("Max retries reached");
}

async function connectWithRetry(maxRetries = 3, delay = 1000): Promise<Browser> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const browser = await connectToBrowserless();
      if (!browser) {
        throw new Error('Failed to initialize browser');
      }
      return browser;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Failed to connect after maximum retries');
}

async function connectToBrowserless(): Promise<Browser> {
  const launchArgs = JSON.stringify({
    args: ['--no-sandbox'],
    headless: true,
  });

  const browserlessUrl = process.env.BROWSERLESS_URL;
  const browserlessToken = process.env.BROWSERLESS_TOKEN;

  if (!browserlessUrl || !browserlessToken) {
    throw new Error('Browserless URL or token not configured');
  }

  const wsUrl = `${browserlessUrl}/?token=${browserlessToken}&launch=${launchArgs}`;

  console.log('Connecting to browserless service...');

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsUrl,
    });

    if (!browser) {
      throw new Error('Browser initialization failed');
    }

    console.log('Successfully connected to browserless');
    return browser;
  } catch (error) {
    console.error('Failed to connect to browserless:', error);
    throw new Error(`Browserless connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function contribData(username: string): Promise<ContributionData> {
  const user = await db
    ?.selectFrom("user")
    .where("githubUsername", "=", username)
    .selectAll()
    .executeTakeFirst();

  if (
    user &&
    user.contribData &&
    user.lastFetchTimestamp &&
    new Date(user.lastFetchTimestamp).getTime() >
      new Date().getTime() - CACHE_EXPIRY_MS
  ) {
    return user.contribData as unknown as ContributionData;
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await connectWithRetry();
    if (!browser) {
      throw new Error('Failed to initialize browser');
    }

    page = await browser.newPage();
    if (!page) {
      throw new Error('Failed to create new page');
    }

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    const data = await fetchContributionData(page, username);

    await db
      .updateTable("user")
      .where("githubUsername", "=", username)
      .set({
        contribData: JSON.stringify(data),
        lastFetchTimestamp: new Date(),
      })
      .execute();

    return data;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;
  } finally {
    if (page) await page.close().catch(console.error);
    if (browser) await browser.close().catch(console.error);
  }
}
