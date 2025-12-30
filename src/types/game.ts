/**
 * Game Types for Open Source Games Platform
 *
 * NOTE: The canonical Game type is defined in @/db/schema.ts via Drizzle.
 * This file contains types for scraping, GitHub API, and data transformation.
 * Import Game from @/db/schema for application code.
 */

// Re-export the canonical Game type from Drizzle schema
export type { Game, NewGame } from "@/db/schema";

/** Raw game data parsed from bobeff/open-source-games README */
export interface ParsedGame {
  name: string;
  repoUrl: string;
  description?: string;
  category?: string;
}

/** GitHub repository data from API */
export interface GitHubRepoData {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  default_branch: string;
  open_issues_count: number;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  homepage: string | null;
}

/** GitHub release data */
export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: {
    name: string;
    download_count: number;
    browser_download_url: string;
  }[];
}

/** Scraped game with GitHub data (before DB insert) */
export interface ScrapedGame {
  slug: string;
  title: string;
  repoUrl: string;
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  license: string | null;
  createdAt: string;
  lastCommitAt: string;
  latestRelease: string | null;
  downloadCount: number;
  isMultiplayer: boolean;
  isArchived: boolean;
  homepage: string | null;
  forks: number;
  openIssues: number;
  category: string | null;
  etag: string | null;
}

/** Scraper output format */
export interface ScraperOutput {
  scrapedAt: string;
  totalGames: number;
  games: ScrapedGame[];
  errors: ScraperError[];
}

/** Scraper error entry */
export interface ScraperError {
  repoUrl: string;
  error: string;
  timestamp: string;
}

/** Game update tier for smart sync */
export type UpdateTier = "active" | "inactive" | "dead";

/** Rate limit status */
export interface RateLimitStatus {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

/** AI Review generation request */
export interface AIReviewRequest {
  title: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  category: string | null;
}

/** AI Review generation response */
export interface AIReviewResponse {
  aiReview: string;
  metaTitle: string;
  metaDescription: string;
}

/**
 * Database game record type is now derived from Drizzle schema.
 * Use `Game` from @/db/schema instead.
 * For raw D1 rows (snake_case), see RawGameRow in @/lib/db-queries.ts
 */

/** Sync statistics */
export interface SyncStats {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  startTime: Date;
  endTime: Date;
}
