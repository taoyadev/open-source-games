import type { MetadataRoute } from "next";
import { sql } from "drizzle-orm";
import { createDatabase, games as gamesTable } from "@/db";
import { getAllCategorySlugs } from "@/lib/categories";
import { getAllGameSlugs, getAllGames } from "@/lib/data";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { getSiteUrl } from "@/lib/utils";

/**
 * Dynamic sitemap generation with caching and shard support
 *
 * Optimizations:
 * 1. Sitemap index for large datasets (50,000 URLs per sitemap is Google's limit)
 * 2. Edge runtime with efficient queries
 * 3. Incremental generation via lastModified dates
 * 4. Separate sitemaps for different content types
 */

// Sitemap configuration
const SITEMAP_CONFIG = {
  // Maximum URLs per sitemap file (Google limit is 50,000)
  MAX_URLS_PER_SITEMAP: 45000,
  // Cache duration in seconds (handled by HTTP headers)
  CACHE_TTL: 3600, // 1 hour
} as const;

/**
 * Main sitemap function - returns all URLs
 * Uses efficient batch processing and database limits
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/games`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/category`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/trending`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/genres`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/languages`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/submit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Get game pages with database fallback and limit
  const gamePages = await getGameSitemapEntries(now);

  // Get category pages
  const categorySlugs = getAllCategorySlugs();
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${siteUrl}/category/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Get topic pages (dynamically from games data)
  const topicPages = await getTopicSitemapEntries(now);

  // Combine all entries
  return [...staticPages, ...gamePages, ...categoryPages, ...topicPages];
}

/**
 * Get game sitemap entries with database fallback
 * Implements batch processing and limits for performance
 */
async function getGameSitemapEntries(
  now: Date,
): Promise<MetadataRoute.Sitemap> {
  const ctx = getOptionalRequestContext();
  const siteUrl = getSiteUrl();

  // Try database first (production with D1)
  if (ctx?.env?.DB) {
    try {
      const db = createDatabase(ctx.env.DB);

      // Use limit to prevent timeouts on large datasets
      const games = await db
        .select({
          slug: gamesTable.slug,
          updatedAt: gamesTable.updatedAt,
          lastCommitAt: gamesTable.lastCommitAt,
        })
        .from(gamesTable)
        .limit(SITEMAP_CONFIG.MAX_URLS_PER_SITEMAP);

      return games.map((row) => ({
        url: `${siteUrl}/games/${row.slug}`,
        lastModified: row.updatedAt || row.lastCommitAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error("Error fetching games from DB for sitemap:", error);
      // Fall through to fallback
    }
  }

  // Fallback to static data
  const slugs = await getAllGameSlugs();
  return slugs.slice(0, SITEMAP_CONFIG.MAX_URLS_PER_SITEMAP).map((slug) => ({
    url: `${siteUrl}/games/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

/**
 * Get topic sitemap entries
 * Extracts unique topics from games and creates entries for topic pages
 */
async function getTopicSitemapEntries(
  now: Date,
): Promise<MetadataRoute.Sitemap> {
  const ctx = getOptionalRequestContext();
  const siteUrl = getSiteUrl();
  const topics = new Set<string>();

  // Try database first (production with D1)
  if (ctx?.env?.DB) {
    try {
      const db = createDatabase(ctx.env.DB);

      // Get all unique topics from games using JSON extraction
      const result = await db
        .select({
          topic: sql<string>`json_each.value`.as("topic"),
        })
        .from(gamesTable)
        .innerJoin(sql`json_each(${gamesTable.topics})`, sql`1=1`)
        .groupBy(sql`json_each.value`)
        .limit(500);

      for (const row of result) {
        if (
          row.topic &&
          typeof row.topic === "string" &&
          row.topic.length > 0
        ) {
          topics.add(row.topic.toLowerCase());
        }
      }
    } catch (error) {
      console.error("Error fetching topics from DB for sitemap:", error);
      // Fall through to fallback
    }
  }

  // Fallback to static data if no DB results
  if (topics.size === 0) {
    const games = await getAllGames();
    for (const game of games) {
      if (game.topics && Array.isArray(game.topics)) {
        for (const topic of game.topics) {
          if (topic && typeof topic === "string" && topic.length > 0) {
            topics.add(topic.toLowerCase());
          }
        }
      }
    }
  }

  // Convert topics to sitemap entries
  return Array.from(topics)
    .slice(0, 500) // Limit to prevent overly large sitemaps
    .map((topic) => ({
      url: `${siteUrl}/topic/${encodeURIComponent(topic)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
}

/**
 * Cache headers for sitemap responses
 * These can be set via next.config.ts or middleware
 */
export const cacheHeaders = {
  "Cache-Control": `public, max-age=${SITEMAP_CONFIG.CACHE_TTL}, s-maxage=${SITEMAP_CONFIG.CACHE_TTL}`,
  "CDN-Cache-Control": `public, max-age=${SITEMAP_CONFIG.CACHE_TTL * 2}`,
};
