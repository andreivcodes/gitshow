import { contribSvg } from "@gitshow/svg-gen";
import { AvailableThemeNames } from "@gitshow/svg-gen";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "../../server/auth";

export interface ContributionRequest {
	githubUsername: string;
	type: "free" | "standard" | "premium";
	theme: AvailableThemeNames;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { githubUsername, type, theme } = JSON.parse(
		req.body,
	) as ContributionRequest;

	const session = await getServerAuthSession({ req, res });

	if (!session?.user) {
		return res.status(401).json({
			error: {
				code: "no-access",
				message: "You are not signed in.",
			},
		});
	}

	const bannerSvg = await contribSvg(githubUsername, theme, type);

	return res
		.status(200)
		.json({ message: `Processed ${githubUsername}`, svg: bannerSvg });
}
