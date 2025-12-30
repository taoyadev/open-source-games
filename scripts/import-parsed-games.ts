#!/usr/bin/env npx tsx
/**
 * Import Parsed Games to Database
 *
 * Reads the parsed games JSON file (from parse-games-list.ts) and inserts them
 * into Cloudflare D1 via wrangler d1 execute.
 *
 * Usage:
 *   npx tsx scripts/import-parsed-games.ts
 *   npx tsx scripts/import-parsed-games.ts --input data/custom-games.json
 *   npx tsx scripts/import-parsed-games.ts --dry-run
 *   npx tsx scripts/import-parsed-games.ts --remote  # Target remote D1
 */

import { readFileSync, existsSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

// Batch size for database operations
const BATCH_SIZE = 50;

type Target = "local" | "remote";

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
function parseArgs(): {
  inputFile: string;
  dryRun: boolean;
  target: Target;
  dbName: string;
} {
  const args = process.argv.slice(2);
  const options = {
    inputFile: resolve(DATA_DIR, "all-games.json"),
    dryRun: false,
    target: "local" as Target,
    dbName: process.env.D1_DB_NAME || "open-source-games-db",
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

    if (arg === "--remote") {
      options.target = "remote";
      continue;
    }

    if (arg === "--local") {
      options.target = "local";
      continue;
    }

    if (arg === "--db" && args[i + 1]) {
      options.dbName = args[i + 1];
      i++;
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
 * Derive genre from category
 */
function deriveGenre(category: string | null): string | null {
  if (!category) return null;

  const categoryGenreMap: Record<string, string> = {
    action: "action",
    adventure: "adventure",
    platformer: "platformer",
    puzzle: "puzzle",
    racing: "racing",
    roguelike: "roguelike",
    "role-playing": "rpg",
    rpg: "rpg",
    sandbox: "sandbox",
    shooter: "shooter",
    "first-person": "shooter",
    sport: "sports",
    strategy: "strategy",
    "real-time": "strategy",
    "turn-based": "strategy",
    simulation: "simulation",
    "city-building": "simulation",
  };

  const lowerCat = category.toLowerCase();
  for (const [key, genre] of Object.entries(categoryGenreMap)) {
    if (lowerCat.includes(key)) {
      return genre;
    }
  }

  return null;
}

/**
 * Convert parsed game to SQL INSERT statement
 *
 * Uses INSERT OR IGNORE to skip games that would violate UNIQUE constraints
 * (either on id or slug). This allows import to continue even with duplicates.
 */
function gameToSQL(game: ParsedGameEntry): string {
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    return "'" + String(val).replace(/'/g, "''") + "'";
  };

  const now = Math.floor(Date.now() / 1000);
  const genre = deriveGenre(game.category);

  return `INSERT OR IGNORE INTO games (
    id, slug, title, repo_url, description, category, homepage,
    stars, language, genre, topics, platforms, screenshot_urls, affiliate_devices,
    forks, open_issues, is_archived, is_multiplayer, download_count,
    created_at, updated_at
  ) VALUES (
    ${escape(game.id)},
    ${escape(game.slug)},
    ${escape(game.title)},
    ${escape(game.repoUrl)},
    ${escape(game.description)},
    ${escape(game.category)},
    ${escape(game.homepage)},
    0, NULL, ${escape(genre)}, '[]', '[]', '[]', '[]',
    0, 0, 0, 0, 0,
    ${now}, ${now}
  );`;
}

/**
 * Main function
 */
async function main() {
  console.log("=== Open Source Games Importer ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();

  console.log("Target: " + options.target);
  console.log("Database: " + options.dbName);
  if (options.dryRun) console.log("Mode: DRY-RUN (no changes)");
  console.log("");

  // Read the games file
  console.log("Reading games from: " + options.inputFile);
  const data = readGamesFile(options.inputFile);
  console.log("Found " + data.totalGames + " games to import");
  console.log("");

  // Print category summary
  console.log("=== Categories ===");
  const sortedCats = Object.entries(data.categories).sort(
    (a, b) => b[1] - a[1],
  );
  for (const [cat, count] of sortedCats) {
    console.log("  " + cat + ": " + count);
  }
  console.log("");

  // Generate SQL statements
  const sqlStatements: string[] = [];
  for (const game of data.games) {
    sqlStatements.push(gameToSQL(game));
  }

  if (options.dryRun) {
    console.log("=== Dry Run Mode ===");
    console.log("Generated " + sqlStatements.length + " SQL statements");
    console.log("");
    console.log("Sample statement:");
    console.log(sqlStatements[0]);
    console.log("");
    console.log("=== Dry Run Complete ===");
    return;
  }

  // Execute SQL via wrangler
  const tempFile = resolve(ROOT_DIR, ".tmp-import.sql");
  const targetFlag = options.target === "remote" ? "--remote" : "--local";

  console.log("=== Importing to Database ===");

  try {
    for (let i = 0; i < sqlStatements.length; i += BATCH_SIZE) {
      const batch = sqlStatements.slice(i, i + BATCH_SIZE);
      writeFileSync(tempFile, batch.join("\n\n"));

      execSync(
        `npx wrangler d1 execute ${options.dbName} ${targetFlag} --file=${tempFile}`,
        { cwd: ROOT_DIR, stdio: "inherit" },
      );

      const pct = (((i + batch.length) / sqlStatements.length) * 100).toFixed(
        1,
      );
      console.log(
        "Progress: " +
          (i + batch.length) +
          "/" +
          sqlStatements.length +
          " (" +
          pct +
          "%)",
      );
    }

    console.log("");
    console.log("=== Import Complete ===");
    console.log("Imported " + data.totalGames + " games");
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
