import puppeteer from "puppeteer";
import { ContributionDay, ContributionData } from "./contributions_types";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export async function contribData(username: string): Promise<ContributionData> {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `${process.env.BROWSERLESS_WSS}?token=${process.env.BROWSERLESS_TOKEN}`,
  });

  const page = await browser.newPage();

  try {
    await page.goto(`https://github.com/users/${username}/contributions`);
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

    const data: ContributionData = {
      total: contributionsCount,
      range: {
        start: startDate,
        end: endDate,
      },
      contributions: contributionDays,
    };

    return data;

  } catch (error) {
    console.error("Error fetching contribution data:", error);
    throw error;

  } finally {
    await browser.close();
  }
}
