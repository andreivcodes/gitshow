import puppeteer from "puppeteer";
import { ContributionDay, type ContributionData } from "./contributions_types";
import { config as dotenv_config } from "dotenv";

export async function contribData(username: string): Promise<ContributionData> {
  dotenv_config();

  const browser = await puppeteer.connect({
    browserWSEndpoint: `${process.env.BROWSERLESS_WSS}?token=${process.env.BROWSERLESS_TOKEN}`,
  });

  const page = await browser.newPage();

  await page.goto(`https://github.com/${username}`);

  await page.waitForSelector(".js-yearly-contributions", { timeout: 60000 });

  const contributionsCount = await page.evaluate(() => {
    const contributionsElement = document.querySelector(".js-yearly-contributions h2");
    if (contributionsElement && contributionsElement.textContent) {
      const text = contributionsElement.textContent.trim();
      const countMatch = text?.match(/^([0-9,]+)/);
      return countMatch ? parseInt(countMatch[1].replace(/,/g, ""), 10) : 0;
    }
    return 0;
  });

  const startDate = (await page.$eval(".ContributionCalendar-day", (day) => day.getAttribute("data-date"))) || "";

  const endDate =
    (await page.$eval(".ContributionCalendar-day:last-child", (day) => day.getAttribute("data-date"))) || "";

  const contributionDays = await page.evaluate(() => {
    const days = document.querySelectorAll(".ContributionCalendar-day");
    const contributionDays: { date: string; value: ContributionDay }[] = [];
    days.forEach((day) => {
      const value: ContributionDay = {
        date: day.getAttribute("data-date") || "",
        intensity: day.getAttribute("data-level") || "",
      };
      contributionDays.push({ date: day.getAttribute("data-date") || "", value });
    });
    return contributionDays;
  });

  const data: ContributionData = {
    total: contributionsCount,
    range: {
      start: startDate,
      end: endDate,
    },
    contributions: (() => {
      return contributionDays.reduce(
        (o: { [x: string]: { [x: string]: { [x: string]: any } } }, day: { date: any; value: any }) => {
          const { date, value } = day;
          const [y, m, d] = date.split("-");
          if (!o[y]) o[y] = {};
          if (!o[y][m]) o[y][m] = {};
          o[y][m][d] = value;
          return o;
        },
        {} as Record<string, Record<string, Record<string, ContributionDay>>>,
      );
    })(),
  };
  return data;
}
