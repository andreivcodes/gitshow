CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`automaticallyUpdate` integer DEFAULT true,
	`lastUpdateTimestamp` integer,
	`updateInterval` integer DEFAULT 720 NOT NULL,
	`theme` text,
	`subscriptionPlan` text,
	`lastSubscriptionTimestamp` integer,
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
	`twitterOAuthTokenSecret` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stripeCustomerId_idx` ON `user` (`stripeCustomerId`);--> statement-breakpoint
CREATE INDEX `subscriptionPlan_idx` ON `user` (`subscriptionPlan`);--> statement-breakpoint
CREATE INDEX `lastRefreshTimestamp_idx` ON `user` (`lastSubscriptionTimestamp`);