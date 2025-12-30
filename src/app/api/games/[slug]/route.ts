/**
 * Single Game API
 *
 * GET /api/games/[slug]
 *
 * Path Parameters:
 * - slug: URL-friendly game identifier (e.g., "veloren", "minetest")
 *
 * Query Parameters:
 * - include: Comma-separated list of related data to include
 *   - related: Include related games (by language/genre)
 *
 * Response:
 * - data.game: Game object with all fields
 * - data.related: (optional) Array of related games
 */

export const runtime = "edge";

import { createDatabase } from "@/db";
import {
  successResponse,
  errors,
  isValidSlug,
  cacheControl,
} from "@/lib/api-utils";
import { getGameBySlugFromDb, getRelatedGamesFromDb } from "@/lib/db-queries";
import { getGameBySlug, getRelatedGames } from "@/lib/data";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Validate slug format
    if (!slug || !isValidSlug(slug)) {
      return errors.badRequest("Invalid game slug format");
    }

    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include")?.split(",") || [];
    const includeRelated = include.includes("related");

    const ctx = await getOptionalRequestContextAsync();
    const db = ctx?.env?.DB ? createDatabase(ctx.env.DB) : null;

    const game = db
      ? await getGameBySlugFromDb(db, slug)
      : await getGameBySlug(slug);

    if (!game) {
      return errors.notFound("Game");
    }

    // Build response data
    const responseData: {
      game: typeof game;
      related?: Awaited<ReturnType<typeof getRelatedGamesFromDb>>;
    } = { game };

    // Optionally include related games
    if (includeRelated) {
      responseData.related = db
        ? await getRelatedGamesFromDb(db, game, 6)
        : await getRelatedGames(game, 6);
    }

    const response = successResponse(responseData);

    // Cache single game for 5 minutes (less volatile than listings)
    response.headers.set("Cache-Control", cacheControl.medium);

    return response;
  } catch (error) {
    console.error("Game API error:", error);
    return errors.internalError("Failed to fetch game");
  }
}
