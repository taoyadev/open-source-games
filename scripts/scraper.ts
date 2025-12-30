#!/usr/bin/env npx tsx
/**
 * GitHub Data Scraper for Open Source Games
 *
 * Fetches game data from bobeff/open-source-games repository:
 * 1. Parses README.md to extract GitHub repository links
 * 2. Fetches GitHub API data for each game (stars, language, topics, etc.)
 * 3. Outputs enriched game data to data/games.json
 *
 * Usage:
 *   GITHUB_TOKEN=xxx npx tsx scripts/scraper.ts
 *
 * Options:
 *   --limit N     Only process first N games (for testing)
 *   --category X  Only process games in category X
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type {
  ParsedGame,
  ScrapedGame,
  ScraperOutput,
  ScraperError,
  GitHubRepoData,
} from "../src/types/game";

// Create extended Octokit with REST endpoints
const MyOctokit = Octokit.plugin(restEndpointMethods);
type OctokitInstance = InstanceType<typeof MyOctokit>;

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");
const OUTPUT_FILE = resolve(DATA_DIR, "games.json");

// Constants
const SOURCE_REPO_OWNER = "bobeff";
const SOURCE_REPO_NAME = "open-source-games";
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 200;

/**
 * Parse command line arguments
 */
function parseArgs(): { limit?: number; category?: string } {
  const args = process.argv.slice(2);
  const options: { limit?: number; category?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
    }
    if (args[i] === "--category" && args[i + 1]) {
      options.category = args[i + 1];
      i++;
    }
  }

  return options;
}

/**
 * Create Octokit instance
 */
function createOctokit(): OctokitInstance {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      "Warning: GITHUB_TOKEN not set. Rate limits will be restricted (60 req/hour).",
    );
    console.warn("Set GITHUB_TOKEN for 5000 req/hour limit.");
  }
  return new MyOctokit({ auth: token });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate slug from repository name
 */
function generateSlug(repoName: string, owner: string): string {
  // Create a unique slug from repo name, fallback to owner-repo if too short
  const baseSlug = slugify(repoName, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  // If slug is too short or generic, include owner
  if (baseSlug.length < 3 || ["game", "games", "app"].includes(baseSlug)) {
    return slugify(owner + "-" + repoName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }

  return baseSlug;
}

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\s#?]+)/i,
    /^([^\/]+)\/([^\/\s#?]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, "").replace(/\/$/, ""),
      };
    }
  }

  return null;
}

/**
 * Parse README.md to extract game entries
 * The README uses markdown format with sections and bullet points
 *
 * Format examples:
 * - **[Game Name](url)** - Description. [[source]](https://github.com/owner/repo)
 * - **Game Name** - Description. [[source]](https://github.com/owner/repo)
 * - [Game Name](https://github.com/owner/repo) - Description
 */
