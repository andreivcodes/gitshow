import { AES } from "crypto-js";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import Github, { GithubProfile } from "next-auth/providers/github";
import TwitterLegacy, {
  TwitterLegacyProfile,
} from "next-auth/providers/twitter";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";
import { stripe } from "./stripe-server";
import {
  AvailableThemeNames,
  SubscriptionPlan,
  UpdateInterval,
} from "@gitshow/gitshow-lib";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      automaticallyUpdate: boolean;
      lastUpdateTimestamp: Date | null;
      updateInterval: UpdateInterval;

      theme: AvailableThemeNames;

      subscription_type: SubscriptionPlan;
      lastSubscriptionTimestamp: Date | null;

      fullyAuthenticated: boolean;
      twitterAuthenticated: boolean;
      githubAuthenticated: boolean;

      twittername: string | null;
      twittertag: string | null;
      twitterimage: string | null;

      githubname: string | null;
    } & DefaultSession["user"];
  }
}

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
          .then(takeUniqueOrNull);

        if (u) {
          session.user.automaticallyUpdate = u.automaticallyUpdate === true;
          session.user.lastUpdateTimestamp = u.lastUpdateTimestamp;
          session.user.updateInterval = u.updateInterval as UpdateInterval;

          session.user.theme = u.theme as AvailableThemeNames;

          session.user.subscription_type =
            u.subscriptionPlan as SubscriptionPlan;
          session.user.lastSubscriptionTimestamp = u.lastSubscriptionTimestamp;

          session.user.fullyAuthenticated =
            session.user.githubAuthenticated &&
            session.user.twitterAuthenticated;
          session.user.githubAuthenticated = u.githubAuthenticated === true;
          session.user.twitterAuthenticated = u.twitterAuthenticated === true;

          session.user.twittername = u.twitterUsername;
          session.user.twittertag = u.twitterTag;
          session.user.twitterimage = u.twitterPicture;

          session.user.githubname = u.githubUsername;
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
            .then(takeUniqueOrNull);

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
            updateData.subscriptionPlan = SubscriptionPlan.Free;
            updateData.theme = "classic";
            updateData.updateInterval = UpdateInterval.EVERY_MONTH;

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