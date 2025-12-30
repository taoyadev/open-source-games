-- Migration: Add additional GitHub metadata fields
-- Open Source Games Platform - P2

-- These fields enable richer UI and better filtering without extra GitHub calls.

ALTER TABLE `games` ADD COLUMN `homepage` text;
ALTER TABLE `games` ADD COLUMN `forks` integer DEFAULT 0;
ALTER TABLE `games` ADD COLUMN `open_issues` integer DEFAULT 0;
ALTER TABLE `games` ADD COLUMN `is_archived` integer DEFAULT 0; -- Boolean: 0 or 1
ALTER TABLE `games` ADD COLUMN `etag` text;
ALTER TABLE `games` ADD COLUMN `category` text; -- Original source category