function parseReadmeContent(content: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const lines = content.split("\n");
  const seenRepos = new Set<string>();

  let currentCategory: string | null = null;

  for (const line of lines) {
    // Check for category headers (## Category Name)
    const categoryMatch = line.match(/^##\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      // Skip non-game sections
      if (
        currentCategory.toLowerCase().includes("contributing") ||
        currentCategory.toLowerCase().includes("license") ||
        currentCategory.toLowerCase().includes("table of contents") ||
        currentCategory.toLowerCase().includes("other lists")
      ) {
        currentCategory = null;
      }
      continue;
    }

    // Skip lines without bullet points
    if (!line.match(/^[\*\-]\s+/)) {
      continue;
    }

    // Skip if no GitHub source link
    if (
      !line.includes("github.com") &&
      !line.includes("gitlab.com") &&
      !line.includes("codeberg.org")
    ) {
      continue;
    }

    // Extract game name - either **[Name](url)** or **Name** pattern
    let name: string | null = null;

    // Pattern 1: **[Game Name](website_url)** format
    const boldLinkMatch = line.match(/\*\*\[([^\]]+)\]\([^)]+\)\*\*/);
    if (boldLinkMatch) {
      name = boldLinkMatch[1].trim();
    }

    // Pattern 2: **Game Name** format (without link)
    if (!name) {
      const boldMatch = line.match(/\*\*([^*\[]+)\*\*/);
      if (boldMatch) {
        name = boldMatch[1].trim();
      }
    }

    // Pattern 3: - [Game Name](github_url) format (direct link)
    if (!name) {
      const directLinkMatch = line.match(
        /^[\*\-]\s+\[([^\]]+)\]\(https?:\/\/github\.com/,
      );
      if (directLinkMatch) {
        name = directLinkMatch[1].trim();
      }
    }

    if (!name) {
      continue;
    }

    // Extract GitHub source URL - look for [[source]](github_url) pattern first
    let repoUrl: string | null = null;

    // Pattern 1: [[source]](https://github.com/owner/repo) - most common
    const sourceMatch = line.match(
      /\[\[source\]\]\((https?:\/\/(?:github\.com|gitlab\.com|codeberg\.org)\/[^)]+)\)/i,
    );
    if (sourceMatch) {
      repoUrl = sourceMatch[1];
    }

    // Pattern 2: Direct link [Name](https://github.com/owner/repo)
    if (!repoUrl) {
      const directMatch = line.match(
        /\[([^\]]+)\]\((https?:\/\/(?:github\.com|gitlab\.com|codeberg\.org)\/[^\s)]+)\)/,
      );
      if (directMatch) {
        repoUrl = directMatch[2];
      }
    }

    if (!repoUrl) {
      continue;
    }

    // Only process GitHub repos for now (skip gitlab and codeberg)
    if (!repoUrl.includes("github.com")) {
      continue;
    }

    // Extract description - text between the game name/link and [[source]]
    let description: string | undefined = undefined;
    const descMatch = line.match(/\*\*\s*[-–—]\s*(.+?)(?:\[\[source\]\]|$)/);
    if (descMatch) {
      description = descMatch[1]
        .replace(/\[\[.*?\]\]\([^)]*\)/g, "") // Remove other markdown links
        .replace(/\*\*/g, "") // Remove bold markers
        .trim();
      if (description.endsWith(".")) {
        description = description.slice(0, -1).trim();
      }
    }

    // Parse the URL and validate
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      continue;
    }

    // Deduplicate by owner/repo
    const repoKey = (parsed.owner + "/" + parsed.repo).toLowerCase();
    if (seenRepos.has(repoKey)) {
      continue;
    }
    seenRepos.add(repoKey);

    games.push({
      name,
      repoUrl: "https://github.com/" + parsed.owner + "/" + parsed.repo,
      description,
      category: currentCategory || undefined,
    });
  }

  return games;
}

/**
 * Check if topic indicates multiplayer
 */
function isMultiplayerGame(topics: string[]): boolean {
  const multiplayerKeywords = [
    "multiplayer",
    "multi-player",
    "online",
    "mmo",
    "mmorpg",
    "co-op",
    "coop",
    "pvp",
    "server",
    "netcode",
    "networking",
    "lan",
  ];

  return topics.some((topic) =>
    multiplayerKeywords.some(
      (kw) =>
        topic.toLowerCase().includes(kw) || kw.includes(topic.toLowerCase()),
    ),
  );
}

/**
 * Fetch GitHub API data for a repository
 */
async function fetchRepoData(
  octokit: OctokitInstance,
  owner: string,
  repo: string,
): Promise<{ data: GitHubRepoData | null; etag: string | null }> {
  try {
    const response = await octokit.rest.repos.get({ owner, repo });

    const data: GitHubRepoData = {
      id: response.data.id,
      name: response.data.name,
      full_name: response.data.full_name,
      html_url: response.data.html_url,
      description: response.data.description,
      stargazers_count: response.data.stargazers_count,
      language: response.data.language,
      topics: response.data.topics || [],
      created_at: response.data.created_at,
      updated_at: response.data.updated_at,
      pushed_at: response.data.pushed_at,
      license: response.data.license
        ? {
            key: response.data.license.key,
            name: response.data.license.name || "",
            spdx_id: response.data.license.spdx_id || "",
          }
        : null,
      default_branch: response.data.default_branch,
      open_issues_count: response.data.open_issues_count,
      forks_count: response.data.forks_count,
      archived: response.data.archived,
      disabled: response.data.disabled,
      homepage: response.data.homepage,
    };

    return { data, etag: response.headers.etag || null };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      console.warn("  Repository not found: " + owner + "/" + repo);
      return { data: null, etag: null };
    }
    throw error;
  }
}

