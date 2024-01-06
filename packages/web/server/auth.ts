import { AvailableSubscriptionTypes, AvailableThemeNames } from "@gitshow/svg-gen";
import { DynamoDB } from "aws-sdk";
import { AES } from "crypto-js";
import { type GetServerSidePropsContext } from "next";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import Github, { GithubProfile } from "next-auth/providers/github";
import TwitterLegacy, {
  TwitterLegacyProfile,
} from "next-auth/providers/twitter";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import { UserUpdateAttributes, updateUser } from "../lib/db";
import { stripe } from "../lib/stripeServer";

const dynamoDb = new DynamoDB.DocumentClient();

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      subscription_type: AvailableSubscriptionTypes;
      theme: AvailableThemeNames;

      fullyAuthenticated: boolean;
      twitterAuthenticated: boolean;
      githubAuthenticated: boolean;

      twittername: string;
      twittertag: string;
      twitterimage: string;

      githubname: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: Config.NEXTAUTH_SECRET,
  providers: [
    Github({
      clientId: Config.GITHUB_CLIENT_ID,
      clientSecret: Config.GITHUB_CLIENT_SECRET,
    }),
    TwitterLegacy({
      clientId: Config.TWITTER_CONSUMER_KEY,
      clientSecret: Config.TWITTER_CONSUMER_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user) {
        const user = await dynamoDb
          .get({
            TableName: Table.User.tableName,
            Key: { email: session.user.email },
          })
          .promise();

        if (user.Item) {
          session.user.subscription_type = user.Item.subscriptionType;
          session.user.theme = user.Item.theme;
          session.user.githubAuthenticated =
            user.Item.githubAuthenticated === "true";
          session.user.twitterAuthenticated =
            user.Item.twitterAuthenticated === "true";
          session.user.fullyAuthenticated =
            session.user.githubAuthenticated &&
            session.user.twitterAuthenticated;
          session.user.twittername = user.Item.twitterUsername;
          session.user.twittertag = user.Item.twitterTag;
          session.user.twitterimage = user.Item.twitterPicutre;
          session.user.githubname = user.Item.githubUsername;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      const updateData: UserUpdateAttributes = {};

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
            updateData.githubAuthenticated = "true";
            break;

          case "twitter":
            updateData.twitterId = account.providerAccountId;
            updateData.twitterTag = (
              profile as TwitterLegacyProfile
            ).screen_name;
            updateData.twitterUsername = (profile as TwitterLegacyProfile).name;
            updateData.twitterPicutre = (
              profile as TwitterLegacyProfile
            ).profile_image_url_https?.replace("_normal.jpg", ".jpg");

            updateData.twitterOAuthToken = AES.encrypt(
              (account.oauth_token as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              (account.oauth_token_secret as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            updateData.twitterAuthenticated = "true";
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
            updateData.subscriptionType = "none";
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

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
