import { themes } from "./themes";
import type { ContributionData, Theme, ThemeName } from "@/lib/schemas";

export function renderSvg(contributionData: ContributionData, theme: ThemeName): string {
  const cellSize = 10;
  const cellGap = 2;
  const daysInWeek = 7;
  const paddingTop = 50;
  const paddingRight = 50;
  const paddingBottom = 100;
  const paddingLeft = 50;
  const currentTheme = themes[theme];
  const contributionsMap = new Map<string, string>();

  contributionData.contributions.forEach((contribution) => {
    contributionsMap.set(contribution.date, contribution.level);
  });

  const startDate = new Date(contributionData.range.start);
  const totalDays = contributionData.contributions.length;
  const weeks = Math.ceil(totalDays / daysInWeek);
  const width = weeks * (cellSize + cellGap) + paddingLeft + paddingRight;
  const height = daysInWeek * (cellSize + cellGap) + paddingTop + paddingBottom;

  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svgContent += `<rect width="${width}" height="${height}" fill="${currentTheme.background}" />`;

  let x = paddingLeft;
  let y = paddingTop;

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);
    const dateString = currentDate.toISOString().split("T")[0];
    const level = contributionsMap.get(dateString) || "0";
    const color = currentTheme[`level${level}` as keyof Theme];

    svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2" ry="2" />`;

    y += cellSize + cellGap;
    if (dayIndex % daysInWeek === 6) {
      x += cellSize + cellGap;
      y = paddingTop;
    }
  }

  // Position watermark in the center of the bottom padding area
  const watermarkX = width - paddingRight - 60;
  const watermarkY = height - paddingBottom / 2;
  svgContent += `<text x="${watermarkX}" y="${watermarkY}" font-size="10" fill="${currentTheme.text}" text-anchor="middle" style="font-family:'Roboto';">Get yours from git.show</text>`;
  svgContent += "</svg>";

  return svgContent;
}
