/**
 * Search API with FTS5 Full-Text Search
 *
 * GET /api/search?q=minecraft&language=Rust&minStars=100
 *
 * Query Parameters:
 * - q: Search query (required, min 2 chars)
 * - language: Filter by programming language
 * - genre: Filter by game genre
 * - minStars: Minimum star count
 * - maxStars: Maximum star count
 * - multiplayer: Filter by multiplayer support (true/false)
 * - page: Page number (default: 1)
 * - pageSize: Results per page (default: 20, max: 100)
 *
 * Response:
 * - data.results: Array of games with highlight snippets
 * - meta: Pagination info (total, page, pageSize, hasMore)
 */

export const runtime = "edge";

import {
  successResponse,
  errors,
  parsePagination,
  parseGameFilters,
  createPaginationMeta,
  validateSearchQuery,
  cacheControl,
} from "@/lib/api-utils";
import {
  searchGames,
  searchGamesFallback,
  getSearchSuggestions,
  getSearchSuggestionsFallback,
} from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const suggest = searchParams.get("suggest") === "true";

    // Handle autocomplete suggestions
    if (suggest) {
      if (!query || query.length < 2) {
        return successResponse([]);
      }

      const trimmed = query.trim();
      const ctx = await getOptionalRequestContextAsync();
      const d1 = ctx?.env?.DB ?? null;

      const suggestions = d1
        ? await getSuggestionsFromD1(d1, trimmed, 10)
        : await getSuggestionsFromMock(trimmed, 10);

      const response = successResponse(suggestions);
      response.headers.set("Cache-Control", cacheControl.short);
      return response;
    }

    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return errors.badRequest(validation.error || "Invalid query");
    }

    // Parse pagination and filters
    const pagination = parsePagination(searchParams);
    const filters = parseGameFilters(searchParams);

    const ctx = await getOptionalRequestContextAsync();
    const d1 = ctx?.env?.DB ?? null;

    const { results, total } = d1
      ? await getSearchResultsFromD1(
          d1,
          validation.sanitized,
          filters,
          pagination,
        )
      : await getSearchResultsFromMock(validation.sanitized, pagination);

    // Create response with pagination meta
    const meta = createPaginationMeta(
      pagination.page,
      pagination.pageSize,
      total,
    );

    const response = successResponse(
      {
        query: validation.sanitized,
        results,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      },
      meta,
    );

    // Cache search results for 1 minute
    response.headers.set("Cache-Control", cacheControl.short);

    return response;
  } catch (error) {
    console.error("Search API error:", error);

    return errors.internalError("Failed to perform search");
  }
}

async function getSuggestionsFromD1(
  d1: D1Database,
  prefix: string,
  limit: number,
) {
  try {
    return await getSearchSuggestions(d1, prefix, limit);
  } catch (error) {
    if (error instanceof Error && error.message.includes("games_fts")) {
      return await getSearchSuggestionsFallback(d1, prefix, limit);
    }
    throw error;
  }
}

async function getSearchResultsFromD1(
  d1: D1Database,
  query: string,
  filters: ReturnType<typeof parseGameFilters>,
  pagination: ReturnType<typeof parsePagination>,
) {
  try {
    return await searchGames(d1, query, filters, pagination);
  } catch (error) {
    if (error instanceof Error && error.message.includes("games_fts")) {
      return await searchGamesFallback(d1, query, filters, pagination);
    }
    throw error;
  }
}

async function getSuggestionsFromMock(prefix: string, limit: number) {
  const games = await getAllGames();
  const q = prefix.toLowerCase();
  return games
    .filter((g) => g.slug && g.title.toLowerCase().startsWith(q))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit)
    .map((g) => ({ title: g.title, slug: g.slug! }));
}

async function getSearchResultsFromMock(
  query: string,
  pagination: ReturnType<typeof parsePagination>,
) {
  const games = await getAllGames();
  const q = query.toLowerCase();

  const filtered = games.filter((g) => {
    const title = g.title.toLowerCase();
    const desc = (g.description || "").toLowerCase();
    const topics = (g.topics || []).join(" ").toLowerCase();
    return title.includes(q) || desc.includes(q) || topics.includes(q);
  });

  const total = filtered.length;
  const results = filtered
    .sort((a, b) => b.stars - a.stars)
    .slice(pagination.offset, pagination.offset + pagination.pageSize);

  return { results, total };
}
