import { defineConfig } from 'auth-astro';
import GitHub from '@auth/core/providers/github'
import Twitter, { type TwitterProfile } from "@auth/core/providers/twitter"
import { RefreshInterval } from '@prisma/client';
import { prisma } from "./src/lib/db";
import AES from "crypto-js/aes";


export default defineConfig({
  secret: import.meta.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
    }),
    Twitter({
      clientId: import.meta.env.TWITTER_CONSUMER_KEY,
      clientSecret: import.meta.env.TWITTER_CONSUMER_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user.email) {
        const u = await prisma.user.findFirst({
          where: { email: session.user.email },
        });

      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile && profile.email) {
        let updateData:any = {
          email: profile?.email,
        };

        switch (account.provider) {
          case "github":
            updateData.githubId = account.providerAccountId;
            updateData.githubUsername = (profile).login;

            updateData.githubToken = AES.encrypt(
              JSON.stringify(account.access_token),
              import.meta.env.TOKENS_SECRET,
            ).toString();
            updateData.githubAuthenticated = true;
            break;

          case "twitter":
            updateData.twitterId = account.providerAccountId;
            updateData.twitterTag = (
              profile
            ).screen_name;
            updateData.twitterUsername = (profile as TwitterProfile).name;
            updateData.twitterPicture = (
              profile as TwitterProfile
            ).data.profile_image_url?.replace("_normal.jpg", ".jpg");

            updateData.twitterOAuthToken = AES.encrypt(
              JSON.stringify(account.oauth_token),
              import.meta.env.TOKENS_SECRET,
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              JSON.stringify(account.oauth_token_secret),
              import.meta.env.TOKENS_SECRET,
            ).toString();
            updateData.twitterAuthenticated = true;
            break;
        }

        try {
          const existingUser = await prisma.user.findFirst({
            where: { email: profile.email },
          });

          if (existingUser) {
            const user = await prisma.user.update({
              where: { email: profile.email },
              data: updateData,
            });

            await prisma.queue.create({
              data: { userId: user.id },
            });
          } else {
            updateData.theme = "normal";
            updateData.updateInterval = RefreshInterval.EVERY_MONTH;

            const user = await prisma.user.create({ data: updateData });

            await prisma.queue.create({
              data: { userId: user.id },
            });
          }
        } catch (error) {
          console.error("Failed to retrieve or update user:", error);
        }
      }

      return token;
    },
  },
});