/**
 * Fetch latest release for a repository
 */
async function fetchLatestRelease(
  octokit: OctokitInstance,
  owner: string,
  repo: string,
): Promise<{ version: string | null; downloadCount: number }> {
  try {
    const { data } = await octokit.rest.repos.getLatestRelease({ owner, repo });

    const downloadCount = data.assets.reduce(
      (sum, asset) => sum + asset.download_count,
      0,
    );

    return {
      version: data.tag_name,
      downloadCount,
    };
  } catch {
    // No releases is fine
    return { version: null, downloadCount: 0 };
  }
}

/**
 * Get rate limit status
 */
async function getRateLimitStatus(
  octokit: OctokitInstance,
): Promise<{ remaining: number; reset: Date }> {
  const { data } = await octokit.rest.rateLimit.get();
  return {
    remaining: data.resources.core.remaining,
    reset: new Date(data.resources.core.reset * 1000),
  };
}

/**
 * Wait for rate limit if needed
 */
async function waitForRateLimit(octokit: OctokitInstance): Promise<void> {
  const status = await getRateLimitStatus(octokit);

  if (status.remaining < 10) {
    const waitMs = status.reset.getTime() - Date.now() + 1000;
    if (waitMs > 0) {
      const waitSec = Math.ceil(waitMs / 1000);
      console.log(
        "Rate limit low (" +
          status.remaining +
          " remaining). Waiting " +
          waitSec +
          "s...",
      );
      await sleep(waitMs);
    }
  }
}

/**
 * Process a single game entry
 */
async function processGame(
  octokit: OctokitInstance,
  parsed: ParsedGame,
): Promise<ScrapedGame | null> {
  const urlInfo = parseGitHubUrl(parsed.repoUrl);
  if (!urlInfo) {
    return null;
  }

  const { owner, repo } = urlInfo;

  // Fetch repo data
  const { data: repoData, etag } = await fetchRepoData(octokit, owner, repo);
  if (!repoData) {
    return null;
  }

  // Fetch latest release (separate API call)
  const releaseInfo = await fetchLatestRelease(octokit, owner, repo);

  // Generate slug
  const slug = generateSlug(repoData.name, owner);

  // Build scraped game object
  const game: ScrapedGame = {
    slug,
    title: parsed.name || repoData.name,
    repoUrl: repoData.html_url,
    owner,
    repo,
    description: repoData.description || parsed.description || null,
    stars: repoData.stargazers_count,
    language: repoData.language,
    topics: repoData.topics,
    license: repoData.license?.spdx_id || repoData.license?.key || null,
    createdAt: repoData.created_at,
    lastCommitAt: repoData.pushed_at,
    latestRelease: releaseInfo.version,
    downloadCount: releaseInfo.downloadCount,
    isMultiplayer: isMultiplayerGame(repoData.topics),
    isArchived: repoData.archived,
    homepage: repoData.homepage,
    forks: repoData.forks_count,
    openIssues: repoData.open_issues_count,
    category: parsed.category || null,
    etag,
  };

  return game;
}

/**
 * Main scraper function
 */
