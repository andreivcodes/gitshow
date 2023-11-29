import { contribData } from "./contribution_data";
import {
	type AvailableSubscriptionTypes,
	type AvailableThemeNames,
	type Theme,
	themes,
} from "./themes";

export async function contribSvg(
	username: string,
	theme: AvailableThemeNames,
	type: AvailableSubscriptionTypes,
): Promise<string> {
	const contributionData = await contribData(username);

	const cellSize = 10;
	const cellGap = 2;
	const weeks = 53;
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

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

	// Add the background rectangle
	svgContent += `<rect width="${width}" height="${adjustedHeight}" fill="${currentTheme.background}" />`;

	let x = 35 + paddingLeft; // Adjust initial x-coordinate
	let y = 20 + paddingTop; // Adjust initial y-coordinate

	for (const year in contributionData.contributions) {
		for (const month in contributionData.contributions[year]) {
			for (const day in contributionData.contributions[year][month]) {
				if (day === "1")
					svgContent += `<text x="${x}" y="${
						10 + paddingTop
					}" font-size="10" fill="${currentTheme.text}">${
						months[parseInt(month) - 1]
					}</text>`;

				const contribution = contributionData.contributions[year][month][day];
				const color =
					currentTheme[`intensity${contribution.intensity}` as keyof Theme];

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
		}" font-size="10" fill="${currentTheme.text}" dominant-baseline="central">${
			days[i]
		}</text>`;
	}

	if (type === "free")
		svgContent += `<text x="${watermarkX + paddingLeft}" y="${
			watermarkY + paddingTop
		}" font-size="10" fill="${
			currentTheme.text
		}" text-anchor="middle">Get yours from git.show</text>`;

	svgContent += "</svg>";

	return svgContent;
}
