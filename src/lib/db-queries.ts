/**
 * Database Query Functions for Open Source Games Platform
 * Edge runtime compatible - uses Cloudflare D1
 */

import {
  eq,
  ne,
  desc,
  asc,
  and,
  gte,
  lte,
  sql,
  count,
  inArray,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { games, categories, Game, Category } from "@/db/schema";
import type { Database } from "@/db";
import type {
  GameFilters,
  PaginationParams,
  SortParams,
  SortField,
} from "./api-utils";
import { getCachedPlatformStats, getCachedGame } from "./cache";

// Use the Database type from our db module which includes schema types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDatabase = Database | ReturnType<typeof drizzle<any>>;

// ============================================================================
// Types
// ============================================================================

export interface GameWithHighlight extends Game {
  highlight?: string;
  rank?: number;
}

export interface SearchResult {
  results: GameWithHighlight[];
  total: number;
}

export interface GamesResult {
  games: Game[];
  total: number;
}

export interface PlatformStats {
  totalGames: number;
  gamesByLanguage: { language: string; count: number }[];
  gamesByGenre: { genre: string; count: number }[];
  trendingGames: Game[];
  recentlyUpdated: Game[];
  topStars: number;
  avgStars: number;
}

// ============================================================================
// Database Connection Helper
// ============================================================================

export function getDb(d1: D1Database) {
  return drizzle(d1);
}

// ============================================================================
// Sort Field Mapping
// ============================================================================

function getSortColumn(field: SortField) {
  const mapping = {
    stars: games.stars,
    lastCommit: games.lastCommitAt,
    createdAt: games.createdAt,
    title: games.title,
    downloadCount: games.downloadCount,
  };
  return mapping[field] || games.stars;
}

// ============================================================================
// Game Queries
// ============================================================================

/**
 * Get games with filters, pagination, and sorting
 */
export async function getGames(
  db: AnyDatabase,
  filters: GameFilters,
  pagination: PaginationParams,
  sort: SortParams,
): Promise<GamesResult> {
  const conditions = buildFilterConditions(filters);
  const sortColumn = getSortColumn(sort.field);
  const orderFn = sort.order === "asc" ? asc : desc;

  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(games)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = countResult[0]?.count ?? 0;

  // Get paginated results
  const results = await db
    .select()
    .from(games)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderFn(sortColumn))
    .limit(pagination.pageSize)
    .offset(pagination.offset);

  return { games: results, total };
}

/**
 * Get a single game by slug (database version)
 * Wrapper for cache integration
 */
export async function getGameBySlugFromDb(
  db: AnyDatabase,
  slug: string,
): Promise<Game | null> {
  const result = await db.select().from(games).where(eq(games.slug, slug));
  return result[0] ?? null;
}

/**
 * Get a single game by slug with KV cache (6 hour TTL)
 */
export async function getGameBySlugCached(
  db: AnyDatabase,
  slug: string,
): Promise<Game | null> {
  return getCachedGame(slug, () => getGameBySlugFromDb(db, slug));
}

/**
 * Find "related" games based on shared topics (primary) and language (fallback).
 */
export async function getRelatedGamesFromDb(
  db: AnyDatabase,
  game: Game,
  limit = 4,
): Promise<Game[]> {
  const collected: Game[] = [];
  const seen = new Set<string>([game.id]);

  const addUnique = (rows: Game[]) => {
    for (const row of rows) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      collected.push(row);
      if (collected.length >= limit) return;
    }
  };

  if (game.topics && game.topics.length > 0) {
    const topicExists = game.topics
      .slice(0, 10)
      .map(
        (topic) =>
          sql`EXISTS (SELECT 1 FROM json_each(${games.topics}) WHERE value = ${topic})`,
      );

    const rows = await db
      .select()
      .from(games)
      .where(
        and(ne(games.id, game.id), sql`(${sql.join(topicExists, sql` OR `)})`),
      )
      .orderBy(desc(games.stars))
      .limit(limit);

    addUnique(rows);
  }

  if (collected.length < limit && game.language) {
    const rows = await db
      .select()
      .from(games)
      .where(and(ne(games.id, game.id), eq(games.language, game.language)))
      .orderBy(desc(games.stars))
      .limit(limit - collected.length);

    addUnique(rows);
  }

  if (collected.length < limit) {
    const rows = await db
      .select()
      .from(games)
      .where(ne(games.id, game.id))
      .orderBy(desc(games.stars))
      .limit(limit - collected.length);

    addUnique(rows);
  }

  return collected.slice(0, limit);
}

