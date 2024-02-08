CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`stripeCustomerId` text,
	`githubAuthenticated` integer DEFAULT false,
	`twitterAuthenticated` integer DEFAULT false,
	`githubId` text,
	`githubUsername` text,
	`githubToken` text,
	`twitterId` text,
	`twitterUsername` text,
	`twitterTag` text,
	`twitterPicture` text,
	`twitterOAuthToken` text,
	`twitterOAuthTokenSecret` text,
	`theme` text,
	`refreshInterval` integer DEFAULT 720 NOT NULL,
	`lastRefreshTimestamp` integer,
	`subscriptionType` text,
	`lastSubscriptionTimestamp` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stripeCustomerId_idx` ON `user` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `subscriptionType_idx` ON `user` (`subscriptionType`);--> statement-breakpoint
CREATE INDEX `lastRefreshTimestamp_idx` ON `user` (`lastSubscriptionTimestamp`);