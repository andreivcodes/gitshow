import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type user = {
  email?: string;
  name?: string;
  automaticallyUpdate?: boolean;
  lastUpdateTimestamp?: Date;
  updateInterval?: number;
  theme?: string;
  subscriptionPlan?: string;
  lastSubscriptionTimestamp?: Date;
  stripeCustomerId?: string;
  githubAuthenticated?: boolean;
  twitterAuthenticated?: boolean;
  githubId?: string;
  githubUsername?: string;
  githubToken?: string;
  twitterId?: string;
  twitterUsername?: string;
  twitterTag?: string;
  twitterPicture?: string;
  twitterOAuthToken?: string;
  twitterOAuthTokenSecret?: string;
};
export type DB = {
  user: user;
};