/**
 * Get a single game by ID
 */
export async function getGameById(
  db: AnyDatabase,
  id: string,
): Promise<Game | null> {
  const result = await db.select().from(games).where(eq(games.id, id));
  return result[0] ?? null;
}

/**
 * Get games by category (language, genre, topic, etc.)
 */
export async function getGamesByCategory(
  db: AnyDatabase,
  filterType: string,
  filterValue: string,
  pagination: PaginationParams,
): Promise<GamesResult> {
  const filters: GameFilters = {};

  switch (filterType) {
    case "language":
      filters.languages = [filterValue];
      break;
    case "genre":
      filters.genres = [filterValue];
      break;
    case "topic":
      filters.topics = [filterValue];
      break;
    case "platform":
      filters.platforms = [filterValue.toLowerCase()];
      break;
    default:
      break;
  }

  return getGames(db, filters, pagination, { field: "stars", order: "desc" });
}

// ============================================================================
// Search Queries (FTS5)
// ============================================================================

/**
 * Check if FTS5 table exists in the database
 */
async function ftsTableExists(d1: D1Database): Promise<boolean> {
  try {
    const result = await d1
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='games_fts'",
      )
      .first<{ name: string }>();
    return !!result;
  } catch {
    return false;
  }
}

/**
 * Search games using FTS5 full-text search
 * Returns results with highlighted matches
 * Falls back to LIKE search if FTS5 table is not available
 */
