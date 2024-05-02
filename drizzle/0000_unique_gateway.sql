CREATE TABLE `scans` (
	`id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scan_tracks` (
	`id` integer PRIMARY KEY NOT NULL,
	`scanId` integer,
	`trackId` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`scanId`) REFERENCES `scans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`trackId`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` integer PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`title` text,
	`genre` text NOT NULL,
	`artist` text,
	`album` text,
	`year` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scans_path_unique` ON `scans` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracks_path_unique` ON `tracks` (`path`);