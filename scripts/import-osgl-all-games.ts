#!/usr/bin/env npx tsx
/**
 * Import All OSGL Games to Database
 *
 * Reads the osgl-all-games.json file and imports games to the database.
 */

import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

const BATCH_SIZE = 50;

interface GameInfo {
  title: string;
  slug: string;
  githubUrl?: string;
  gitlabUrl?: string;
  genre?: string;
  tags: string[];
  status: string;
  languages: string[];
}

interface OsglGamesData {
  fetchedAt: string;
  source: string;
  totalGames: number;
  games: GameInfo[];
}

function escapeSql(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return String(val);
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function gameToSQL(game: GameInfo): string {
  const now = Math.floor(Date.now() / 1000);

  // Parse GitHub URL to get owner and repo
  let owner = "";
  let repo = "";
  const repoUrl = game.githubUrl || game.gitlabUrl || "";
  let id = "";

  if (game.githubUrl) {
    const match = game.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      owner = match[1];
      repo = match[2];
      id = `${owner}-${repo}`.toLowerCase();
    }
  } else if (game.gitlabUrl) {
    const match = game.gitlabUrl.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      owner = match[1];
      repo = match[2];
      id = `${owner}-${repo}`.toLowerCase();
    }
  }

  if (!id) return "";

  // Create a unique slug based on the OSGL slug
  const uniqueSlug = game.slug;

  // Derive genre from tags
  const genre = game.genre || game.tags[0] || null;

  // Convert languages array to JSON string
  const languagesJson =
    game.languages.length > 0 ? JSON.stringify(game.languages) : "[]";

  return `INSERT OR IGNORE INTO games (
    id, slug, title, repo_url, description, category, homepage,
    stars, language, genre, topics, platforms, screenshot_urls, affiliate_devices,
    forks, open_issues, is_archived, is_multiplayer, download_count,
    created_at, updated_at
  ) VALUES (
    ${escapeSql(id)},
    ${escapeSql(uniqueSlug)},
    ${escapeSql(game.title)},
    ${escapeSql(repoUrl)},
    ${escapeSql(`Open source ${genre || "game"} from OSGL. Status: ${game.status}`)},
    ${escapeSql(genre)},
    ${escapeSql(repoUrl)},
    0, ${escapeSql(game.languages[0] || null)}, ${escapeSql(genre)}, ${escapeSql(languagesJson)}, '[]', '[]', '[]',
    0, 0, 0, 0, 0,
    ${now}, ${now}
  );`;
}

async function main() {
  console.log("=== Importing All OSGL Games ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  // Read the OSGL games file
  const inputFile = resolve(DATA_DIR, "osgl-all-games.json");
  console.log("Reading from: " + inputFile);

  const content = readFileSync(inputFile, "utf-8");
  const data = JSON.parse(content) as OsglGamesData;

  console.log("Found " + data.totalGames + " games");
  console.log("");

  // Generate SQL statements
  const sqlStatements: string[] = [];
  for (const game of data.games) {
    const sql = gameToSQL(game);
    if (sql) {
      sqlStatements.push(sql);
    }
  }

  console.log("Generated " + sqlStatements.length + " SQL statements");
  console.log("");

  // Execute via wrangler
  const tempFile = resolve(ROOT_DIR, ".tmp-osgl-import.sql");
  const dbName = process.env.D1_DB_NAME || "open-source-games-db";

  try {
    for (let i = 0; i < sqlStatements.length; i += BATCH_SIZE) {
      const batch = sqlStatements.slice(i, i + BATCH_SIZE);
      writeFileSync(tempFile, batch.join("\n\n"));

      execSync(`npx wrangler d1 execute ${dbName} --local --file=${tempFile}`, {
        cwd: ROOT_DIR,
        stdio: "inherit",
      });

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
    console.log("Imported " + sqlStatements.length + " games");
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
