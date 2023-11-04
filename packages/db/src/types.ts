import { Generated } from "kysely";

export interface UsersTable {
  id: Generated<number>;

  email: string;
  name: string;

  stripeCustomerId: string | null;

  githubId: string | null;
  githubUsername: string | null;
  githubToken: string | null;

  twitterId: string | null;
  twitterUsername: string | null;
  twitterOAuthToken: string | null;
  twitterOAuthTokenSecret: string | null;

  isFree: boolean | null;
  isStandard: boolean | null;
  isPremium: boolean | null;

  lastSubscriptionTimestamp: Date | null;
}

export interface Database {
  users: UsersTable;
}
