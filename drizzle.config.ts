import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for Cloudflare D1
 *
 * Usage:
 *   npx drizzle-kit generate  # Generate migrations from schema changes
 *   npx drizzle-kit push      # Push schema to local D1 database
 *   npx drizzle-kit studio    # Open Drizzle Studio for database management
 *
 * For production deployment:
 *   wrangler d1 migrations apply DB --remote
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
