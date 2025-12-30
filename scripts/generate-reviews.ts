#!/usr/bin/env npx tsx
/**
 * AI Review Generation Script for Open Source Games Platform
 *
 * Generates AI reviews, meta titles, and meta descriptions for games
 * that don't have them yet.
 *
 * Usage:
 *   npx tsx scripts/generate-reviews.ts [options]
 *
 * Options:
 *   --dry-run       Generate mock data without API calls (default if no API key)
 *   --limit N       Process only N games (default: all)
 *   --force         Regenerate even if aiReview already exists
 *   --game SLUG     Process only a specific game by slug
 *   --output FILE   Output file path (default: data/games-with-reviews.json)
 *   --source FILE   Source file path (default: data/games.json)
 *   --delay MS      Delay between API calls in ms (default: 1000)
 *
 * Environment:
 *   OPENAI_API_KEY  Required for real API calls (optional in dry-run mode)
 *
 * Examples:
 *   npx tsx scripts/generate-reviews.ts --dry-run --limit 5
 *   OPENAI_API_KEY=sk-... npx tsx scripts/generate-reviews.ts --limit 10
 *   npx tsx scripts/generate-reviews.ts --game veloren --force
 */

import * as fs from "fs/promises";
import * as path from "path";

// Import AI functions
import { generateGameContent, generateMockGameContent } from "../src/lib/ai";
import type { AIReviewRequest, AIReviewResponse } from "../src/types/game";

// ============================================================================
// Configuration
// ============================================================================

interface Config {
  dryRun: boolean;
  limit: number;
  force: boolean;
  gameSlug: string | null;
  outputFile: string;
  sourceFile: string;
  delayMs: number;
  apiKey: string | null;
}

interface GameData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  category: string | null;
  aiReview?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  [key: string]: unknown;
}

interface GamesFile {
  scrapedAt?: string;
  totalGames?: number;
  games: GameData[];
  [key: string]: unknown;
}

interface ProcessingStats {
  total: number;
  processed: number;
  skipped: number;
  errors: number;
  tokensUsed: number;
  estimatedCost: number;
  startTime: Date;
  endTime?: Date;
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    dryRun: false,
    limit: Infinity,
    force: false,
    gameSlug: null,
    outputFile: path.join(process.cwd(), "data", "games-with-reviews.json"),
    sourceFile: path.join(process.cwd(), "data", "games.json"),
    delayMs: 1000,
    apiKey: process.env.OPENAI_API_KEY || null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--dry-run":
        config.dryRun = true;
        break;
      case "--force":
        config.force = true;
        break;
      case "--limit":
        config.limit = parseInt(args[++i], 10);
        break;
      case "--game":
        config.gameSlug = args[++i];
        break;
      case "--output":
        config.outputFile = path.resolve(args[++i]);
        break;
      case "--source":
        config.sourceFile = path.resolve(args[++i]);
        break;
      case "--delay":
        config.delayMs = parseInt(args[++i], 10);
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          printUsage();
          process.exit(1);
        }
    }
  }

  // Auto-enable dry-run if no API key
  if (!config.apiKey && !config.dryRun) {
    console.log(
      "No OPENAI_API_KEY found, enabling dry-run mode with mock data.\n",
    );
    config.dryRun = true;
  }

  return config;
}

function printUsage(): void {
  console.log(`
AI Review Generation Script for Open Source Games

Usage:
  npx tsx scripts/generate-reviews.ts [options]

Options:
  --dry-run       Generate mock data without API calls
  --limit N       Process only N games (default: all)
  --force         Regenerate even if aiReview already exists
  --game SLUG     Process only a specific game by slug
  --output FILE   Output file path (default: data/games-with-reviews.json)
  --source FILE   Source file path (default: data/games.json)
  --delay MS      Delay between API calls in ms (default: 1000)
  --help, -h      Show this help message

Environment:
  OPENAI_API_KEY  Required for real API calls

Examples:
  npx tsx scripts/generate-reviews.ts --dry-run --limit 5
  OPENAI_API_KEY=sk-... npx tsx scripts/generate-reviews.ts --limit 10
  npx tsx scripts/generate-reviews.ts --game veloren --force
`);
}

// ============================================================================
// File Operations
// ============================================================================