async function main() {
  console.log("=== Open Source Games Scraper ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();
  const octokit = createOctokit();

  // Check rate limit
  const rateStatus = await getRateLimitStatus(octokit);
  console.log("GitHub API rate limit: " + rateStatus.remaining + " remaining");
  console.log("Rate limit resets at: " + rateStatus.reset.toISOString());
  console.log("");

  // Fetch README from bobeff/open-source-games
  console.log(
    "Fetching README from " +
      SOURCE_REPO_OWNER +
      "/" +
      SOURCE_REPO_NAME +
      "...",
  );
  const { data: readme } = await octokit.rest.repos.getReadme({
    owner: SOURCE_REPO_OWNER,
    repo: SOURCE_REPO_NAME,
    mediaType: { format: "raw" },
  });

  // Parse README to extract game entries
  const parsedGames = parseReadmeContent(readme as unknown as string);
  console.log("Found " + parsedGames.length + " games in README");

  // Filter by category if specified
  let gamesToProcess = parsedGames;
  if (options.category) {
    gamesToProcess = parsedGames.filter(
      (g) => g.category?.toLowerCase() === options.category?.toLowerCase(),
    );
    console.log(
      "Filtered to " +
        gamesToProcess.length +
        " games in category: " +
        options.category,
    );
  }

  // Limit if specified
  if (options.limit && options.limit > 0) {
    gamesToProcess = gamesToProcess.slice(0, options.limit);
    console.log("Limited to first " + options.limit + " games");
  }

  console.log("");

  // Process games in batches
  const scrapedGames: ScrapedGame[] = [];
  const errors: ScraperError[] = [];
  let processed = 0;

  for (let i = 0; i < gamesToProcess.length; i += BATCH_SIZE) {
    const batch = gamesToProcess.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const results = await Promise.all(
      batch.map(async (parsed) => {
        try {
          return await processGame(octokit, parsed);
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error("  Error processing " + parsed.repoUrl + ": " + msg);
          errors.push({
            repoUrl: parsed.repoUrl,
            error: msg,
            timestamp: new Date().toISOString(),
          });
          return null;
        }
      }),
    );

    // Collect successful results
    for (const game of results) {
      if (game) {
        scrapedGames.push(game);
      }
    }

    processed += batch.length;
    const pct = ((processed / gamesToProcess.length) * 100).toFixed(1);
    console.log(
      "Progress: " +
        processed +
        "/" +
        gamesToProcess.length +
        " (" +
        pct +
        "%) - " +
        scrapedGames.length +
        " successful",
    );

    // Rate limit check and delay between batches
    if (i + BATCH_SIZE < gamesToProcess.length) {
      await waitForRateLimit(octokit);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  console.log("");
  console.log("=== Scraping Complete ===");
  console.log("Total games scraped: " + scrapedGames.length);
  console.log("Errors: " + errors.length);

  // Sort games by stars (descending)
  scrapedGames.sort((a, b) => b.stars - a.stars);

  // Build output
  const output: ScraperOutput = {
    scrapedAt: new Date().toISOString(),
    totalGames: scrapedGames.length,
    games: scrapedGames,
    errors,
  };

  // Write to file
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log("Output written to: " + OUTPUT_FILE);

  // Print summary stats
  console.log("");
  console.log("=== Summary Statistics ===");
  console.log(
    "Total stars: " + scrapedGames.reduce((sum, g) => sum + g.stars, 0),
  );

  // Language distribution
  const langCounts = new Map<string, number>();
  for (const game of scrapedGames) {
    const lang = game.language || "Unknown";
    langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
  }
  console.log("Top languages:");
  const sortedLangs = Array.from(langCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [lang, count] of sortedLangs) {
    console.log("  " + lang + ": " + count);
  }

  // Category distribution
  const catCounts = new Map<string, number>();
  for (const game of scrapedGames) {
    const cat = game.category || "Uncategorized";
    catCounts.set(cat, (catCounts.get(cat) || 0) + 1);
  }
  console.log("Top categories:");
  const sortedCats = Array.from(catCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [cat, count] of sortedCats) {
    console.log("  " + cat + ": " + count);
  }

  // Top games by stars
  console.log("Top 10 games by stars:");
  for (const game of scrapedGames.slice(0, 10)) {
    console.log(
      "  " + game.stars + " - " + game.title + " (" + game.slug + ")",
    );
  }
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
