import puppeteer, { Page, Browser } from "puppeteer";
import type { ContributionDay, ContributionData, ScraperConfig } from "./types";

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
  username: string,
  config: ScraperConfig
): Promise<ContributionData> {
  const maxRetries = config.maxRetries || 3;
  const retryDelay = config.retryDelayMs || 5000;
  const timeout = config.timeoutMs || 30000;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!(await isPageValid(page))) {
        throw new Error("Page is not valid");
      }

      await page.goto(`https://github.com/users/${username}/contributions`, {
        waitUntil: "networkidle0",
        timeout,
      });
      await delay(5000);

      await page.waitForSelector(".js-calendar-graph-table", {
        timeout,
      });

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
      console.warn(`Retrying (${attempt}/${maxRetries}) due to error: ${(error as Error).message}`);
      await delay(Math.pow(2, attempt) * retryDelay);
      if (attempt >= maxRetries) throw error;
    }
  }
  throw new Error("Max retries reached");
}

async function connectWithRetry(
  config: ScraperConfig,
  maxRetries = 3,
  delayMs = 1000
): Promise<Browser> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const browser = await connectToBrowserless(config);
      if (!browser) {
        throw new Error("Failed to initialize browser");
      }
      return browser;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Failed to connect after maximum retries");
}

async function connectToBrowserless(config: ScraperConfig): Promise<Browser> {
  const launchArgs = JSON.stringify({
    args: ["--no-sandbox"],
    headless: true,
  });

  const wsUrl = `${config.browserlessUrl}/?token=${config.browserlessToken}&launch=${launchArgs}`;

  console.log("Connecting to browserless service...");

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsUrl,
    });

    if (!browser) {
      throw new Error("Browser initialization failed");
    }

    console.log("Successfully connected to browserless");
    return browser;
  } catch (error) {
    console.error("Failed to connect to browserless:", error);
    throw new Error(
      `Browserless connection failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function scrapeContributions(
  username: string,
  config: ScraperConfig
): Promise<ContributionData> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await connectWithRetry(config);
    if (!browser) {
      throw new Error("Failed to initialize browser");
    }

    page = await browser.newPage();
    if (!page) {
      throw new Error("Failed to create new page");
    }

    const timeout = config.timeoutMs || 30000;
    page.setDefaultNavigationTimeout(timeout);
    page.setDefaultTimeout(timeout);

    const data = await fetchContributionData(page, username, config);

    return data;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;
  } finally {
    if (page) await page.close().catch(console.error);
    if (browser) await browser.close().catch(console.error);
  }
}
