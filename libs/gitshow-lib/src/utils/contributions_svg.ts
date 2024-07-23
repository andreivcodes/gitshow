import { AvailableThemeNames, Theme, themes } from "../themes";
import { contribData } from "./contributions_data";

export async function contribSvg(
  username: string,
  theme: AvailableThemeNames,
): Promise<string> {
  const contributionData = await contribData(username);

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
  const endDate = new Date(contributionData.range.end);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weeks = Math.ceil(totalDays / daysInWeek);

  const width = weeks * (cellSize + cellGap) + paddingLeft + paddingRight;
  const height = daysInWeek * (cellSize + cellGap) + paddingTop + paddingBottom;


  let svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  svgContent += `<defs>
                  <style type="text/css">
                    @import url('https://fonts.googleapis.com/css?family=Roboto:400,100,100italic,300,300italic,400italic,500,500italic,700,700italic,900,900italic');
                  </style>
                </defs>`;

  svgContent += `<rect width="${width}" height="${height}" fill="${currentTheme.background}" />`;

  let x = paddingLeft;
  let y = paddingTop;

  // Fill the days
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0];
    const level = contributionsMap.get(dateString) || "0";
    const color = currentTheme[`level${level}` as keyof Theme];

    svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;

    y += cellSize + cellGap;
    if (date.getDay() === 6) { // Saturday
      x += cellSize + cellGap;
      y = paddingTop;
    }
  }

  const watermarkX = width - 110;
  const watermarkY = height - 60;

  svgContent += `<text x="${watermarkX}" y="${watermarkY + paddingTop}" font-size="10" fill="${currentTheme.text}" text-anchor="middle" style="font-family:'Roboto';">Get yours from git.show</text>`;
  svgContent += "</svg>";

  return svgContent;
}