async function loadGames(sourceFile: string): Promise<GamesFile> {
  try {
    const content = await fs.readFile(sourceFile, "utf-8");
    const data = JSON.parse(content);

    // Handle both array format and object with games array
    if (Array.isArray(data)) {
      return { games: data };
    }
    if (data.games && Array.isArray(data.games)) {
      return data as GamesFile;
    }

    throw new Error("Invalid games file format");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`Source file not found: ${sourceFile}`);
      console.log("Creating sample games for demonstration...\n");
      return { games: getSampleGames() };
    }
    throw error;
  }
}

async function saveGames(
  outputFile: string,
  gamesFile: GamesFile,
): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(outputFile);
  await fs.mkdir(dir, { recursive: true });

  // Update metadata
  const output = {
    ...gamesFile,
    lastReviewGeneration: new Date().toISOString(),
    totalGames: gamesFile.games.length,
  };

  await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
}

// ============================================================================
// Sample Games (for when no source file exists)
// ============================================================================

function getSampleGames(): GameData[] {
  return [
    {
      id: "veloren-veloren",
      slug: "veloren",
      title: "Veloren",
      description:
        "An open-world, open-source multiplayer voxel RPG inspired by games such as Cube World, Legend of Zelda: Breath of the Wild, Dwarf Fortress and Minecraft.",
      language: "Rust",
      topics: ["game", "voxel", "rpg", "multiplayer", "rust", "open-world"],
      stars: 5200,
      category: "rpg",
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
    },
    {
      id: "minetest-minetest",
      slug: "minetest",
      title: "Minetest",
      description:
        "An open source voxel game engine. Play one of our many games, mod a game to your liking, make your own game, or play on a multiplayer server.",
      language: "C++",
      topics: [
        "game-engine",
        "voxel",
        "sandbox",
        "multiplayer",
        "moddable",
        "lua",
      ],
      stars: 10200,
      category: "sandbox",
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
    },
    {
      id: "endless-sky-endless-sky",
      slug: "endless-sky",
      title: "Endless Sky",
      description:
        "Space exploration, trading, and combat game. A 2D space trading and combat game similar to the classic Escape Velocity series.",
      language: "C++",
      topics: ["game", "space", "trading", "combat", "2d", "exploration"],
      stars: 5500,
      category: "simulation",
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
    },
    {
      id: "supertuxkart-stk-code",
      slug: "supertuxkart",
      title: "SuperTuxKart",
      description:
        "A free kart racing game developed by the community and focused on fun.",
      language: "C++",
      topics: ["game", "racing", "kart", "multiplayer", "3d"],
      stars: 4500,
      category: "racing",
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
    },
    {
      id: "wesnoth-wesnoth",
      slug: "battle-for-wesnoth",
      title: "Battle for Wesnoth",
      description:
        "A turn-based strategy game with a high fantasy theme, featuring both single-player and online/hotseat multiplayer combat.",
      language: "C++",
      topics: ["game", "strategy", "turn-based", "fantasy", "multiplayer"],
      stars: 5100,
      category: "strategy",
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
    },
  ];
}

// ============================================================================
// Review Generation
// ============================================================================

function gameToAIRequest(game: GameData): AIReviewRequest {
  return {
    title: game.title,
    description: game.description,
    language: game.language,
    topics: game.topics || [],
    stars: game.stars,
    category: game.category,
  };
}

async function generateReviewForGame(
  game: GameData,
  config: Config,
): Promise<{ content: AIReviewResponse; tokensUsed: number }> {
  const request = gameToAIRequest(game);

  if (config.dryRun) {
    // Use mock generation
    const content = generateMockGameContent(request);
    return { content, tokensUsed: 0 };
  }

  // Use real API
  const result = await generateGameContent(request, config.apiKey!);
  return {
    content: result.data,
    tokensUsed: result.tokenUsage?.total || 0,
  };
}

function shouldProcessGame(game: GameData, config: Config): boolean {
  // Filter by specific game slug if provided
  if (config.gameSlug && game.slug !== config.gameSlug) {
    return false;
  }

  // Skip if already has review (unless --force)
  if (!config.force && game.aiReview) {
    return false;
  }

  return true;
}

// ============================================================================
// Main Processing
// ============================================================================

