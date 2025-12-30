import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Database connection types for Cloudflare D1
 */
export type Database = ReturnType<typeof createDatabase>;

/**
 * Creates a Drizzle ORM instance for Cloudflare D1
 *
 * @param d1 - The D1 database binding from Cloudflare Workers/Pages
 * @returns Drizzle ORM instance with schema
 *
 * @example
 * // In a Cloudflare Pages function or API route
 * import { getRequestContext } from "@cloudflare/next-on-pages";
 * import { createDatabase } from "@/db";
 *
 * export const runtime = "edge";
 *
 * export async function GET() {
 *   const { env } = getRequestContext();
 *   const db = createDatabase(env.DB);
 *   const games = await db.select().from(schema.games).limit(10);
 *   return Response.json(games);
 * }
 */
export function createDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Re-export schema for convenience
export * from "./schema";
