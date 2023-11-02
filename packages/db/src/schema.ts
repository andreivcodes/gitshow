import { boolean, date, integer, pgTable, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").primaryKey(),

  stripeCustomerId: text("stripeCustomerId"),

  githubId: text("githubId"),
  githubUsername: text("githubUsername"),
  githubToken: text("githubToken"),

  twitterId: text("twitterId"),
  twitterUsername: text("twitterUsername"),
  twitterOAuthToken: text("twitterOAuthToken"),
  twitterOAuthTokenSecret: text("twitterOAuthTokenSecret"),

  isFree: boolean("isFree").default(true),
  isStandard: boolean("isStandard").default(false),
  isPremium: boolean("isPremium").default(false),
  lastSubscriptionTimestamp: date("lastSubscriptionTimestamp"),
});
