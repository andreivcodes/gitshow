import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const SubscriptionPlan = {
    FREE: "FREE",
    PREMIUM: "PREMIUM"
} as const;
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];
export const RefreshInterval = {
    EVERY_DAY: "EVERY_DAY",
    EVERY_WEEK: "EVERY_WEEK",
    EVERY_MONTH: "EVERY_MONTH"
} as const;
export type RefreshInterval = (typeof RefreshInterval)[keyof typeof RefreshInterval];
export type User = {
    id: Generated<number>;
    email: string;
    name: string | null;
    automaticallyUpdate: Generated<boolean>;
    lastUpdateTimestamp: Timestamp | null;
    updateInterval: Generated<RefreshInterval>;
    theme: Generated<string>;
    subscriptionPlan: Generated<SubscriptionPlan>;
    lastSubscriptionTimestamp: Timestamp | null;
    stripeCustomerId: string | null;
    githubAuthenticated: Generated<boolean>;
    twitterAuthenticated: Generated<boolean>;
    githubId: string | null;
    githubUsername: string | null;
    githubToken: string | null;
    twitterId: string | null;
    twitterUsername: string | null;
    twitterTag: string | null;
    twitterPicture: string | null;
    twitterOAuthToken: string | null;
    twitterOAuthTokenSecret: string | null;
};
export type DB = {
    user: User;
};
