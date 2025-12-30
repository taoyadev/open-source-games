/**
 * KV Cache Layer for Open Source Games Platform
 *
 * Edge runtime compatible caching using Cloudflare Workers KV
 * Provides fallback to in-memory cache when KV binding is unavailable
 *
 * Cache TTL Guidelines:
 * - Popular/Trending games: 7 days
 * - Category stats: 24 hours
 * - Search results: 1 hour
 * - Game details: 6 hours
 */

import { getOptionalRequestContext } from "./server/request-context";

// ============================================================================
// Types
// ============================================================================

export type CacheTTL =
  | "minute" // 60s - for rapidly changing data
  | "hour" // 3600s - for search results
  | "short" // 6 hours - for game details
  | "day" // 24 hours - for category stats
  | "week"; // 7 days - for popular games

export interface CacheOptions {
  ttl?: CacheTTL | number; // TTL in seconds
}

export interface CacheMetadata {
  cachedAt: string;
  ttl: number;
  version: string;
}

export interface CachedValue<T> {
  data: T;
  meta: CacheMetadata;
}

// ============================================================================
// TTL Constants
// ============================================================================

const TTL_VALUES: Record<CacheTTL, number> = {
  minute: 60,
  hour: 3600,
  short: 6 * 3600, // 6 hours
  day: 24 * 3600,
  week: 7 * 24 * 3600,
};

function getTTLSeconds(ttl: CacheTTL | number = "hour"): number {
  return typeof ttl === "number" ? ttl : TTL_VALUES[ttl];
}

// ============================================================================
// In-Memory Fallback Cache (for local development)
// ============================================================================

interface MemoryCacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>();
const MAX_MEMORY_CACHE_SIZE = 100;

function setMemoryCache<T>(key: string, value: T, ttlSeconds: number): void {
  // Evict oldest entries if cache is too large
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }

  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getMemoryCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as MemoryCacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data;
}

function deleteMemoryCache(key: string): void {
  memoryCache.delete(key);
}

function clearMemoryCache(): void {
  memoryCache.clear();
}

// ============================================================================
// KV Cache Helpers
// ============================================================================

/**
 * Get the KV namespace binding from the request context
 */
function getKV(): KVNamespace | null {
  try {
    const ctx = getOptionalRequestContext();
    return (ctx?.env?.CACHE as KVNamespace) || null;
  } catch {
    return null;
  }
}

/**
 * Get a value from cache (KV or memory fallback)
 *
 * @param key - Cache key
 * @param options - Cache options
 * @returns Cached value or null if not found/expired
 */
export async function cacheGet<T>(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: CacheOptions,
): Promise<T | null> {
  const kv = getKV();

  if (kv) {
    try {
      const cached = await kv.get(key, "json");
      if (cached) {
        const value = cached as CachedValue<T>;
        // Check if expired (manual check since KV doesn't auto-delete on expired read)
        const expiresAt =
          new Date(value.meta.cachedAt).getTime() + value.meta.ttl * 1000;
        if (Date.now() < expiresAt) {
          return value.data;
        }
        // Stale content - delete and return null
        await kv.delete(key);
      }
    } catch (error) {
      console.warn("KV cache get failed, falling back to memory:", error);
    }
  }

  // Fallback to memory cache
  return getMemoryCache<T>(key);
}

/**
 * Set a value in cache (KV or memory fallback)
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param options - Cache options
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options?: CacheOptions,
): Promise<void> {
  const ttl = getTTLSeconds(options?.ttl);
  const kv = getKV();

  // Create wrapped cache value with metadata
  const cacheValue: CachedValue<T> = {
    data: value,
    meta: {
      cachedAt: new Date().toISOString(),
      ttl,
      version: "1.0",
    },
  };

  if (kv) {
    try {
      await kv.put(key, JSON.stringify(cacheValue), {
        expirationTtl: ttl,
      });
    } catch (error) {
      console.warn("KV cache set failed, using memory fallback:", error);
      setMemoryCache(key, value, ttl);
      return;
    }
  }

  // Always set memory cache as fallback
  setMemoryCache(key, value, ttl);
}

/**
 * Get or set pattern - fetch from cache or compute and cache
 *
 * @param key - Cache key
 * @param factory - Function to compute value if cache miss
 * @param options - Cache options
 * @returns Cached or computed value
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T> | T,
  options?: CacheOptions,
): Promise<T> {
  const cached = await cacheGet<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  const value = await factory();
  await cacheSet(key, value, options);
  return value;
}

/**
 * Invalidate a specific cache key
 *
 * @param key - Cache key to invalidate
 */
export async function cacheDelete(key: string): Promise<void> {
  const kv = getKV();

  if (kv) {
    try {
      await kv.delete(key);
    } catch (error) {
      console.warn("KV cache delete failed:", error);
    }
  }

  deleteMemoryCache(key);
}

