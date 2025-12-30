/**
 * Categories API
 *
 * GET /api/categories
 *
 * Query Parameters:
 * - type: Filter by category type (genre, language, platform, topic, engine, alternative)
 * - source: Data source - "static" (in-memory) or "db" (database) - default: static
 *
 * Response:
 * - data.categories: Array of category objects grouped by type
 * - data.total: Total number of categories
 */

export const runtime = "edge";

import { createDatabase } from "@/db";
import { successResponse, errors, cacheControl } from "@/lib/api-utils";
import { getCategoriesFromDb, getCategoriesByType } from "@/lib/db-queries";
import {
  getAllCategories,
  getCategoriesByType as getStaticCategoriesByType,
  TOTAL_CATEGORIES,
} from "@/lib/categories";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("type");
    const source = searchParams.get("source") || "static";

    // Use static categories by default (faster, no DB query needed)
    if (source === "static") {
      const categories = filterType
        ? getStaticCategoriesByType()[getCategoryTypeLabel(filterType)] || []
        : getAllCategories();

      const response = successResponse({
        categories,
        total: filterType ? categories.length : TOTAL_CATEGORIES,
        source: "static",
      });

      // Cache categories for 1 hour (they rarely change)
      response.headers.set("Cache-Control", cacheControl.long);

      return response;
    }

    // Database source for dynamic categories
    const ctx = await getOptionalRequestContextAsync();
    if (!ctx?.env?.DB) {
      return errors.internalError("D1 database binding is not configured");
    }

    const db = createDatabase(ctx.env.DB);

    const categories = filterType
      ? await getCategoriesByType(db, filterType)
      : await getCategoriesFromDb(db);

    const response = successResponse({
      categories,
      total: categories.length,
      source: "database",
    });

    // Cache database categories for 5 minutes
    response.headers.set("Cache-Control", cacheControl.medium);

    return response;
  } catch (error) {
    console.error("Categories API error:", error);
    return errors.internalError("Failed to fetch categories");
  }
}

/**
 * Map filter type to display label
 */
function getCategoryTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    genre: "By Genre",
    language: "By Programming Language",
    engine: "By Game Engine",
    alternative: "Commercial Alternatives",
    platform: "By Platform",
    special: "Special Collections",
  };
  return typeLabels[type] || type;
}
