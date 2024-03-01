import { AvailableThemeNames } from ".";
import { SubscriptionPlan } from "./schema";

export interface UpdateUserEvent {
  email: string;
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  plan: SubscriptionPlan;
  theme: AvailableThemeNames;
}
