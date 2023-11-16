import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "../../server/auth";
import { updateUser } from "../../lib/db";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";
import { queueUpdateHeader } from "../../lib/sqs";

const dynamoDb = new DynamoDB.DocumentClient();

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

  if (session.user.subscription_type != "premium") {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not premium.",
      },
    });
  }

  await updateUser(session.user.email!, { theme: theme });
  await queueUpdateHeader(session.user.email!);

  return res.status(200).json({
    message: "Theme updated",
  });
}
