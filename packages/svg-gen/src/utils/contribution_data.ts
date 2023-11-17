import { load, type Element } from "cheerio";
import {
  type ContributionData,
  type ContributionValue,
  COLOR_MAP,
} from "./contribution_types";

export async function contribData(username: string): Promise<ContributionData> {
  const url = await fetch(`https://github.com/${username}`);
  const $ = load(await url.text());
  const $days = $(
    "table.ContributionCalendar-grid td.ContributionCalendar-day"
  );
  const contribText = $(".js-yearly-contributions h2")
    .text()
    .trim()
    .match(/^([0-9,]+)\s/);
  let contribCount = 0;
  if (contribText && contribText[1]) {
    contribCount = parseInt(contribText[1].replace(/,/g, ""), 10);
  }

  const data: ContributionData = {
    total: contribCount,
    range: {
      start: $($days.get(0)).attr("data-date") || "",
      end: $($days.get($days.length - 1)).attr("data-date") || "",
    },
    contributions: (() => {
      const parseDay = (
        day: Element
      ): { date: number[]; value: ContributionValue } => {
        const $day = $(day);
        const date = $day
          .attr("data-date")!
          .split("-")
          .map((d) => parseInt(d, 10));
        const color = COLOR_MAP[$day.attr("data-level") || ""] || 0;
        const value = {
          date: $day.attr("data-date") || "",
          count: parseInt($day.text().split(" ")[0], 10) || 0,
          color,
          intensity: $day.attr("data-level") || "",
        };
        return { date, value };
      };

      return $days.get().reduce((o, day: Element) => {
        const { date, value } = parseDay(day);
        const [y, m, d] = date;
        if (!o[y]) o[y] = {};
        if (!o[y][m]) o[y][m] = {};
        o[y][m][d] = value;
        return o;
      }, {} as Record<number, Record<number, Record<number, ContributionValue>>>);
    })(),
  };
  return data;
}
