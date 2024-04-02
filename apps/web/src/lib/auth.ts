import { AES } from "crypto-js";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import Github, { GithubProfile } from "next-auth/providers/github";
import TwitterLegacy, { TwitterLegacyProfile } from "next-auth/providers/twitter";
import { stripe } from "./stripe-server";
import { RefreshInterval, SubscriptionPlan } from "@prisma/client";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import { QUEUE_NAME, Rabbit_Message, prisma } from "@/lib/db";
import amqplib from "amqplib";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      automaticallyUpdate: boolean;
      lastUpdateTimestamp: Date | null;
      updateInterval: RefreshInterval;

      theme: AvailableThemeNames;

      subscriptionPlan: SubscriptionPlan;
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
        const u = await prisma.user.findFirst({ where: { email: session.user.email } });

        if (u) {
          session.user.automaticallyUpdate = u.automaticallyUpdate === true;
          session.user.lastUpdateTimestamp = u.lastUpdateTimestamp ?? null;
          session.user.updateInterval = u.updateInterval as RefreshInterval;

          session.user.theme = u.theme as AvailableThemeNames;

          session.user.subscriptionPlan = u.subscriptionPlan as SubscriptionPlan;
          session.user.lastSubscriptionTimestamp = u.lastSubscriptionTimestamp ?? null;

          session.user.fullyAuthenticated = session.user.githubAuthenticated && session.user.twitterAuthenticated;
          session.user.githubAuthenticated = u.githubAuthenticated === true;
          session.user.twitterAuthenticated = u.twitterAuthenticated === true;

          session.user.twittername = u.twitterUsername ?? null;
          session.user.twittertag = u.twitterTag ?? null;
          session.user.twitterimage = u.twitterPicture ?? null;

          session.user.githubname = u.githubUsername ?? null;
        }
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile && profile.email) {
        let updateData: any = {
          email: profile?.email,
        };

        switch (account.provider) {
          case "github":
            updateData.githubId = account.providerAccountId;
            updateData.githubUsername = (profile as GithubProfile).login;
            updateData.name = (profile as GithubProfile).name ?? "Unknown";

            updateData.githubToken = AES.encrypt(account.access_token ?? "", process.env.TOKENS_ENCRYPT!).toString();
            updateData.githubAuthenticated = true;
            break;

          case "twitter":
            updateData.twitterId = account.providerAccountId;
            updateData.twitterTag = (profile as TwitterLegacyProfile).screen_name;
            updateData.twitterUsername = (profile as TwitterLegacyProfile).name;
            updateData.twitterPicture = (profile as TwitterLegacyProfile).profile_image_url_https?.replace(
              "_normal.jpg",
              ".jpg",
            );

            updateData.twitterOAuthToken = AES.encrypt(
              (account.oauth_token as string) ?? "",
              process.env.TOKENS_ENCRYPT!,
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              (account.oauth_token_secret as string) ?? "",
              process.env.TOKENS_ENCRYPT!,
            ).toString();
            updateData.twitterAuthenticated = true;
            break;
        }

        try {
          const existingUser = await prisma.user.findFirst({ where: { email: profile.email } });

          if (existingUser) {
            const user = await prisma.user.update({ where: { email: profile.email }, data: updateData });

            let rbmq_conn = await amqplib.connect(process.env.RABBITMQ_URL!);
            let rbmq_ch = await rbmq_conn.createChannel();

            const message: Rabbit_Message = {
              userId: user.id,
            };

            if (rbmq_ch) rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
            rbmq_conn.close();
          } else {
            const stripeCustomer = await stripe.customers.create({
              email: profile.email,
            });

            updateData.stripeCustomerId = stripeCustomer.id;
            updateData.subscriptionPlan = SubscriptionPlan.FREE;
            updateData.theme = "normal";
            updateData.updateInterval = RefreshInterval.EVERY_MONTH;

            const user = await prisma.user.create({ data: updateData });

            let rbmq_conn = await amqplib.connect(process.env.RABBITMQ_URL!);
            let rbmq_ch = await rbmq_conn.createChannel();

            const message: Rabbit_Message = {
              userId: user.id,
            };

            if (rbmq_ch) rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));
            rbmq_conn.close();
          }
        } catch (error) {
          console.error("Failed to retrieve or update user:", error);
        }
      }

      return token;
    },
  },
};
