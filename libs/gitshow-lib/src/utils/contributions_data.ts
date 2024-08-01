import puppeteer, { Page, Browser } from "puppeteer";
import { ContributionDay, ContributionData } from "./contributions_types";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function isPageValid(page: Page): Promise<boolean> {
  try {
    await page.evaluate(() => true);
    return true;
  } catch {
    return false;
  }
}

async function fetchContributionData(page: Page, username: string): Promise<ContributionData> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      if (!(await isPageValid(page))) {
        throw new Error("Page is not valid");
      }

      await page.goto(`https://github.com/users/${username}/contributions`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      await delay(5000);

      await page.waitForSelector(".js-calendar-graph-table", { timeout: 30000 });

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
        return Array.from(days).map((day) => ({
          date: day.getAttribute("data-date") || "",
          level: day.getAttribute("data-level") || "0"
        })).filter(day => day.date);
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
      await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
      if (attempt >= maxRetries) throw error;
    }
  }
  throw new Error("Max retries reached");
}

export async function contribData(username: string): Promise<ContributionData> {
  let browser: Browser | undefined;
  let page: Page | undefined;

  try {
      browser = await puppeteer.connect({
        browserWSEndpoint: `${process.env.BROWSERLESS_WSS!}/?token=${process.env.BROWSERLESS_TOKEN}`,
      });

      page = await browser.newPage();
      page.setDefaultNavigationTimeout(10000);
      page.setDefaultTimeout(10000);

    const data = await fetchContributionData(page, username);
    return data;
  } catch (error) {
      console.error("Error fetching contribution data:", error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
}