export async function searchGames(
  d1: D1Database,
  query: string,
  filters: GameFilters,
  pagination: PaginationParams,
): Promise<SearchResult> {
  // Check if FTS5 table exists, fall back to LIKE search if not
  const hasFts = await ftsTableExists(d1);
  if (!hasFts) {
    return searchGamesFallback(d1, query, filters, pagination);
  }

  try {
    // Build filter conditions for JOIN
    const filterClauses: string[] = [];
    const filterParams: (string | number)[] = [];

    if (filters.languages && filters.languages.length > 0) {
      filterClauses.push(
        `g.language IN (${filters.languages.map(() => "?").join(", ")})`,
      );
      filterParams.push(...filters.languages);
    }

    if (filters.genres && filters.genres.length > 0) {
      filterClauses.push(
        `g.genre IN (${filters.genres.map(() => "?").join(", ")})`,
      );
      filterParams.push(...filters.genres);
    }

    if (filters.minStars !== undefined) {
      filterClauses.push("g.stars >= ?");
      filterParams.push(filters.minStars);
    }

    if (filters.maxStars !== undefined) {
      filterClauses.push("g.stars <= ?");
      filterParams.push(filters.maxStars);
    }

    if (filters.isMultiplayer !== undefined) {
      filterClauses.push("g.is_multiplayer = ?");
      filterParams.push(filters.isMultiplayer ? 1 : 0);
    }

    if (filters.topics && filters.topics.length > 0) {
      filterClauses.push(
        `EXISTS (SELECT 1 FROM json_each(g.topics) WHERE value IN (${filters.topics
          .map(() => "?")
          .join(", ")}))`,
      );
      filterParams.push(...filters.topics);
    }

    if (filters.platforms && filters.platforms.length > 0) {
      for (const platform of filters.platforms) {
        filterClauses.push(
          "EXISTS (SELECT 1 FROM json_each(g.platforms) WHERE lower(value) = ?)",
        );
        filterParams.push(platform.toLowerCase());
      }
    }

    const filterWhereClause =
      filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : "";

    // Prepare FTS5 query - add wildcards for partial matching
    // SECURITY: Escape FTS5 special characters to prevent injection
    const ftsQuery = query
      .split(/\s+/)
      .filter((term) => term.length > 0)
      .map((term) => {
        // Escape double quotes by doubling them (FTS5 escape sequence)
        const escaped = term.replace(/"/g, '""');
        return `"${escaped}"*`;
      })
      .join(" ");

    // Count total matches
    const countSql = `
      SELECT COUNT(*) as total
      FROM games_fts
      JOIN games g ON games_fts.id = g.id
      WHERE games_fts MATCH ?
      ${filterWhereClause}
    `;

    const countResult = await d1
      .prepare(countSql)
      .bind(ftsQuery, ...filterParams)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results with highlights
    const searchSql = `
      SELECT
        g.*,
        snippet(games_fts, 1, '<mark>', '</mark>', '...', 64) as highlight,
        rank
      FROM games_fts
      JOIN games g ON games_fts.id = g.id
      WHERE games_fts MATCH ?
      ${filterWhereClause}
      ORDER BY rank
      LIMIT ?
      OFFSET ?
    `;

    const searchResult = await d1
      .prepare(searchSql)
      .bind(ftsQuery, ...filterParams, pagination.pageSize, pagination.offset)
      .all<RawGameRow & { highlight: string | null; rank: number | null }>();

    const results = (searchResult.results || []).map((row) => {
      const game = mapRawRowToGame(row);
      return {
        ...game,
        highlight: row.highlight || undefined,
        rank: row.rank ?? undefined,
      } satisfies GameWithHighlight;
    });

    return {
      results,
      total,
    };
  } catch {
    // If FTS5 search fails, fall back to LIKE search
    return searchGamesFallback(d1, query, filters, pagination);
  }
}

/**
 * Get search suggestions (autocomplete)
 * Falls back to LIKE search if FTS5 table is not available
 */
export async function getSearchSuggestions(
  d1: D1Database,
  prefix: string,
  limit = 10,
): Promise<{ title: string; slug: string }[]> {
  // Check if FTS5 table exists first
  const hasFts = await ftsTableExists(d1);
  if (!hasFts) {
    return getSearchSuggestionsFallback(d1, prefix, limit);
  }

  try {
    // SECURITY: Escape double quotes to prevent FTS5 injection
    const escapedPrefix = prefix.replace(/"/g, '""');
    const ftsQuery = `"${escapedPrefix}"*`;

    const sqlQuery = `
      SELECT DISTINCT g.title, g.slug
      FROM games_fts
      JOIN games g ON games_fts.id = g.id
      WHERE games_fts MATCH ?
      ORDER BY g.stars DESC
      LIMIT ?
    `;

    const result = await d1
      .prepare(sqlQuery)
      .bind(ftsQuery, limit)
      .all<{ title: string; slug: string }>();

    return result.results || [];
  } catch {
    // If FTS5 search fails, fall back to LIKE search
    return getSearchSuggestionsFallback(d1, prefix, limit);
  }
}

/**
 * Fallback search suggestions when FTS5 isn't available.
 */
export async function getSearchSuggestionsFallback(
  d1: D1Database,
  prefix: string,
  limit = 10,
): Promise<{ title: string; slug: string }[]> {
  const like = `${prefix}%`;

  const result = await d1
    .prepare(
      `
      SELECT DISTINCT title, slug
      FROM games
      WHERE title LIKE ? COLLATE NOCASE
      ORDER BY stars DESC
      LIMIT ?
    `,
    )
    .bind(like, limit)
    .all<{ title: string; slug: string }>();

  return result.results || [];
}

/**
 * Fallback full-text search when FTS5 isn't available.
 *
 * Uses simple LIKE matching across title/description/ai_review/topics.
 */
export async function searchGamesFallback(
  d1: D1Database,
  query: string,
  filters: GameFilters,
  pagination: PaginationParams,
): Promise<SearchResult> {
  const filterClauses: string[] = [];
  const filterParams: (string | number)[] = [];

  if (filters.languages && filters.languages.length > 0) {
    filterClauses.push(
      `g.language IN (${filters.languages.map(() => "?").join(", ")})`,
    );
    filterParams.push(...filters.languages);
  }

  if (filters.genres && filters.genres.length > 0) {
    filterClauses.push(
      `g.genre IN (${filters.genres.map(() => "?").join(", ")})`,
    );
    filterParams.push(...filters.genres);
  }

  if (filters.minStars !== undefined) {
    filterClauses.push("g.stars >= ?");
    filterParams.push(filters.minStars);
  }

  if (filters.maxStars !== undefined) {
    filterClauses.push("g.stars <= ?");
    filterParams.push(filters.maxStars);
  }

  if (filters.isMultiplayer !== undefined) {
    filterClauses.push("g.is_multiplayer = ?");
    filterParams.push(filters.isMultiplayer ? 1 : 0);
  }

  if (filters.topics && filters.topics.length > 0) {
    filterClauses.push(
      `EXISTS (SELECT 1 FROM json_each(g.topics) WHERE value IN (${filters.topics
        .map(() => "?")
        .join(", ")}))`,
    );
    filterParams.push(...filters.topics);
  }

  if (filters.platforms && filters.platforms.length > 0) {
    for (const platform of filters.platforms) {
      filterClauses.push(
        "EXISTS (SELECT 1 FROM json_each(g.platforms) WHERE lower(value) = ?)",
      );
      filterParams.push(platform.toLowerCase());
    }
  }

  const filterWhereClause =
    filterClauses.length > 0 ? `AND ${filterClauses.join(" AND ")}` : "";

  const like = `%${query}%`;
  const searchWhereClause = `(
    g.title LIKE ? COLLATE NOCASE OR
    COALESCE(g.description, '') LIKE ? COLLATE NOCASE OR
    COALESCE(g.ai_review, '') LIKE ? COLLATE NOCASE OR
    COALESCE(g.topics, '') LIKE ? COLLATE NOCASE
  )`;

  const countSql = `
    SELECT COUNT(*) as total
    FROM games g
    WHERE ${searchWhereClause}
    ${filterWhereClause}
  `;

  const countResult = await d1
    .prepare(countSql)
    .bind(like, like, like, like, ...filterParams)
    .first<{ total: number }>();

  const total = countResult?.total ?? 0;

  const searchSql = `
    SELECT g.*, '' as highlight, 0 as rank
    FROM games g
    WHERE ${searchWhereClause}
    ${filterWhereClause}
    ORDER BY g.stars DESC
    LIMIT ?
    OFFSET ?
  `;

  const searchResult = await d1
    .prepare(searchSql)
    .bind(
      like,
      like,
      like,
      like,
      ...filterParams,
      pagination.pageSize,
      pagination.offset,
    )
    .all<RawGameRow & { highlight: string | null; rank: number | null }>();

  const results = (searchResult.results || []).map((row) => {
    const game = mapRawRowToGame(row);
    return {
      ...game,
      highlight: row.highlight || undefined,
      rank: row.rank ?? undefined,
    } satisfies GameWithHighlight;
  });

  return { results, total };
}

// ============================================================================
// Category Queries
// ============================================================================

/**
 * Get all categories from database
 */
export async function getCategoriesFromDb(
  db: AnyDatabase,
): Promise<Category[]> {
  return db.select().from(categories).orderBy(desc(categories.gameCount));
}

/**
 * Get category by slug from database
 */
export async function getCategoryBySlugFromDb(
  db: AnyDatabase,
  slug: string,
): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));

  return result[0] ?? null;
}

