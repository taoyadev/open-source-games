/**
 * Games Listing API
 *
 * GET /api/games
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - pageSize/limit: Results per page (default: 20, max: 100)
 * - sort: Sort field (stars, lastCommit, createdAt, title, downloadCount)
 * - order: Sort order (asc, desc) - default: desc
 * - language: Filter by programming language
 * - genre: Filter by game genre
 * - minStars: Minimum star count
 * - maxStars: Maximum star count
 * - multiplayer: Filter multiplayer games (true/false)
 * - topic: Filter by topic/tag
 * - platform: Filter by platform
 * - hasRelease: Filter games with releases (true)
 *
 * Response:
 * - data.games: Array of game objects
 * - meta: Pagination info (total, page, pageSize, hasMore)
 */

export const runtime = "edge";

import { createDatabase } from "@/db";
import {
  successResponse,
  errors,
  parsePagination,
  parseGameFilters,
  parseSortParams,
  createPaginationMeta,
  cacheControl,
} from "@/lib/api-utils";
import { getGames } from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";
import type { Game } from "@/db/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const pagination = parsePagination(searchParams);
    const filters = parseGameFilters(searchParams);
    const sort = parseSortParams(searchParams);

    const ctx = await getOptionalRequestContextAsync();
    const db = ctx?.env?.DB ? createDatabase(ctx.env.DB) : null;

    // Fetch games with filters and pagination (DB-first, fallback to in-memory mock)
    const { games, total } = db
      ? await getGames(db, filters, pagination, sort)
      : await getGamesFromMockData(filters, pagination, sort);

    // Create pagination metadata
    const meta = createPaginationMeta(
      pagination.page,
      pagination.pageSize,
      total,
    );

    // Build response
    const response = successResponse(
      {
        games,
        sort: { field: sort.field, order: sort.order },
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      },
      meta,
    );

    // Cache for 1 minute, stale-while-revalidate for 5 minutes
    response.headers.set("Cache-Control", cacheControl.short);

    return response;
  } catch (error) {
    console.error("Games API error:", error);
    return errors.internalError("Failed to fetch games");
  }
}

async function getGamesFromMockData(
  filters: Parameters<typeof getGames>[1],
  pagination: Parameters<typeof getGames>[2],
  sort: Parameters<typeof getGames>[3],
): Promise<{ games: Game[]; total: number }> {
  const games = await getMockGamesCached();

  const filtered = games.filter((game) => {
    if (
      filters.languages?.length &&
      !filters.languages.includes(game.language || "")
    ) {
      return false;
    }
    if (filters.genres?.length && !filters.genres.includes(game.genre || "")) {
      return false;
    }
    if (filters.minStars !== undefined && game.stars < filters.minStars) {
      return false;
    }
    if (filters.maxStars !== undefined && game.stars > filters.maxStars) {
      return false;
    }
    if (
      filters.isMultiplayer !== undefined &&
      game.isMultiplayer !== filters.isMultiplayer
    ) {
      return false;
    }
    if (filters.hasRelease && !game.latestRelease) {
      return false;
    }

    if (filters.topics?.length) {
      const topicSet = new Set((game.topics || []).map((t) => t.toLowerCase()));
      const matches = filters.topics.some((t) => topicSet.has(t.toLowerCase()));
      if (!matches) return false;
    }

    if (filters.platforms?.length) {
      const platformSet = new Set(
        (game.platforms || []).map((p) => p.toLowerCase()),
      );
      const matches = filters.platforms.every((p) =>
        platformSet.has(p.toLowerCase()),
      );
      if (!matches) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dir = sort.order === "asc" ? 1 : -1;

    switch (sort.field) {
      case "stars":
        return dir * (a.stars - b.stars);
      case "downloadCount":
        return dir * ((a.downloadCount || 0) - (b.downloadCount || 0));
      case "title":
        return dir * a.title.localeCompare(b.title);
      case "createdAt": {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return dir * (aTime - bTime);
      }
      case "lastCommit": {
        const aTime = a.lastCommitAt ? a.lastCommitAt.getTime() : 0;
        const bTime = b.lastCommitAt ? b.lastCommitAt.getTime() : 0;
        return dir * (aTime - bTime);
      }
      default:
        return 0;
    }
  });

  const total = sorted.length;
  const paged = sorted.slice(
    pagination.offset,
    pagination.offset + pagination.pageSize,
  );

  return { games: paged, total };
}

async function getMockGamesCached(): Promise<Game[]> {
  const global = globalThis as unknown as {
    __mockGames?: Game[];
    __mockGamesPromise?: Promise<Game[]>;
  };

  if (global.__mockGames) return global.__mockGames;

  if (!global.__mockGamesPromise) {
    global.__mockGamesPromise = getAllGames().then((data) => {
      global.__mockGames = data;
      return data;
    });
  }

  return global.__mockGamesPromise;
}
