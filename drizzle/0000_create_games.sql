-- Migration: Create games and categories tables
-- Open Source Games Platform - P2

-- ============================================================================
-- Games Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS `games` (
  -- Core identifiers
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `repo_url` text NOT NULL,
  `description` text,
  `stars` integer NOT NULL DEFAULT 0,

  -- GitHub metadata
  `language` text,
  `genre` text, -- Primary genre (rpg, fps, puzzle, etc.)
  `topics` text, -- JSON array of strings
  `last_commit_at` integer, -- Unix timestamp
  `created_at` integer, -- Unix timestamp

  -- SEO fields
  `ai_review` text, -- 300-500 word AI-generated review
  `meta_title` text,
  `meta_description` text,
  `slug` text NOT NULL UNIQUE,

  -- Affiliate/Monetization fields
  `affiliate_devices` text, -- JSON array of {name, url, price}
  `is_multiplayer` integer NOT NULL DEFAULT 0, -- Boolean: 0 or 1

  -- Media
  `thumbnail_url` text,
  `screenshot_urls` text, -- JSON array of URLs

  -- Additional metadata
  `license` text,
  `platforms` text, -- JSON array of platform names
  `latest_release` text,
  `download_count` integer NOT NULL DEFAULT 0,

  -- Timestamps
  `updated_at` integer NOT NULL -- Unix timestamp (seconds)
);

-- Index for sorting by popularity (stars)
CREATE INDEX IF NOT EXISTS `stars_idx` ON `games` (`stars`);

-- Index for filtering by programming language
CREATE INDEX IF NOT EXISTS `language_idx` ON `games` (`language`);

-- Index for filtering by genre
CREATE INDEX IF NOT EXISTS `genre_idx` ON `games` (`genre`);

-- Index for slug lookups (already has UNIQUE constraint, explicit for query optimization)
CREATE INDEX IF NOT EXISTS `slug_idx` ON `games` (`slug`);

-- ============================================================================
-- Categories Table (for pSEO pages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `categories` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL UNIQUE,
  `title` text NOT NULL,
  `description` text,
  `filter_type` text NOT NULL, -- "genre", "language", "platform", "topic"
  `filter_value` text NOT NULL,
  `ai_content` text, -- AI-generated category introduction
  `game_count` integer NOT NULL DEFAULT 0,
  `meta_title` text,
  `meta_description` text,
  `created_at` integer, -- Unix timestamp
  `updated_at` integer -- Unix timestamp
);

-- Index for category slug lookups
CREATE INDEX IF NOT EXISTS `categories_slug_idx` ON `categories` (`slug`);

-- Index for filtering categories by type
CREATE INDEX IF NOT EXISTS `categories_filter_type_idx` ON `categories` (`filter_type`);
