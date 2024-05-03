DROP INDEX IF EXISTS `scans_path_unique`;--> statement-breakpoint
ALTER TABLE scans ADD `ext` text NOT NULL;