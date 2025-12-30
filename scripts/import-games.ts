#!/usr/bin/env npx tsx
/**
 * Import Parsed Games into Database
 *
 * Reads the parsed games JSON file and inserts them into the database using Drizzle ORM.
 * This script handles duplicates gracefully and provides detailed feedback.
 *
 * Usage:
 *   npx tsx scripts/import-games.ts
 *   npx tsx scripts/import-games.ts --input data/custom-games.json
 *   npx tsx scripts/import-games.ts --dry-run  # Preview without inserting
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import * as schema from "../src/db/schema";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

/**
 * Parsed game entry from JSON
 */
interface ParsedGameEntry {
  title: string;
  slug: string;
  id: string;
  repoUrl: string;
  owner: string;
  repo: string;
  description: string | null;
  category: string | null;
  homepage: string | null;
}

/**
 * Parsed games output format
 */
interface ParsedGamesOutput {
  parsedAt: string;
  sourceFile: string;
  totalGames: number;
  categories: Record<string, number>;
  games: ParsedGameEntry[];
  skipped: {
    reason: string;
    line: string;
    count: number;
  }[];
}

/**
 * Parse command line arguments
 */
function parseArgs(): { inputFile: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  const options = {
    inputFile: resolve(DATA_DIR, "all-games.json"),
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--input" && args[i + 1]) {
      options.inputFile = resolve(ROOT_DIR, args[i + 1]);
      i++;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
  }

  return options;
}

/**
 * Read and parse the games JSON file
 */
function readGamesFile(filePath: string): ParsedGamesOutput {
  if (!existsSync(filePath)) {
    console.error("Error: File not found: " + filePath);
    process.exit(1);
  }

  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as ParsedGamesOutput;
}

/**
 * Convert parsed game to database format
 */
function parsedGameToDbGame(
  parsed: ParsedGameEntry,
): typeof schema.games.$inferInsert {
  const now = new Date();

  return {
    id: parsed.id,
    slug: parsed.slug,
    title: parsed.title,
    repoUrl: parsed.repoUrl,
    description: parsed.description,
    category: parsed.category,
    homepage: parsed.homepage || null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    downloadCount: 0,
    isMultiplayer: false,
    isArchived: false,
    topics: [],
    platforms: [],
    screenshotUrls: [],
    affiliateDevices: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Main function
 */
async function main() {
  console.log("=== Open Source Games Importer ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();

  if (options.dryRun) {
    console.log("DRY RUN MODE - No database changes will be made");
    console.log("");
  }

  // Read the games file
  console.log("Reading games from: " + options.inputFile);
  const data = readGamesFile(options.inputFile);
  console.log("Found " + data.totalGames + " games to import");
  console.log("");

  if (options.dryRun) {
    // In dry run mode, just show what would be imported
    console.log("=== Games to Import ===");
    for (const game of data.games.slice(0, 10)) {
      console.log("  - " + game.title + " (" + game.id + ")");
      console.log("    Category: " + (game.category || "None"));
      console.log("    URL: " + game.repoUrl);
    }
    if (data.games.length > 10) {
      console.log("  ... and " + (data.games.length - 10) + " more");
    }
    console.log("");
    console.log("=== Dry Run Complete ===");
    console.log("Would import " + data.totalGames + " games");
    return;
  }

  // Initialize database connection
  const dbPath = resolve(ROOT_DIR, ".local-data/sqlite.db");
  console.log("Connecting to database: " + dbPath);

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  // Check existing games count
  const existingGames = await db.select().from(schema.games);
  console.log("Current games in database: " + existingGames.length);
  console.log("");

  // Track statistics
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { game: string; error: string }[] = [];

  // Import each game
  console.log("=== Importing Games ===");
  for (let i = 0; i < data.games.length; i++) {
    const parsedGame = data.games[i];
    const progress = Math.round(((i + 1) / data.games.length) * 100);

    try {
      // Check if game already exists
      const existing = await db
        .select()
        .from(schema.games)
        .where(eq(schema.games.id, parsedGame.id))
        .get();

      const dbGame = parsedGameToDbGame(parsedGame);

      if (existing) {
        // Update existing game
        await db
          .update(schema.games)
          .set({
            ...dbGame,
            updatedAt: new Date(),
          })
          .where(eq(schema.games.id, parsedGame.id));
        updated++;
      } else {
        // Insert new game
        await db.insert(schema.games).values(dbGame);
        inserted++;
      }

      // Progress indicator every 10 games
      if ((i + 1) % 10 === 0 || i === data.games.length - 1) {
        process.stdout.write(
          "\rProgress: [" +
            "=".repeat(Math.floor(progress / 5)) +
            " ".repeat(20 - Math.floor(progress / 5)) +
            "] " +
            progress +
            "% (" +
            (i + 1) +
            "/" +
            data.games.length +
            ")",
        );
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ game: parsedGame.title, error: errorMsg });
      skipped++;
    }
  }

  console.log(""); // New line after progress bar
  console.log("");

  // Print summary
  console.log("=== Import Summary ===");
  console.log("Inserted: " + inserted);
  console.log("Updated: " + updated);
  console.log("Skipped: " + skipped);

  if (errors.length > 0) {
    console.log("");
    console.log("=== Errors ===");
    for (const err of errors.slice(0, 10)) {
      console.log("  - " + err.game + ": " + err.error);
    }
    if (errors.length > 10) {
      console.log("  ... and " + (errors.length - 10) + " more errors");
    }
  }

  // Final count
  const finalGames = await db.select().from(schema.games);
  console.log("");
  console.log("Total games in database: " + finalGames.length);
  console.log("");
  console.log("=== Import Complete ===");

  sqlite.close();
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
