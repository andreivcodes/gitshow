import "server-only";

import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import TwitterProvider, {
  TwitterLegacyProfile,
} from "next-auth/providers/twitter";
import { AES } from "crypto-js";
import { Config } from "sst/node/config";
import { stripe } from "../../../../utils/stripeServer";
import { UserUpdateAttributes, updateUser } from "../../../../utils/db";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";

const dynamoDb = new DynamoDB.DocumentClient();

export const authOptions: NextAuthOptions = {
  secret: Config.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: Config.GITHUB_CLIENT_ID,
      clientSecret: Config.GITHUB_CLIENT_SECRET,
    }),
    TwitterProvider({
      clientId: Config.TWITTER_CONSUMER_KEY,
      clientSecret: Config.TWITTER_CONSUMER_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      let updateData: UserUpdateAttributes = {};

      if (account && profile && profile.email) {
        switch (account.provider) {
          case "github":
            updateData.githubId = account.providerAccountId;
            updateData.githubUsername = (profile as GithubProfile).login;
            updateData.name = (profile as GithubProfile).name ?? "Unknown";

            updateData.githubToken = AES.encrypt(
              account.access_token ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            break;

          case "twitter":
            updateData.twitterId = account.providerAccountId;
            updateData.twitterUsername = (
              profile as TwitterLegacyProfile
            ).screen_name;

            updateData.twitterOAuthToken = AES.encrypt(
              (account.oauth_token as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              (account.oauth_token_secret as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            break;
        }

        try {
          const existingUser = await dynamoDb
            .get({
              TableName: Table.User.tableName,
              Key: { email: profile.email },
            })
            .promise();

          if (existingUser.Item) {
            await updateUser(profile.email, updateData);
          } else {
            const stripeCustomer = await stripe.customers.create({
              email: profile.email,
            });

            updateData.stripeCustomerId = stripeCustomer.id;

            await dynamoDb
              .put({
                TableName: Table.User.tableName,
                Item: { email: profile.email, ...updateData },
              })
              .promise();
          }
        } catch (error) {
          console.error("Failed to retrieve or update user:", error);
        }
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
