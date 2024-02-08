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
import { stripe } from "../lib/stripeServer";
import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  NONE_PLAN,
} from "@gitshow/gitshow-lib";
import { db, userTable, eq, takeUniqueOrThrow } from "@gitshow/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      subscription_type: AvailableSubscriptionTypes;
      theme: AvailableThemeNames;
      interval: number;

      fullyAuthenticated: boolean;
      twitterAuthenticated: boolean;
      githubAuthenticated: boolean;

      twittername: string | null;
      twittertag: string | null;
      twitterimage: string | null;

      githubname: string | null;

      lastSubscriptionTimestamp: Date;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    TwitterLegacy({
      clientId: process.env.TWITTER_CONSUMER_KEY!,
      clientSecret: process.env.TWITTER_CONSUMER_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user.email) {
        const u = await db
          .select()
          .from(userTable)
          .where(eq(userTable.email, session.user.email))
          .then(takeUniqueOrThrow);

        if (u) {
          session.user.subscription_type =
            u.subscriptionType as AvailableSubscriptionTypes;
          session.user.theme = u.theme as AvailableThemeNames;
          session.user.interval = u.refreshInterval;
          session.user.githubAuthenticated = u.githubAuthenticated === true;
          session.user.twitterAuthenticated = u.twitterAuthenticated === true;
          session.user.fullyAuthenticated =
            session.user.githubAuthenticated &&
            session.user.twitterAuthenticated;
          session.user.twittername = u.twitterUsername;
          session.user.twittertag = u.twitterTag;
          session.user.twitterimage = u.twitterPicture;
          session.user.githubname = u.githubUsername;
          session.user.lastSubscriptionTimestamp = u.lastSubscriptionTimestamp;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile && profile.email) {
        type NewUser = typeof userTable.$inferInsert;
        let updateData: NewUser = {
          email: profile?.email,
        };

        switch (account.provider) {
          case "github":
            updateData.githubId = account.providerAccountId;
            updateData.githubUsername = (profile as GithubProfile).login;
            updateData.name = (profile as GithubProfile).name ?? "Unknown";

            updateData.githubToken = AES.encrypt(
              account.access_token ?? "",
              process.env.TOKENS_ENCRYPT!
            ).toString();
            updateData.githubAuthenticated = true;
            break;

          case "twitter":
            updateData.twitterId = account.providerAccountId;
            updateData.twitterTag = (
              profile as TwitterLegacyProfile
            ).screen_name;
            updateData.twitterUsername = (profile as TwitterLegacyProfile).name;
            updateData.twitterPicture = (
              profile as TwitterLegacyProfile
            ).profile_image_url_https?.replace("_normal.jpg", ".jpg");

            updateData.twitterOAuthToken = AES.encrypt(
              (account.oauth_token as string) ?? "",
              process.env.TOKENS_ENCRYPT!
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              (account.oauth_token_secret as string) ?? "",
              process.env.TOKENS_ENCRYPT!
            ).toString();
            updateData.twitterAuthenticated = true;
            break;
        }

        try {
          const existingUser = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, profile.email))
            .then(takeUniqueOrThrow);

          if (existingUser) {
            await db
              .update(userTable)
              .set(updateData)
              .where(eq(userTable.email, profile.email));
          } else {
            const stripeCustomer = await stripe.customers.create({
              email: profile.email,
            });

            updateData.stripeCustomerId = stripeCustomer.id;
            updateData.subscriptionType = NONE_PLAN;
            updateData.theme = "classic";
            updateData.refreshInterval = 168;

            await db.insert(userTable).values(updateData);
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