/**
 * Get categories by type from database
 */
export async function getCategoriesByType(
  db: AnyDatabase,
  filterType: string,
): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.filterType, filterType))
    .orderBy(desc(categories.gameCount));
}

// ============================================================================
// Statistics Queries
// ============================================================================

/**
 * Get platform statistics (cached)
 * Uses 24-hour cache TTL for category stats
 */
export async function getStats(d1: D1Database): Promise<PlatformStats> {
  return getCachedPlatformStats(() => getStatsFromDb(d1));
}

/**
 * Get platform statistics directly from database (no cache)
 * Optimized: Uses parallel queries and combined aggregate query to reduce latency
 */
export async function getStatsFromDb(d1: D1Database): Promise<PlatformStats> {
  const db = getDb(d1);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Execute all queries in parallel for better performance
  const [
    aggregateStats,
    languageStats,
    genreStats,
    trendingGames,
    recentlyUpdated,
  ] = await Promise.all([
    // Combined aggregate query: total count, max stars, avg stars in one query
    d1
      .prepare(
        `
        SELECT
          COUNT(*) as total_games,
          MAX(stars) as top_stars,
          AVG(stars) as avg_stars
        FROM games
      `,
      )
      .first<{ total_games: number; top_stars: number; avg_stars: number }>(),

    // Games by language
    d1
      .prepare(
        `
        SELECT language, COUNT(*) as count
        FROM games
        WHERE language IS NOT NULL AND language != ''
        GROUP BY language
        ORDER BY count DESC
        LIMIT 20
      `,
      )
      .all<{ language: string; count: number }>(),

    // Games by genre
    d1
      .prepare(
        `
        SELECT genre, COUNT(*) as count
        FROM games
        WHERE genre IS NOT NULL AND genre != ''
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 20
      `,
      )
      .all<{ genre: string; count: number }>(),

    // Trending games (updated in last 30 days, sorted by stars)
    db
      .select()
      .from(games)
      .where(gte(games.lastCommitAt, thirtyDaysAgo))
      .orderBy(desc(games.stars))
      .limit(10),

    // Recently updated games (by last commit date)
    db.select().from(games).orderBy(desc(games.lastCommitAt)).limit(10),
  ]);

  return {
    totalGames: aggregateStats?.total_games ?? 0,
    gamesByLanguage: languageStats.results || [],
    gamesByGenre: genreStats.results || [],
    trendingGames,
    recentlyUpdated,
    topStars: aggregateStats?.top_stars ?? 0,
    avgStars: Math.round(aggregateStats?.avg_stars ?? 0),
  };
}

