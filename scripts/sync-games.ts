#!/usr/bin/env npx tsx
/**
 * Database Sync Script for Open Source Games
 *
 * Reads games from `data/games.json` and upserts into Cloudflare D1.
 * Uses `wrangler d1 execute` so it works for both local and remote targets
 * without relying on wrangler's internal SQLite file paths.
 *
 * Usage:
 *   npx tsx scripts/sync-games.ts
 *
 * Options:
 *   --dry-run     Print a sample statement without executing
 *   --limit N     Only process first N games
 *   --local       Target local D1 (default)
 *   --remote      Target remote D1 (requires auth)
 *   --db NAME     Override D1 database name (default: open-source-games-db)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { ScrapedGame, ScraperOutput, SyncStats } from "../src/types/game";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");
const GAMES_FILE = resolve(DATA_DIR, "games.json");

// Batch size for database operations
const BATCH_SIZE = 50;

type Target = "local" | "remote";

/**
 * Parse command line arguments
 */
function parseArgs(): {
  dryRun: boolean;
  limit?: number;
  target: Target;
  dbName: string;
} {
  const args = process.argv.slice(2);
  const options: {
    dryRun: boolean;
    limit?: number;
    target: Target;
    dbName: string;
  } = {
    dryRun: false,
    limit: undefined,
    target: "local",
    dbName: process.env.D1_DB_NAME || "open-source-games-db",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--limit" && args[i + 1]) {
      options.limit = Number.parseInt(args[i + 1], 10);
      i++;
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
 * Load games from JSON file
 */
function loadGames(): ScraperOutput {
  if (!existsSync(GAMES_FILE)) {
    throw new Error(
      "Games file not found: " + GAMES_FILE + ". Run `npm run scrape` first.",
    );
  }

  const content = readFileSync(GAMES_FILE, "utf-8");
  return JSON.parse(content) as ScraperOutput;
}

/**
 * Derive genre from category and topics
 */
function deriveGenre(category: string | null, topics: string[]): string | null {
  const categoryGenreMap: Record<string, string> = {
    action: "action",
    adventure: "adventure",
    arcade: "arcade",
    board: "board",
    card: "card",
    educational: "educational",
    fps: "shooter",
    "first-person shooters": "shooter",
    platformer: "platformer",
    puzzle: "puzzle",
    racing: "racing",
    rhythm: "music",
    roguelike: "roguelike",
    roguelite: "roguelike",
    "role-playing": "rpg",
    rpg: "rpg",
    rts: "strategy",
    "real-time strategy": "strategy",
    sandbox: "sandbox",
    simulation: "simulation",
    sports: "sports",
    strategy: "strategy",
    survival: "survival",
    "tower defense": "strategy",
    "turn-based strategy": "strategy",
  };

  if (category) {
    const lowerCat = category.toLowerCase();
    for (const [key, genre] of Object.entries(categoryGenreMap)) {
      if (lowerCat.includes(key)) {
        return genre;
      }
    }
  }

  for (const topic of topics) {
    const lowerTopic = topic.toLowerCase();
    for (const [key, genre] of Object.entries(categoryGenreMap)) {
      if (lowerTopic === key || lowerTopic.includes(key)) {
        return genre;
      }
    }
  }

  return null;
}

/**
 * Convert ScrapedGame to database record format
 *
 * Note: timestamps are stored as Unix seconds to match Drizzle `mode: "timestamp"`.
 */
function toDbRecord(game: ScrapedGame) {
  const id = `${game.owner.toLowerCase()}-${game.repo.toLowerCase()}`;

  const toUnixSeconds = (iso: string | null): number | null => {
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
  };

  return {
    id,
    slug: game.slug,
    title: game.title,
    repo_url: game.repoUrl,
    description: game.description,
    stars: game.stars,
    language: game.language,
    genre: deriveGenre(game.category, game.topics),
    topics: JSON.stringify(game.topics),
    license: game.license,
    created_at: toUnixSeconds(game.createdAt),
    last_commit_at: toUnixSeconds(game.lastCommitAt),
    updated_at: Math.floor(Date.now() / 1000),
    latest_release: game.latestRelease,
    download_count: game.downloadCount,
    is_multiplayer: game.isMultiplayer ? 1 : 0,
    homepage: game.homepage,
    forks: game.forks,
    open_issues: game.openIssues,
    is_archived: game.isArchived ? 1 : 0,
    etag: game.etag,
    category: game.category,
  };
}

/**
 * Sync games to D1 database via Wrangler.
 *
 * Generates SQL and executes via `wrangler d1 execute`.
 */
async function syncToD1(
  games: ScrapedGame[],
  options: { dryRun: boolean; limit?: number; target: Target; dbName: string },
): Promise<SyncStats> {
  const { execSync } = await import("child_process");
  const { writeFileSync, unlinkSync } = await import("fs");

  const stats: SyncStats = {
    total: games.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    startTime: new Date(),
    endTime: new Date(),
  };

  const gamesToProcess = options.limit ? games.slice(0, options.limit) : games;
  console.log("Processing " + gamesToProcess.length + " games...");

  const sqlStatements: string[] = [];

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    return "'" + String(val).replace(/'/g, "''") + "'";
  };

  for (const game of gamesToProcess) {
    const record = toDbRecord(game);

    // Use INSERT OR REPLACE to handle both id and slug conflicts
    // This will update existing records with matching id or slug
    const sql = `INSERT OR REPLACE INTO games (
      id, slug, title, repo_url, description, stars, language, genre, topics,
      license, created_at, last_commit_at, updated_at, latest_release,
      download_count, is_multiplayer,
      homepage, forks, open_issues, is_archived, etag, category
    ) VALUES (
      ${escape(record.id)}, ${escape(record.slug)}, ${escape(record.title)},
      ${escape(record.repo_url)}, ${escape(record.description)}, ${record.stars},
      ${escape(record.language)}, ${escape(record.genre)}, ${escape(record.topics)},
      ${escape(record.license)}, ${record.created_at ?? "NULL"},
      ${record.last_commit_at ?? "NULL"}, ${record.updated_at},
      ${escape(record.latest_release)}, ${record.download_count},
      ${record.is_multiplayer},
      ${escape(record.homepage)}, ${record.forks}, ${record.open_issues},
      ${record.is_archived}, ${escape(record.etag)}, ${escape(record.category)}
    );`;

    sqlStatements.push(sql);
  }

  if (options.dryRun) {
    console.log("[DRY-RUN] Generated " + sqlStatements.length + " statements");
    console.log("Sample statement:\n" + sqlStatements[0]);
    return stats;
  }

  const tempFile = resolve(ROOT_DIR, ".tmp-sync.sql");
  const targetFlag = options.target === "remote" ? "--remote" : "--local";

  try {
    for (let i = 0; i < sqlStatements.length; i += BATCH_SIZE) {
      const batch = sqlStatements.slice(i, i + BATCH_SIZE);
      writeFileSync(tempFile, batch.join("\n"));

      execSync(
        `npx wrangler d1 execute ${options.dbName} ${targetFlag} --file=${tempFile}`,
        { cwd: ROOT_DIR, stdio: "inherit" },
      );

      stats.inserted += batch.length; // Approximate; includes updates.
      const pct = (((i + batch.length) / sqlStatements.length) * 100).toFixed(
        1,
      );
      console.log(
        "Sync progress: " +
          (i + batch.length) +
          "/" +
          sqlStatements.length +
          " (" +
          pct +
          "%)",
      );
    }
  } finally {
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }

  stats.endTime = new Date();
  return stats;
}

async function main() {
  console.log("=== Open Source Games Database Sync ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();

  console.log("Target: " + options.target);
  console.log("Database: " + options.dbName);
  if (options.dryRun) console.log("Mode: DRY-RUN (no changes)");

  console.log("");
  console.log("Loading games from: " + GAMES_FILE);
  const data = loadGames();
  console.log(
    "Loaded " +
      data.games.length +
      " games (scraped at " +
      data.scrapedAt +
      ")",
  );
  console.log("");

  const stats = await syncToD1(data.games, options);

  console.log("");
  console.log("=== Sync Complete ===");
  console.log("Total games: " + stats.total);
  console.log("Inserted/updated (approx): " + stats.inserted);
  console.log("Errors: " + stats.errors);

  const duration = stats.endTime.getTime() - stats.startTime.getTime();
  console.log("Duration: " + (duration / 1000).toFixed(1) + "s");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
