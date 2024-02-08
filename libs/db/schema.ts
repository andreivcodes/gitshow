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

    theme: text("theme", {
      enum: ["normal", "classic", "githubDark", "dracula", "bnw", "spooky"],
    }),

    refreshInterval: integer("refreshInterval", { mode: "number" })
      .default(720)
      .notNull(),
    lastRefreshTimestamp: integer("lastRefreshTimestamp", {
      mode: "timestamp",
    })
      .default(new Date(0))
      .notNull(),

    subscriptionType: text("subscriptionType", {
      enum: ["free", "premium", "none"],
    }),
    lastSubscriptionTimestamp: integer("lastSubscriptionTimestamp", {
      mode: "timestamp",
    })
      .default(new Date(0))
      .notNull(),
  },
  (user) => ({
    stripeCustomerIdx: uniqueIndex("stripeCustomerId_idx").on(
      user.stripeCustomerId
    ),
    subscriptionTypeIdx: index("subscriptionType_idx").on(
      user.subscriptionType
    ),
    lastRefreshTimestampIdx: index("lastRefreshTimestamp_idx").on(
      user.lastSubscriptionTimestamp
    ),
  })
);
