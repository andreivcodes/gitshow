import "server-only";

import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import TwitterProvider, {
  TwitterLegacyProfile,
} from "next-auth/providers/twitter";
import { AES } from "crypto-js";
import { db } from "../../../../../db/src/index";
import { Config } from "sst/node/config";
import { stripe } from "../../../../utils/stripeServer";

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
      let updatedTokenData: any = {};

      if (account && profile) {
        switch (account.provider) {
          case "github":
            updatedTokenData.githubId = account.providerAccountId;
            updatedTokenData.githubUsername = (profile as GithubProfile).login;
            updatedTokenData.name = (profile as GithubProfile).name;

            updatedTokenData.githubToken = AES.encrypt(
              account.access_token ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();

          case "twitter":
            updatedTokenData.twitterId = account.providerAccountId;
            updatedTokenData.twitterUsername = (
              profile as TwitterLegacyProfile
            ).screen_name;

            updatedTokenData.twitterOAuthToken = AES.encrypt(
              (account.oauth_token as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            updatedTokenData.twitterOAuthTokenSecret = AES.encrypt(
              (account.oauth_token_secret as string) ?? "",
              Config.TOKENS_ENCRYPT
            ).toString();
            break;
        }

        const existingUser = await db
          .selectFrom("users")
          .selectAll()
          .where("users.email", "=", profile.email!)
          .execute();

        if (existingUser.length) {
          await db
            .updateTable("users")
            .set({ ...updatedTokenData })
            .where("users.email", "=", profile.email!)
            .execute();
        } else {
          const stripeCustomer = await stripe.customers.create({
            email: user.email!,
          });

          updatedTokenData.stripeCustomerId = stripeCustomer.id;

          await db
            .insertInto("users")
            .values({ email: profile.email, ...updatedTokenData })
            .execute();
        }
      }

      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
