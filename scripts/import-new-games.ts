#!/usr/bin/env npx tsx
/**
 * Import New Games from fetch-more-games.ts output
 *
 * Converts the FetchedGame format from new-games.json to ScrapedGame format
 * and merges with existing games.json for database sync.
 *
 * Usage:
 *   npx tsx scripts/import-new-games.ts
 *   npx tsx scripts/import-new-games.ts --dry-run
 *   npx tsx scripts/import-new-games.ts --input data/new-games.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import type { ScrapedGame, ScraperOutput } from "../src/types/game";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

// Input/output files
const DEFAULT_INPUT = resolve(DATA_DIR, "new-games.json");
const GAMES_FILE = resolve(DATA_DIR, "games.json");

/**
 * FetchedGame format from fetch-more-games.ts
 */
interface FetchedGame {
  name: string;
  repoUrl: string;
  owner: string;
  repo: string;
  description: string | null;
  category: string | null;
  source: string;
  stars?: number;
  language?: string | null;
  topics?: string[];
  license?: string | null;
  homepage?: string | null;
  forks?: number;
}

/**
 * Input format from fetch-more-games.ts --json
 */
interface FetchedGamesOutput {
  fetchedAt: string;
  totalGames: number;
  stats: {
    source: string;
    totalParsed: number;
    newGames: number;
    duplicates: number;
    invalid: number;
  }[];
  games: FetchedGame[];
}

/**
 * Parse command line arguments
 */
function parseArgs(): { inputFile: string; dryRun: boolean } {
  const args = process.argv.slice(2);
  const options = {
    inputFile: DEFAULT_INPUT,
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
 * Generate a URL-friendly slug from game name
 */
function generateSlug(name: string, owner: string, repo: string): string {
  // Try name first
  let slug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Fallback to owner-repo if slug is empty or too short
  if (!slug || slug.length < 2) {
    slug = slugify(`${owner}-${repo}`, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  return slug;
}

/**
 * Convert FetchedGame to ScrapedGame format
 */
function toScrapedGame(fetched: FetchedGame): ScrapedGame {
  const now = new Date().toISOString();

  return {
    slug: generateSlug(fetched.name, fetched.owner, fetched.repo),
    title: fetched.name,
    repoUrl: fetched.repoUrl,
    owner: fetched.owner,
    repo: fetched.repo,
    description: fetched.description,
    stars: fetched.stars || 0,
    language: fetched.language || null,
    topics: fetched.topics || [],
    license: fetched.license || null,
    createdAt: now, // Will be updated by GitHub API later
    lastCommitAt: now,
    latestRelease: null,
    downloadCount: 0,
    isMultiplayer: false,
    isArchived: false,
    homepage: fetched.homepage || null,
    forks: fetched.forks || 0,
    openIssues: 0,
    category: fetched.category,
    etag: null,
  };
}

/**
 * Load existing games
 */
function loadExistingGames(): ScraperOutput | null {
  if (!existsSync(GAMES_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(GAMES_FILE, "utf-8");
    return JSON.parse(content) as ScraperOutput;
  } catch (error) {
    console.error("Error loading existing games:", error);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("=== Import New Games ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();

  if (options.dryRun) {
    console.log("DRY RUN MODE - No files will be modified");
    console.log("");
  }

  // Read new games
  console.log("Reading new games from: " + options.inputFile);

  if (!existsSync(options.inputFile)) {
    console.error("Error: Input file not found: " + options.inputFile);
    process.exit(1);
  }

  const content = readFileSync(options.inputFile, "utf-8");
  const fetchedData = JSON.parse(content) as FetchedGamesOutput;

  console.log("Found " + fetchedData.totalGames + " new games");
  console.log("Fetched at: " + fetchedData.fetchedAt);
  console.log("");

  // Print stats
  console.log("=== Source Stats ===");
  for (const stat of fetchedData.stats) {
    console.log("  " + stat.source + ": " + stat.newGames + " games");
  }
  console.log("");

  // Load existing games
  const existingData = loadExistingGames();
  const existingGames = existingData?.games || [];
  const existingRepos = new Set(
    existingGames.map((g) => (g.owner + "/" + g.repo).toLowerCase()),
  );

  console.log("Existing games: " + existingGames.length);

  // Convert and deduplicate
  const newGames: ScrapedGame[] = [];
  const duplicates: string[] = [];
  const slugs = new Set(existingGames.map((g) => g.slug));

  for (const fetched of fetchedData.games) {
    const repoKey = (fetched.owner + "/" + fetched.repo).toLowerCase();

    if (existingRepos.has(repoKey)) {
      duplicates.push(fetched.name);
      continue;
    }

    const scraped = toScrapedGame(fetched);

    // Ensure unique slug
    let slug = scraped.slug;
    let suffix = 1;
    while (slugs.has(slug)) {
      slug = scraped.slug + "-" + suffix;
      suffix++;
    }
    scraped.slug = slug;
    slugs.add(slug);

    newGames.push(scraped);
    existingRepos.add(repoKey);
  }

  console.log("New games to add: " + newGames.length);
  console.log("Duplicates skipped: " + duplicates.length);
  console.log("");

  if (newGames.length === 0) {
    console.log("No new games to add.");
    return;
  }

  // Show top 10 new games by stars
  console.log("=== Top 10 New Games ===");
  const sortedNew = [...newGames].sort((a, b) => b.stars - a.stars);
  for (const game of sortedNew.slice(0, 10)) {
    console.log(
      "  " +
        String(game.stars).padStart(5) +
        " stars - " +
        game.title +
        " (" +
        game.owner +
        "/" +
        game.repo +
        ")",
    );
  }
  console.log("");

  if (options.dryRun) {
    console.log("=== Dry Run Complete ===");
    console.log("Would add " + newGames.length + " games to games.json");
    return;
  }

  // Merge and save
  const mergedGames = [...existingGames, ...newGames];
  const output: ScraperOutput = {
    scrapedAt: new Date().toISOString(),
    totalGames: mergedGames.length,
    games: mergedGames,
    errors: existingData?.errors || [],
  };

  writeFileSync(GAMES_FILE, JSON.stringify(output, null, 2));

  console.log("=== Import Complete ===");
  console.log("Total games in games.json: " + mergedGames.length);
  console.log("Written to: " + GAMES_FILE);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Sync to local database: npm run sync:local");
  console.log("  2. Sync to remote database: npm run sync:remote");
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
