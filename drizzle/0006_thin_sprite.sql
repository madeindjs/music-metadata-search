DELETE FROM scan_tracks;--> statement-breakpoint
DELETE FROM scans;--> statement-breakpoint
DELETE FROM tracks;--> statement-breakpoint
ALTER TABLE tracks ADD `sampleRate` integer;