/**
 * Invalidate cache keys matching a pattern
 * Note: KV doesn't support list operation, so we need to track keys
 *
 * @param pattern - Pattern to match (prefix-based)
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  const kv = getKV();

  // For prefix-based invalidation, we can use a list approach
  // But KV requires us to track keys ourselves
  if (kv) {
    try {
      // Use the KV list API if available (requires preview flag)
      // For now, we'll delete matching keys from our tracked list
      const listed = await kv.list({ prefix: pattern });
      for (const key of listed.keys) {
        await kv.delete(key.name);
      }
    } catch (error) {
      console.warn("KV cache invalidate failed:", error);
      // Fallback to clearing all memory cache keys matching pattern
      const keys = Array.from(memoryCache.keys());
      for (const key of keys) {
        if (key.startsWith(pattern)) {
          memoryCache.delete(key);
        }
      }
    }
  } else {
    // Memory cache - delete all keys starting with pattern
    const keys = Array.from(memoryCache.keys());
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
}

/**
 * Clear all cache (use with caution)
 */
export async function cacheClear(): Promise<void> {
  const kv = getKV();

  if (kv) {
    try {
      const listed = await kv.list();
      for (const key of listed.keys) {
        await kv.delete(key.name);
      }
    } catch (error) {
      console.warn("KV cache clear failed:", error);
    }
  }

  clearMemoryCache();
}

// ============================================================================
// Cache Key Generators
// ============================================================================

export const CacheKeys = {
  // Popular/trending games
  trendingGames: (limit = 10) => `games:trending:${limit}` as const,
  popularGames: (limit = 20) => `games:popular:${limit}` as const,
  recentlyUpdated: (limit = 10) => `games:recent:${limit}` as const,

  // Game details
  gameBySlug: (slug: string) => `game:slug:${slug}` as const,
  gameById: (id: string) => `game:id:${id}` as const,

  // Category stats
  categoryStats: (type: string) => `stats:category:${type}` as const,
  languageStats: () => `stats:languages` as const,
  genreStats: () => `stats:genres` as const,
  allStats: () => `stats:all` as const,

  // Search
  searchResults: (query: string, filtersHash: string) =>
    `search:${query}:${filtersHash}` as const,
  searchSuggestions: (prefix: string) => `search:suggest:${prefix}` as const,

  // Category listings
  categoryGames: (slug: string, page: number, pageSize: number) =>
    `category:${slug}:games:${page}:${pageSize}` as const,
  categoryBySlug: (slug: string) => `category:slug:${slug}` as const,

  // Games listing
  gamesList: (filtersHash: string, page: number, sort: string) =>
    `games:list:${filtersHash}:${page}:${sort}` as const,
};

// ============================================================================
// Cache Helper Functions for Specific Use Cases
// ============================================================================

/**
 * Cache trending games (7 day TTL)
 */
export async function getCachedTrendingGames<T>(
  fetcher: () => Promise<T>,
  limit = 10,
): Promise<T> {
  return cacheGetOrSet(CacheKeys.trendingGames(limit), fetcher, {
    ttl: "week",
  });
}

/**
 * Cache game details (6 hour TTL)
 */
export async function getCachedGame<T>(
  slug: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  return cacheGetOrSet(CacheKeys.gameBySlug(slug), fetcher, { ttl: "short" });
}

/**
 * Cache category stats (24 hour TTL)
 */
export async function getCachedCategoryStats<T>(
  type: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  return cacheGetOrSet(CacheKeys.categoryStats(type), fetcher, { ttl: "day" });
}

/**
 * Cache search results (1 hour TTL)
 */
export async function getCachedSearchResults<T>(
  query: string,
  filtersHash: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  return cacheGetOrSet(CacheKeys.searchResults(query, filtersHash), fetcher, {
    ttl: "hour",
  });
}

/**
 * Cache all platform stats (24 hour TTL)
 */
export async function getCachedPlatformStats<T>(
  fetcher: () => Promise<T>,
): Promise<T> {
  return cacheGetOrSet(CacheKeys.allStats(), fetcher, { ttl: "day" });
}

/**
 * Invalidate game-related cache when a game is updated
 */
export async function invalidateGameCache(
  slug: string,
  id: string,
): Promise<void> {
  await Promise.all([
    cacheDelete(CacheKeys.gameBySlug(slug)),
    cacheDelete(CacheKeys.gameById(id)),
    // Invalidate popular games caches as they might include this game
    cacheInvalidate("games:trending"),
    cacheInvalidate("games:popular"),
    cacheInvalidate("games:recent"),
    // Invalidate stats
    cacheDelete(CacheKeys.allStats()),
    cacheDelete(CacheKeys.languageStats()),
    cacheDelete(CacheKeys.genreStats()),
  ]);
}

/**
 * Invalidate category-related cache
 */
export async function invalidateCategoryCache(type?: string): Promise<void> {
  if (type) {
    await cacheDelete(CacheKeys.categoryStats(type));
  }
  // Invalidate all category caches
  await cacheInvalidate("stats:category");
  await cacheInvalidate("category:");
}
