import { NextApiRequest, NextApiResponse } from "next";
import { queueJob } from "../../lib/sqs";
import { getServerAuthSession } from "../../server/auth";
import { PREMIUM_PLAN, PREMIUM_THEMES } from "@gitshow/gitshow-lib";
import { db, eq, userTable } from "@gitshow/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { theme } = JSON.parse(req.body);

  const session = await getServerAuthSession({ req, res });

  if (!session?.user || !session.user.email) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }

  if (
    session.user.subscription_type != PREMIUM_PLAN &&
    PREMIUM_THEMES.includes(theme)
  ) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not premium.",
      },
    });
  }

  await db
    .update(userTable)
    .set({ theme: theme })
    .where(eq(userTable.email, session.user.email));

  await queueJob(session.user.email);

  return res.status(200).json({
    message: "Theme updated",
  });
}
