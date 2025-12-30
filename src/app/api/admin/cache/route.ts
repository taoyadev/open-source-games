/**
 * Admin API: Cache Management
 *
 * POST /api/admin/cache/invalidate - Invalidate cache by pattern
 * GET /api/admin/cache/stats - Get cache statistics
 * DELETE /api/admin/cache - Clear all cache
 *
 * Requires ADMIN_API_KEY in authorization header
 */

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { cacheInvalidate, cacheClear, CacheKeys } from "@/lib/cache";

/**
 * Verify authentication
 * SECURITY: Always requires ADMIN_API_KEY, even in development mode
 */
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.ADMIN_API_KEY;

  // Always require API key - no bypass for development mode
  if (!apiKey) {
    console.error("ADMIN_API_KEY environment variable is not set");
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const providedKey = authHeader.slice(7); // Remove "Bearer " prefix
  if (providedKey.length !== apiKey.length) {
    return false;
  }

  // Constant-time string comparison
  let result = 0;
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ providedKey.charCodeAt(i);
  }
  return result === 0;
}

/**
 * GET - Cache information
 */
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "keys") {
    // Return common cache keys
    return NextResponse.json({
      success: true,
      data: {
        keys: {
          trendingGames: CacheKeys.trendingGames(10),
          popularGames: CacheKeys.popularGames(20),
          recentlyUpdated: CacheKeys.recentlyUpdated(10),
          statsAll: CacheKeys.allStats(),
          statsLanguages: CacheKeys.languageStats(),
          statsGenres: CacheKeys.genreStats(),
        },
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      message: "Cache management API",
      endpoints: {
        invalidate: "POST /api/admin/cache/invalidate?pattern=games:trending",
        clear: "DELETE /api/admin/cache",
        stats: "GET /api/admin/cache?action=keys",
      },
    },
  });
}

/**
 * POST - Invalidate cache by pattern
 */
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as { pattern?: string };
    const pattern = body.pattern as string | undefined;

    if (!pattern) {
      return NextResponse.json(
        { success: false, error: "Pattern is required" },
        { status: 400 },
      );
    }

    await cacheInvalidate(pattern);

    return NextResponse.json({
      success: true,
      data: {
        pattern,
        message: `Cache invalidated for pattern: ${pattern}`,
      },
    });
  } catch (error) {
    console.error("Cache invalidate error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalidation failed",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Clear all cache
 */
export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    await cacheClear();

    return NextResponse.json({
      success: true,
      data: {
        message: "All cache cleared",
      },
    });
  } catch (error) {
    console.error("Cache clear error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Clear failed",
      },
      { status: 500 },
    );
  }
}
