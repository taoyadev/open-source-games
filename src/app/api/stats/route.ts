/**
 * Platform Statistics API
 *
 * GET /api/stats
 *
 * Response:
 * - data.totalGames: Total number of games
 * - data.gamesByLanguage: Games count by programming language
 * - data.gamesByGenre: Games count by genre
 * - data.trendingGames: Games with recent activity and high stars
 * - data.recentlyUpdated: Most recently updated games
 * - data.topStars: Maximum star count among all games
 * - data.avgStars: Average star count
 */

export const runtime = "edge";

import { successResponse, errors, cacheControl } from "@/lib/api-utils";
import { getStats } from "@/lib/db-queries";
import { TOTAL_CATEGORIES } from "@/lib/categories";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

export async function GET() {
  try {
    const ctx = await getOptionalRequestContextAsync();
    const d1 = ctx?.env?.DB ?? null;

    if (!d1) {
      return successResponse({
        totalGames: 0,
        gamesByLanguage: [],
        gamesByGenre: [],
        trendingGames: [],
        recentlyUpdated: [],
        topStars: 0,
        avgStars: 0,
        totalCategories: TOTAL_CATEGORIES,
        generatedAt: new Date().toISOString(),
        note: "D1 binding not available - showing empty stats",
      });
    }

    const stats = await getStats(d1);

    // Add category count from static definitions
    const response = successResponse({
      ...stats,
      totalCategories: TOTAL_CATEGORIES,
      generatedAt: new Date().toISOString(),
    });

    // Cache stats for 5 minutes
    response.headers.set("Cache-Control", cacheControl.medium);

    return response;
  } catch (error) {
    console.error("Stats API error:", error);

    // Return mock stats if database is not configured
    if (error instanceof Error && error.message.includes("no such table")) {
      return successResponse({
        totalGames: 0,
        gamesByLanguage: [],
        gamesByGenre: [],
        trendingGames: [],
        recentlyUpdated: [],
        topStars: 0,
        avgStars: 0,
        totalCategories: TOTAL_CATEGORIES,
        generatedAt: new Date().toISOString(),
        note: "Database not configured - showing empty stats",
      });
    }

    return errors.internalError("Failed to fetch statistics");
  }
}
