import { type DefaultSession, type NextAuthOptions } from "next-auth";
import Github, { GithubProfile } from "next-auth/providers/github";
import TwitterLegacy, {
  TwitterLegacyProfile,
} from "next-auth/providers/twitter";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import AES from "crypto-js/aes";
import { RefreshInterval, db } from "@gitshow/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      automaticallyUpdate: boolean;
      lastUpdateTimestamp: Date | null;
      updateInterval: RefreshInterval;

      theme: AvailableThemeNames;

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
          .selectFrom("user")
          .where("email", "=", session.user.email)
          .selectAll()
          .executeTakeFirst();

        if (u) {
          session.user.automaticallyUpdate = u.automaticallyUpdate === true;
          session.user.lastUpdateTimestamp = u.lastUpdateTimestamp ?? null;
          session.user.updateInterval = u.updateInterval as RefreshInterval;

          session.user.theme = u.theme as AvailableThemeNames;

          session.user.lastSubscriptionTimestamp =
            u.lastUpdateTimestamp ?? null;

          session.user.fullyAuthenticated =
            session.user.githubAuthenticated &&
            session.user.twitterAuthenticated;
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

            updateData.githubToken = AES.encrypt(
              JSON.stringify(account.access_token),
              process.env.TOKENS_SECRET!
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
              JSON.stringify(account.oauth_token),
              process.env.TOKENS_SECRET!
            ).toString();
            updateData.twitterOAuthTokenSecret = AES.encrypt(
              JSON.stringify(account.oauth_token_secret),
              process.env.TOKENS_SECRET!
            ).toString();
            updateData.twitterAuthenticated = true;
            break;
        }

        try {
          const existingUser = await db
            .selectFrom("user")
            .where("email", "=", profile.email)
            .selectAll()
            .executeTakeFirst();

          if (existingUser) {
            await db
              .updateTable("user")
              .where("email", "=", profile.email)
              .set(updateData)
              .execute();

            await db
              .insertInto("jobQueue")
              .values({ userId: existingUser.id })
              .execute();
          } else {
            updateData.theme = "normal";
            updateData.updateInterval = RefreshInterval.EVERY_MONTH;

            const res = await db
              .insertInto("user")
              .values(updateData)
              .returning("id as id")
              .executeTakeFirst();

            if (res)
              await db
                .insertInto("jobQueue")
                .values({ userId: res.id })
                .execute();
          }
        } catch (error) {
          console.error("Failed to retrieve or update user:", error);
        }
      }

      return token;
    },
  },
};
