import { AvailableThemeNames, Theme, themes } from "../types";
import { contribData } from "./contributions_data";
import { SubscriptionPlan } from "@prisma/client";

export async function contribSvg(
  username: string,
  theme: AvailableThemeNames,
  type: SubscriptionPlan,
): Promise<string> {
  const contributionData = await contribData(username);

  const cellSize = 10;
  const cellGap = 2;
  const weeks = 53;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const paddingTop = 50;
  const paddingRight = 50;
  const paddingBottom = 80;
  const paddingLeft = 50;

  const width = weeks * (cellSize + cellGap) + 40 + paddingLeft + paddingRight;
  const height = 7 * (cellSize + cellGap) + 20 + paddingTop + paddingBottom;

  const currentTheme = themes[theme];

  // Increase the height for the watermark
  const watermarkHeight = 20;
  const adjustedHeight = height + watermarkHeight;

  let svgContent = `<svg width="${width}" height="${adjustedHeight}" viewBox="0 0 ${width} ${adjustedHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Font
  svgContent += `<defs>
                  <style type="text/css">
                    @import url('https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic');
                  </style>
                </defs>`;

  // Add the background rectangle
  svgContent += `<rect width="${width}" height="${adjustedHeight}" fill="${currentTheme.background}" />`;

  let x = 35 + paddingLeft; // Adjust initial x-coordinate
  let y = 20 + paddingTop; // Adjust initial y-coordinate

  for (const year in contributionData.contributions) {
    for (const month in contributionData.contributions[year]) {
      for (const day in contributionData.contributions[year]![month]) {
        if (day === "1")
          svgContent += `<text x="${x}" y="${10 + paddingTop}" font-size="10" fill="${
            currentTheme.text
          }" style="font-family:'Roboto';">${months[parseInt(month) - 1]}</text>`;

        const contribution = contributionData.contributions[year]![month]![day];
        const color = currentTheme[`intensity${contribution!.intensity}` as keyof Theme];

        svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;

        y += cellSize + cellGap;
        if (y >= height - paddingBottom) {
          y = 20 + paddingTop;
          x += cellSize + cellGap;
        }
      }
    }
  }

  const watermarkX = width - paddingRight - 110;
  const watermarkY = height - paddingBottom - 35;

  const centerYOffset = cellSize / 2 - 1;

  for (let i = 0; i < days.length; i++) {
    svgContent += `<text x="${10 + paddingLeft}" y="${
      paddingTop + 20 + i * (cellSize + cellGap) + cellSize / 2 + centerYOffset
    }" font-size="10" fill="${currentTheme.text}" dominant-baseline="central" style="font-family:'Roboto';">${
      days[i]
    }</text>`;
  }

  if (type == SubscriptionPlan.FREE) {
    svgContent += `<text x="${watermarkX + paddingLeft}" y="${watermarkY + paddingTop}" font-size="10" fill="${
      currentTheme.text
    }" text-anchor="middle" style="font-family:'Roboto';">Get yours from git.show</text>`;
  }
  svgContent += "</svg>";

  return svgContent;
}