async function processGames(
  gamesFile: GamesFile,
  config: Config,
): Promise<ProcessingStats> {
  const stats: ProcessingStats = {
    total: gamesFile.games.length,
    processed: 0,
    skipped: 0,
    errors: 0,
    tokensUsed: 0,
    estimatedCost: 0,
    startTime: new Date(),
  };

  const gamesToProcess = gamesFile.games.filter((game) =>
    shouldProcessGame(game, config),
  );

  console.log(`Found ${gamesToProcess.length} games to process`);
  console.log(
    `Skipping ${gamesFile.games.length - gamesToProcess.length} games (already have reviews)\n`,
  );

  // Apply limit
  const limitedGames = gamesToProcess.slice(0, config.limit);

  for (let i = 0; i < limitedGames.length; i++) {
    const game = limitedGames[i];
    const progress = `[${i + 1}/${limitedGames.length}]`;

    try {
      console.log(`${progress} Processing: ${game.title} (${game.slug})`);

      const { content, tokensUsed } = await generateReviewForGame(game, config);

      // Update game in place
      game.aiReview = content.aiReview;
      game.metaTitle = content.metaTitle;
      game.metaDescription = content.metaDescription;

      stats.processed++;
      stats.tokensUsed += tokensUsed;

      if (tokensUsed > 0) {
        console.log(`  -> Generated (${tokensUsed} tokens)`);
      } else {
        console.log(`  -> Generated (mock data)`);
      }

      // Rate limiting delay (only for real API calls)
      if (!config.dryRun && i < limitedGames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, config.delayMs));
      }
    } catch (error) {
      stats.errors++;
      console.error(`  -> Error: ${(error as Error).message}`);
    }
  }

  stats.skipped = gamesFile.games.length - stats.processed - stats.errors;
  stats.endTime = new Date();

  // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
  // Approximate with average of $0.15 per 1M tokens
  stats.estimatedCost = (stats.tokensUsed / 1000000) * 0.15;

  return stats;
}

function printStats(stats: ProcessingStats, config: Config): void {
  const duration = stats.endTime
    ? (stats.endTime.getTime() - stats.startTime.getTime()) / 1000
    : 0;

  console.log("\n" + "=".repeat(50));
  console.log("Generation Complete");
  console.log("=".repeat(50));
  console.log(
    `Mode:        ${config.dryRun ? "Dry Run (Mock Data)" : "Real API"}`,
  );
  console.log(`Total Games: ${stats.total}`);
  console.log(`Processed:   ${stats.processed}`);
  console.log(`Skipped:     ${stats.skipped}`);
  console.log(`Errors:      ${stats.errors}`);
  console.log(`Duration:    ${duration.toFixed(1)}s`);

  if (!config.dryRun && stats.tokensUsed > 0) {
    console.log(`\nAPI Usage:`);
    console.log(`  Tokens:    ${stats.tokensUsed.toLocaleString()}`);
    console.log(`  Est. Cost: $${stats.estimatedCost.toFixed(4)}`);
  }
}

// ============================================================================
// Entry Point
// ============================================================================

async function main(): Promise<void> {
  console.log("=".repeat(50));
  console.log("AI Review Generation for Open Source Games");
  console.log("=".repeat(50) + "\n");

  const config = parseArgs();

  console.log(`Source:  ${config.sourceFile}`);
  console.log(`Output:  ${config.outputFile}`);
  console.log(`Mode:    ${config.dryRun ? "Dry Run (Mock Data)" : "Real API"}`);
  if (config.limit !== Infinity) {
    console.log(`Limit:   ${config.limit} games`);
  }
  if (config.gameSlug) {
    console.log(`Filter:  ${config.gameSlug}`);
  }
  if (config.force) {
    console.log(`Force:   Regenerating all reviews`);
  }
  console.log("");

  // Load games
  const gamesFile = await loadGames(config.sourceFile);
  console.log(`Loaded ${gamesFile.games.length} games from source\n`);

  // Process games
  const stats = await processGames(gamesFile, config);

  // Save results
  if (stats.processed > 0) {
    await saveGames(config.outputFile, gamesFile);
    console.log(`\nSaved to: ${config.outputFile}`);
  }

  // Print summary
  printStats(stats, config);
}

// Run the script
main().catch((error) => {
  console.error("\nFatal error:", error.message);
  process.exit(1);
});
