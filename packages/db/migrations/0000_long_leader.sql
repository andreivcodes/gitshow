CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text,
	"email" text PRIMARY KEY NOT NULL,
	"stripeCustomerId" text,
	"githubId" text,
	"githubUsername" text,
	"githubToken" text,
	"twitterId" text,
	"twitterUsername" text,
	"twitterOAuthToken" text,
	"twitterOAuthTokenSecret" text,
	"isFree" boolean DEFAULT true,
	"isStandard" boolean DEFAULT false,
	"isPremium" boolean DEFAULT false,
	"lastSubscriptionTimestamp" date
);