type RawGameRow = {
  id: string;
  title: string;
  repo_url: string;
  description: string | null;
  stars: number | null;
  language: string | null;
  genre: string | null;
  topics: string | null;
  last_commit_at: number | null;
  created_at: number | null;
  ai_review: string | null;
  meta_title: string | null;
  meta_description: string | null;
  slug: string | null;
  affiliate_devices: string | null;
  is_multiplayer: number | null;
  thumbnail_url: string | null;
  screenshot_urls: string | null;
  license: string | null;
  platforms: string | null;
  latest_release: string | null;
  download_count: number | null;
  updated_at: number | null;
  homepage: string | null;
  forks: number | null;
  open_issues: number | null;
  is_archived: number | null;
  etag: string | null;
  category: string | null;
};

function parseJsonArray(value: string | null): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

function parseJsonAffiliateDevices(
  value: string | null,
): Game["affiliateDevices"] {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? (parsed as NonNullable<Game["affiliateDevices"]>)
      : null;
  } catch {
    return null;
  }
}

function toDateFromUnixSeconds(value: number | null): Date | null {
  if (!value) return null;
  return new Date(value * 1000);
}

function mapRawRowToGame(row: RawGameRow): Game {
  return {
    id: row.id,
    title: row.title,
    repoUrl: row.repo_url,
    description: row.description,
    stars: row.stars ?? 0,
    language: row.language,
    genre: row.genre,
    topics: parseJsonArray(row.topics),
    lastCommitAt: toDateFromUnixSeconds(row.last_commit_at),
    createdAt: toDateFromUnixSeconds(row.created_at),
    aiReview: row.ai_review,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    slug: row.slug ?? row.id,
    affiliateDevices: parseJsonAffiliateDevices(row.affiliate_devices),
    isMultiplayer: Boolean(row.is_multiplayer),
    thumbnailUrl: row.thumbnail_url,
    screenshotUrls: parseJsonArray(row.screenshot_urls),
    license: row.license,
    platforms: parseJsonArray(row.platforms),
    latestRelease: row.latest_release,
    downloadCount: row.download_count ?? 0,
    updatedAt: toDateFromUnixSeconds(row.updated_at),
    homepage: row.homepage,
    forks: row.forks ?? 0,
    openIssues: row.open_issues ?? 0,
    isArchived: Boolean(row.is_archived),
    etag: row.etag,
    category: row.category,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build SQL conditions from filters
 */
function buildFilterConditions(filters: GameFilters) {
  const conditions = [];

  if (filters.languages && filters.languages.length > 0) {
    conditions.push(inArray(games.language, filters.languages));
  }

  if (filters.genres && filters.genres.length > 0) {
    conditions.push(inArray(games.genre, filters.genres));
  }

  if (filters.minStars !== undefined) {
    conditions.push(gte(games.stars, filters.minStars));
  }

  if (filters.maxStars !== undefined) {
    conditions.push(lte(games.stars, filters.maxStars));
  }

  if (filters.isMultiplayer !== undefined) {
    conditions.push(eq(games.isMultiplayer, filters.isMultiplayer));
  }

  if (filters.topics && filters.topics.length > 0) {
    const topicExists = filters.topics.map(
      (topic) =>
        sql`EXISTS (SELECT 1 FROM json_each(${games.topics}) WHERE value = ${topic})`,
    );
    conditions.push(sql`(${sql.join(topicExists, sql` OR `)})`);
  }

  if (filters.platforms && filters.platforms.length > 0) {
    for (const platform of filters.platforms) {
      conditions.push(
        sql`EXISTS (SELECT 1 FROM json_each(${games.platforms}) WHERE lower(value) = ${platform.toLowerCase()})`,
      );
    }
  }

  if (filters.hasRelease) {
    conditions.push(sql`${games.latestRelease} IS NOT NULL`);
  }

  return conditions;
}

/**
 * Update game count for a category
 */
export async function updateCategoryGameCount(
  db: AnyDatabase,
  categoryId: string,
  gameCount: number,
): Promise<void> {
  await db
    .update(categories)
    .set({ gameCount, updatedAt: new Date() })
    .where(eq(categories.id, categoryId));
}
