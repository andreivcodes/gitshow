import puppeteer, { Page } from "puppeteer";
import { ContributionDay, ContributionData } from "./contributions_types";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function fetchContributionData(page: Page, username: string): Promise<ContributionData> {
  try {
    await page.goto(`https://github.com/users/${username}/contributions`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector(".js-calendar-graph-table", { timeout: 60000 });

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
  } catch (error) {
    console.error("Error during data fetch:", error);
    throw error;
  }
}

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export async function contribData(username: string): Promise<ContributionData> {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `${process.env.BROWSERLESS_WSS}?token=${process.env.BROWSERLESS_TOKEN}`,
  });

  const page = await browser.newPage();

  let data: ContributionData;

  try {
    const maxRetries = 3;
    let attempt = 0;
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
        await delay(5000); // Wait for 5 seconds before retrying
      }
    }
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;
  } finally {
    try {
      await page.close();
      await browser.close();
    } catch (e) {
      console.error("Error closing resources:", e);
    }
  }

  return data!;
}
