ALTER TABLE `user` RENAME COLUMN `refreshInterval` TO `updateInterval`;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `lastRefreshTimestamp`;