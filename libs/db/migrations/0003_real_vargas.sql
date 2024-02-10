ALTER TABLE `user` RENAME COLUMN `subscriptionType` TO `subscriptionPlan`;--> statement-breakpoint
DROP INDEX IF EXISTS `subscriptionType_idx`;--> statement-breakpoint
CREATE INDEX `subscriptionPlan_idx` ON `user` (`subscriptionPlan`);