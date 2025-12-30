import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

/**
 * Games table schema for Open Source Games Platform
 *
 * Stores game metadata from GitHub repositories with SEO and affiliate fields
 * for monetization. Uses JSON columns for arrays (topics, platforms, etc.)
 */
export const games = sqliteTable(
  "games",
  {
    // Core identifiers
    id: text("id").primaryKey(), // GitHub owner-repo format
    title: text("title").notNull(),
    repoUrl: text("repo_url").notNull(),
    description: text("description"),
    stars: integer("stars").notNull().default(0),

    // GitHub metadata
    language: text("language"),
    genre: text("genre"), // Primary genre (rpg, fps, puzzle, etc.) - derived from topics
    topics: text("topics", { mode: "json" }).$type<string[]>(),
    lastCommitAt: integer("last_commit_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }),
    homepage: text("homepage"),
    forks: integer("forks").notNull().default(0),
    openIssues: integer("open_issues").notNull().default(0),
    isArchived: integer("is_archived", { mode: "boolean" })
      .notNull()
      .default(false),
    etag: text("etag"),
    category: text("category"), // Original source category (from README section)

    // SEO fields
    aiReview: text("ai_review"), // 300-500 word AI-generated review
    metaTitle: text("meta_title"), // SEO-optimized title
    metaDescription: text("meta_description"), // SEO meta description
    slug: text("slug").notNull().unique(), // URL-friendly slug (e.g., "minecraft-clone")

    // Affiliate/Monetization fields
    affiliateDevices: text("affiliate_devices", { mode: "json" }).$type<
      {
        name: string;
        url: string;
        price: string;
        image?: string;
        description?: string;
      }[]
    >(),
    isMultiplayer: integer("is_multiplayer", { mode: "boolean" })
      .notNull()
      .default(false),

    // Media
    thumbnailUrl: text("thumbnail_url"), // R2 CDN URL for WebP thumbnail
    screenshotUrls: text("screenshot_urls", { mode: "json" }).$type<string[]>(),

    // Additional metadata
    license: text("license"),
    platforms: text("platforms", { mode: "json" }).$type<string[]>(),
    latestRelease: text("latest_release"),
    downloadCount: integer("download_count").notNull().default(0),

    // Timestamps
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [
    // Index for sorting by popularity
    index("stars_idx").on(table.stars),
    // Index for filtering by programming language
    index("language_idx").on(table.language),
    // Index for filtering by genre
    index("genre_idx").on(table.genre),
    // Index for slug lookups (unique constraint handles this, but explicit for clarity)
    index("slug_idx").on(table.slug),
  ],
);

/**
 * Categories table for pSEO pages
 *
 * Stores pre-defined category aggregations for programmatic SEO pages
 * (e.g., "best-open-source-rpg-games", "games-written-in-rust")
 */
export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(), // UUID or slug-based ID
    slug: text("slug").notNull().unique(), // URL slug (e.g., "best-open-source-rpg-games")
    title: text("title").notNull(), // Display title
    description: text("description"), // SEO meta description
    filterType: text("filter_type").notNull(), // Type: "genre", "language", "platform", "topic"
    filterValue: text("filter_value").notNull(), // Value to filter by
    aiContent: text("ai_content"), // AI-generated category introduction (300-500 words)
    gameCount: integer("game_count").notNull().default(0), // Cached count of games in category
    metaTitle: text("meta_title"), // SEO optimized title
    metaDescription: text("meta_description"), // SEO meta description
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => [
    index("categories_slug_idx").on(table.slug),
    index("categories_filter_type_idx").on(table.filterType),
  ],
);

// Type exports for use in application code
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
