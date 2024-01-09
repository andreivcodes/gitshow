import { NextApiRequest, NextApiResponse } from "next";
import { queueJob } from "../../lib/sqs";
import { getServerAuthSession } from "../../server/auth";
import {
  PREMIUM_INTERVALS,
  PREMIUM_PLAN,
  updateUser,
} from "@gitshow/gitshow-lib";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { interval } = JSON.parse(req.body);

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
    session.user.subscription_type !== PREMIUM_PLAN &&
    PREMIUM_INTERVALS.includes(session.user.interval)
  ) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not premium.",
      },
    });
  }

  await updateUser(session.user.email, { refreshInterval: interval });
  await queueJob(session.user.email);

  return res.status(200).json({
    message: "Interval updated",
  });
}
