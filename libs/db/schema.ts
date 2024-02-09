import { SubscriptionPlan } from "@gitshow/gitshow-lib";
import {
  text,
  integer,
  sqliteTable,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable(
  "user",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    name: text("name"),

    automaticallyUpdate: integer("automaticallyUpdate", {
      mode: "boolean",
    }).default(true),
    lastUpdateTimestamp: integer("lastUpdateTimestamp", {
      mode: "timestamp",
    }),
    updateInterval: integer("updateInterval", { mode: "number" })
      .default(720)
      .notNull(),

    theme: text("theme", {
      enum: ["normal", "classic", "githubDark", "dracula", "bnw", "spooky"],
    }),
    subscriptionPlan: text("subscriptionPlan", {
      enum: [SubscriptionPlan.Free, SubscriptionPlan.Premium],
    }),
    lastSubscriptionTimestamp: integer("lastSubscriptionTimestamp", {
      mode: "timestamp",
    }),

    stripeCustomerId: text("stripeCustomerId"),

    githubAuthenticated: integer("githubAuthenticated", {
      mode: "boolean",
    }).default(false),
    twitterAuthenticated: integer("twitterAuthenticated", {
      mode: "boolean",
    }).default(false),

    githubId: text("githubId"),
    githubUsername: text("githubUsername"),
    githubToken: text("githubToken"),

    twitterId: text("twitterId"),
    twitterUsername: text("twitterUsername"),
    twitterTag: text("twitterTag"),
    twitterPicture: text("twitterPicture"),
    twitterOAuthToken: text("twitterOAuthToken"),
    twitterOAuthTokenSecret: text("twitterOAuthTokenSecret"),
  },
  (user) => ({
    stripeCustomerIdx: uniqueIndex("stripeCustomerId_idx").on(
      user.stripeCustomerId
    ),
    subscriptionTypeIdx: index("subscriptionPlan_idx").on(
      user.subscriptionPlan
    ),
    lastRefreshTimestampIdx: index("lastRefreshTimestamp_idx").on(
      user.lastSubscriptionTimestamp
    ),
  })
);
