#!/usr/bin/env npx tsx
/**
 * Fetch Open Source Games from Multiple Sources
 *
 * This script fetches open-source games from multiple GitHub repositories and sources:
 * 1. michelpereira/awesome-open-source-games - A curated list with hundreds of games
 * 2. GitHub topic search - Repositories tagged with open-source-game
 * 3. bobeff/open-source-games - Another curated list (already used by scraper.ts)
 * 4. leereilly/games - Games on GitHub
 * 5. Additional web directories (optional) - Wikipedia, LibreGameWiki, OSGameClones, etc.
 *
 * The script:
 * - Parses README files from various repositories
 * - Extracts game names and GitHub repository URLs
 * - Compares against existing games to avoid duplicates
 * - Queries GitHub API for metadata (stars, language, topics)
 * - Generates a markdown file of new games to import
 *
 * Usage:
 *   GITHUB_TOKEN=xxx npx tsx scripts/fetch-more-games.ts
 *
 * Options:
 *   --limit N       Only process first N games (for testing)
 *   --sources X,Y   Comma-separated list of sources to fetch (default: enabled sources)
 *   --no-api        Skip GitHub API metadata fetching
 *   --output PATH   Output file path (default: data/fetched-games.md)
 *   --json          Output JSON instead of markdown
 *   --existing PATH Path to existing games.json for deduplication
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";

// Create extended Octokit with REST endpoints
const MyOctokit = Octokit.plugin(restEndpointMethods);
type OctokitInstance = InstanceType<typeof MyOctokit>;

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");
const DEFAULT_OUTPUT_FILE = resolve(DATA_DIR, "fetched-games.md");
const DEFAULT_GAMES_FILE = resolve(DATA_DIR, "games.json");

// Type definitions
interface GameSource {
  name: string;
  owner?: string;
  repo?: string;
  path?: string;
  url?: string;
  topic?: string;
  maxPages?: number;
  maxItems?: number;
  enabledByDefault?: boolean;
  type: "readme" | "github-topic" | "html" | "itch-tag";
}

interface ParsedGame {
  name: string;
  repoUrl: string;
  owner: string;
  repo: string;
  description?: string;
  category?: string;
  source: string;
}

interface GitHubRepoData {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  homepage: string | null;
  forks_count: number;
  open_issues_count: number;
  archived: boolean;
}

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

interface FetchStats {
  source: string;
  totalParsed: number;
  newGames: number;
  duplicates: number;
  invalid: number;
}

// Game sources configuration
const GAME_SOURCES: GameSource[] = [
  {
    name: "awesome-open-source-games",
    owner: "michelpereira",
    repo: "awesome-open-source-games",
    path: "README.md",
    type: "readme",
    enabledByDefault: true,
  },
  {
    name: "bobeff-open-source-games",
    owner: "bobeff",
    repo: "open-source-games",
    path: "README.md",
    type: "readme",
    enabledByDefault: true,
  },
  {
    name: "leereilly-games",
    owner: "leereilly",
    repo: "games",
    path: "README.md",
    type: "readme",
    enabledByDefault: true,
  },
  {
    name: "github-topic-open-source-game",
    topic: "open-source-game",
    type: "github-topic",
    enabledByDefault: true,
  },

  // Extended/optional sources (disabled by default to keep fetch fast)
  {
    name: "wikipedia-open-source-video-games",
    url: "https://en.wikipedia.org/wiki/List_of_open-source_video_games",
    type: "html",
    enabledByDefault: false,
  },
  {
    name: "libregamewiki-list-of-games",
    url: "https://libregamewiki.org/List_of_games",
    type: "html",
    enabledByDefault: false,
  },
  {
    name: "osgameclones",
    url: "https://osgameclones.com/",
    type: "html",
    enabledByDefault: false,
  },
  {
    name: "awesome-game-remakes",
    owner: "radek-sprta",
    repo: "awesome-game-remakes",
    path: "README.md",
    type: "readme",
    enabledByDefault: false,
  },
  {
    name: "gamesdev-directory",
    url: "https://gamesdev.github.io/",
    type: "html",
    enabledByDefault: false,
  },
  {
    name: "libregames-directory",
    url: "https://libregames.gitlab.io/",
    type: "html",
    enabledByDefault: false,
  },
  {
    name: "itchio-open-source-tag",
    url: "https://itch.io/games/tag-open-source",
    type: "itch-tag",
    maxPages: 1,
    maxItems: 20,
    enabledByDefault: false,
  },
  {
    name: "p2pfoundation-open-source-games",
    url: "https://wiki.p2pfoundation.net/Open_Source_Games",
    type: "html",
    enabledByDefault: false,
  },
];

// Keywords to skip (non-game entries)
const SKIP_KEYWORDS = [
  "engine",
  "framework",
  "library",
  "sdk",
  "toolkit",
  "template",
  "boilerplate",
  "tutorial",
  "course",
  "example",
  "demo",
  "sample",
  "asset",
  "pack",
  "bundle",
  "collection",
  "list",
  "awesome",
  "curated",
  "directory",
  "database",
  "api",
  "wrapper",
  "binding",
  "plugin",
  "extension",
  "mod",
  "addon",
];

/**
 * Parse command line arguments
 */
function parseArgs(): {
  limit?: number;
  sources?: string[];
  noApi: boolean;
  outputFile: string;
  jsonOutput: boolean;
  existingGamesFile: string;
} {
  const args = process.argv.slice(2);
  const options: {
    limit?: number;
    sources?: string[];
    noApi: boolean;
    outputFile: string;
    jsonOutput: boolean;
    existingGamesFile: string;
  } = {
    noApi: false,
    outputFile: DEFAULT_OUTPUT_FILE,
    jsonOutput: false,
    existingGamesFile: DEFAULT_GAMES_FILE,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--limit" && args[i + 1]) {
      options.limit = parseInt(args[i + 1], 10);
      i++;
      continue;
    }

    if (arg === "--sources" && args[i + 1]) {
      options.sources = args[i + 1].split(",").map((s) => s.trim());
      i++;
      continue;
    }

    if (arg === "--no-api") {
      options.noApi = true;
      continue;
    }

    if (arg === "--output" && args[i + 1]) {
      options.outputFile = resolve(ROOT_DIR, args[i + 1]);
      i++;
      continue;
    }

    if (arg === "--json") {
      options.jsonOutput = true;
      continue;
    }

    if (arg === "--existing" && args[i + 1]) {
      options.existingGamesFile = resolve(ROOT_DIR, args[i + 1]);
      i++;
      continue;
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
 * Load existing games for deduplication
 */
function loadExistingGames(filePath: string): Set<string> {
  const existing = new Set<string>();

  if (!existsSync(filePath)) {
    console.log("No existing games file found at: " + filePath);
    return existing;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);

    // Handle both ScraperOutput and simple array formats
    const games = data.games || data;

    for (const game of games) {
      const key = (game.owner + "/" + game.repo).toLowerCase();
      existing.add(key);
    }

    console.log(
      "Loaded " + existing.size + " existing games for deduplication",
    );
  } catch (error) {
    console.error("Error loading existing games:", error);
  }

  return existing;
}

/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
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

const NON_REPO_OWNERS = new Set([
  "about",
  "apps",
  "collections",
  "contact",
  "customer-stories",
  "explore",
  "features",
  "issues",
  "login",
  "marketplace",
  "notifications",
  "orgs",
  "pricing",
  "pulls",
  "search",
  "security",
  "settings",
  "sponsors",
  "topics",
  "trending",
]);

function isProbablyRepoPath(owner: string, repo: string): boolean {
  const ownerLower = owner.toLowerCase();
  if (NON_REPO_OWNERS.has(ownerLower)) return false;
  if (!repo) return false;
  return true;
}

function extractGitHubReposFromText(
  text: string,
  sourceName: string,
  nameHint?: (owner: string, repo: string) => string,
): ParsedGame[] {
  const games: ParsedGame[] = [];
  const seenRepos = new Set<string>();

  const regex = /https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    const owner = match[1];
    const repo = match[2].replace(/\.git$/i, "");
    if (!isProbablyRepoPath(owner, repo)) continue;

    const repoKey = (owner + "/" + repo).toLowerCase();
    if (seenRepos.has(repoKey)) continue;
    seenRepos.add(repoKey);

    const name = nameHint ? nameHint(owner, repo) : repo;
    if (shouldSkipGame(name)) continue;

    games.push({
      name,
      repoUrl: "https://github.com/" + owner + "/" + repo,
      owner,
      repo,
      source: sourceName,
    });
  }

  return games;
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "open-source-games-fetcher",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) {
      console.warn(`  Error fetching ${url}: ${res.status} ${res.statusText}`);
      return null;
    }
    return await res.text();
  } catch (error) {
    console.warn(`  Error fetching ${url}:`, error);
    return null;
  }
}

async function fetchHtmlSource(
  url: string,
  sourceName: string,
): Promise<ParsedGame[]> {
  const html = await fetchText(url);
  if (!html) return [];
  return extractGitHubReposFromText(html, sourceName);
}

function extractItchGameUrls(html: string): string[] {
  const urls = new Set<string>();
  const regex = /https?:\/\/[a-z0-9-]+\.itch\.io\/[a-z0-9-]+/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    urls.add(match[0]);
  }
  return Array.from(urls);
}

async function fetchItchTagSource(
  url: string,
  sourceName: string,
  maxPages: number,
  maxItems: number,
): Promise<ParsedGame[]> {
  const allGames: ParsedGame[] = [];
  const seenRepos = new Set<string>();

  const pageUrls: string[] = [];
  for (let page = 1; page <= Math.max(1, maxPages); page++) {
    pageUrls.push(page === 1 ? url : `${url}?page=${page}`);
  }

  const itchGameUrls: string[] = [];
  for (const pageUrl of pageUrls) {
    const html = await fetchText(pageUrl);
    if (!html) continue;
    itchGameUrls.push(...extractItchGameUrls(html));
  }

  const uniqueItchGameUrls = Array.from(new Set(itchGameUrls)).slice(
    0,
    Math.max(1, maxItems),
  );

  for (const gameUrl of uniqueItchGameUrls) {
    const html = await fetchText(gameUrl);
    if (!html) continue;

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const pageTitle = titleMatch
      ? titleMatch[1].replace(/\s*-\s*itch\.io\s*$/i, "").trim()
      : undefined;

    const extracted = extractGitHubReposFromText(
      html,
      sourceName,
      (_owner, repo) => pageTitle || repo,
    );

    for (const game of extracted) {
      const key = (game.owner + "/" + game.repo).toLowerCase();
      if (seenRepos.has(key)) continue;
      seenRepos.add(key);
      allGames.push(game);
    }
  }

  return allGames;
}

/**
 * Check if a game name should be skipped (non-game entries)
 */
function shouldSkipGame(name: string, description?: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerDesc = description?.toLowerCase() || "";

  for (const keyword of SKIP_KEYWORDS) {
    if (
      lowerName.includes(keyword) ||
      lowerName === keyword ||
      lowerDesc.includes(keyword + " for")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Parse README content to extract game entries
 * Supports multiple markdown formats:
 * - **[Game Name](url)** - Description. [[source]](https://github.com/owner/repo)
 * - **Game Name** - Description. [[source]](https://github.com/owner/repo)
 * - [Game Name](https://github.com/owner/repo) - Description
 * - | Game Name | Description | [Link](url) | (table format)
 */
function parseReadmeContent(content: string, sourceName: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const lines = content.split("\n");
  const seenRepos = new Set<string>();

  let currentCategory: string | null = null;

  // Skip sections
  const skipSections = [
    "contributing",
    "license",
    "table of contents",
    "other lists",
    "see also",
    "references",
    "footnotes",
    "footer",
    "acknowledgments",
    "changelog",
  ];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Check for category headers
    const categoryMatch = line.match(/^#{2,4}\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      const lowerCat = currentCategory.toLowerCase();
      if (skipSections.some((skip) => lowerCat.includes(skip))) {
        currentCategory = null;
      }
      continue;
    }

    // Parse table format (| Game | Description | Link |)
    if (line.startsWith("|") && line.includes("|")) {
      const tableMatch = line.match(
        /\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\s*\|/,
      );
      if (tableMatch) {
        const name = tableMatch[1].trim();
        const url = tableMatch[2].trim();
        const description = tableMatch[3].trim();

        const urlInfo = parseGitHubUrl(url);
        if (urlInfo && url.includes("github.com")) {
          const repoKey = (urlInfo.owner + "/" + urlInfo.repo).toLowerCase();
          if (!seenRepos.has(repoKey) && !shouldSkipGame(name, description)) {
            seenRepos.add(repoKey);
            games.push({
              name,
              repoUrl:
                "https://github.com/" + urlInfo.owner + "/" + urlInfo.repo,
              owner: urlInfo.owner,
              repo: urlInfo.repo,
              description: description || undefined,
              category: currentCategory || undefined,
              source: sourceName,
            });
          }
        }
      }
      continue;
    }

    // Parse bullet point formats
    if (!line.match(/^[\*\-\+]\s+/)) {
      continue;
    }

    // Extract game name - multiple patterns
    let name: string | null = null;
    let repoUrl: string | null = null;
    let description: string | undefined = undefined;

    // Pattern 1: **[Game Name](website_url)** - Description [[source]](github_url)
    const boldLinkMatch = line.match(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
    if (boldLinkMatch) {
      name = boldLinkMatch[1].trim();
    }

    // Pattern 2: **Game Name** format
    if (!name) {
      const boldMatch = line.match(/\*\*([^*\[]+)\*\*/);
      if (boldMatch) {
        name = boldMatch[1].trim();
      }
    }

    // Pattern 3: - [Game Name](github_url) format
    if (!name) {
      const linkMatch = line.match(/^[\*\-\+]\s+\[([^\]]+)\]/);
      if (linkMatch) {
        name = linkMatch[1].trim();
      }
    }

    if (!name) {
      continue;
    }

    // Extract GitHub URL
    // Pattern 1: [[source]](https://github.com/owner/repo)
    const sourceMatch = line.match(
      /\[\[source\]\]\((https?:\/\/github\.com\/[^)]+)\)/i,
    );
    if (sourceMatch) {
      repoUrl = sourceMatch[1];
    }

    // Pattern 2: Any markdown link to GitHub
    if (!repoUrl) {
      const githubMatch = line.match(
        /\[([^\]]*)\]\((https?:\/\/github\.com\/[^\/\s]+\/[^\/\s]+)\)/,
      );
      if (githubMatch) {
        repoUrl = githubMatch[2];
      }
    }

    // Pattern 3: Plain GitHub URL
    if (!repoUrl) {
      const plainMatch = line.match(
        /https?:\/\/github\.com\/[^\/\s]+\/[^\/\s]+/,
      );
      if (plainMatch) {
        repoUrl = plainMatch[0];
      }
    }

    if (!repoUrl) {
      continue;
    }

    const urlInfo = parseGitHubUrl(repoUrl);
    if (!urlInfo) {
      continue;
    }

    // Extract description
    const descMatch = line.match(/\s*[-–—:]\s*(.+?)(?:\[\[source\]\]|$|\[)/);
    if (descMatch) {
      description = descMatch[1]
        .replace(/\[\[.*?\]\]\([^)]*\)/g, "")
        .replace(/\[.*?\]\(.*?\)/g, "")
        .replace(/\*\*/g, "")
        .trim();
    }

    const repoKey = (urlInfo.owner + "/" + urlInfo.repo).toLowerCase();
    if (!seenRepos.has(repoKey) && !shouldSkipGame(name, description)) {
      seenRepos.add(repoKey);
      games.push({
        name,
        repoUrl: "https://github.com/" + urlInfo.owner + "/" + urlInfo.repo,
        owner: urlInfo.owner,
        repo: urlInfo.repo,
        description,
        category: currentCategory || undefined,
        source: sourceName,
      });
    }
  }

  return games;
}

/**
 * Fetch README from a repository
 */
async function fetchReadme(
  octokit: OctokitInstance,
  owner: string,
  repo: string,
  path: string = "README.md",
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      path,
      mediaType: { format: "raw" },
    });
    return data as unknown as string;
  } catch (error) {
    console.error(`  Error fetching README from ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetch repositories by topic from GitHub
 */
async function fetchByTopic(
  octokit: OctokitInstance,
  topic: string,
  limit: number = 100,
): Promise<ParsedGame[]> {
  const games: ParsedGame[] = [];
  const seenRepos = new Set<string>();

  try {
    // Build a simpler search query - search for game-related repositories
    // We'll search for common game-related terms
    const terms = ["game", "game-engine", "gamedev", "game-development"];
    const query = `topic:${topic} (${terms.join(" OR ")}) stars:>10 fork:>2 archived:false`;
    const perPage = Math.min(limit, 100);

    const { data } = await octokit.rest.search.repos({
      q: query,
      per_page: perPage,
      sort: "stars",
      order: "desc",
    });

    console.log(`    Found ${data.items.length} repositories for query`);

    for (const item of data.items) {
      if (!item.owner) continue;

      const ownerLogin = item.owner.login;
      const repoKey = (ownerLogin + "/" + item.name).toLowerCase();
      if (
        !seenRepos.has(repoKey) &&
        !shouldSkipGame(item.name, item.description ?? undefined)
      ) {
        seenRepos.add(repoKey);
        games.push({
          name: item.name,
          repoUrl: item.html_url,
          owner: ownerLogin,
          repo: item.name,
          description: item.description || undefined,
          category: "GitHub Search",
          source: `github-topic:${topic}`,
        });
      }
    }
  } catch (error) {
    console.error(`  Error fetching repositories:`, error);
  }

  return games;
}

/**
 * Fetch GitHub API data for a repository
 */
async function fetchRepoData(
  octokit: OctokitInstance,
  owner: string,
  repo: string,
): Promise<GitHubRepoData | null> {
  try {
    const response = await octokit.rest.repos.get({ owner, repo });

    return {
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
      homepage: response.data.homepage,
      forks_count: response.data.forks_count,
      open_issues_count: response.data.open_issues_count,
      archived: response.data.archived,
    };
  } catch (error) {
    console.warn(`  Repository not found: ${owner}/${repo}`);
    return null;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate markdown output
 */
function generateMarkdown(
  fetchedGames: FetchedGame[],
  stats: FetchStats[],
): string {
  const lines: string[] = [];

  lines.push("# Fetched Open Source Games");
  lines.push("");
  lines.push(`*Generated on ${new Date().toISOString()}*`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push("| Source | Total | New | Duplicates | Invalid |");
  lines.push("|--------|-------|-----|------------|---------|");

  for (const stat of stats) {
    lines.push(
      `| ${stat.source} | ${stat.totalParsed} | ${stat.newGames} | ${stat.duplicates} | ${stat.invalid} |`,
    );
  }

  const totalNew = stats.reduce((sum, s) => sum + s.newGames, 0);
  const totalParsed = stats.reduce((sum, s) => sum + s.totalParsed, 0);

  lines.push("");
  lines.push(`**Total new games: ${totalNew}**`);
  lines.push("");

  // Group games by source
  const gamesBySource = new Map<string, FetchedGame[]>();
  for (const game of fetchedGames) {
    if (!gamesBySource.has(game.source)) {
      gamesBySource.set(game.source, []);
    }
    gamesBySource.get(game.source)!.push(game);
  }

  // Generate sections for each source
  for (const [source, games] of gamesBySource.entries()) {
    if (games.length === 0) continue;

    lines.push("");
    lines.push(`## ${source}`);
    lines.push("");

    // Sort by stars (descending)
    games.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    for (const game of games) {
      const stars = game.stars ?? 0;
      const language = game.language ?? "Unknown";
      const desc = game.description || "No description";
      const category = game.category ? ` *[${game.category}]*` : "";

      lines.push(
        `- **[${game.name}](${game.repoUrl})**${category} - ${desc}. (Language: ${language}, Stars: ${stars})`,
      );
    }
  }

  // Add instructions for importing
  lines.push("");
  lines.push("## Import Instructions");
  lines.push("");
  lines.push("To import these games into the database:");
  lines.push("");
  lines.push("```bash");
  lines.push("# 1. Convert this markdown to JSON");
  lines.push(
    "npx tsx scripts/parse-games-list.ts data/fetched-games.md --output data/fetched-games.json",
  );
  lines.push("");
  lines.push("# 2. Sync to database");
  lines.push("npm run sync:local");
  lines.push("```");

  return lines.join("\n");
}

/**
 * Main function
 */
async function main() {
  console.log("=== Fetch Open Source Games from Multiple Sources ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();
  const octokit = createOctokit();
  const existingGames = loadExistingGames(options.existingGamesFile);
  const allFetchedGames: FetchedGame[] = [];
  const allStats: FetchStats[] = [];

  // Determine which sources to fetch
  const sourcesToFetch = options.sources
    ? GAME_SOURCES.filter((s) => options.sources!.includes(s.name))
    : GAME_SOURCES.filter((s) => s.enabledByDefault !== false);

  console.log("Fetching from " + sourcesToFetch.length + " sources:");
  for (const source of sourcesToFetch) {
    console.log("  - " + source.name);
  }
  console.log("");

  const seenNewReposAcrossSources = new Set<string>();

  // Fetch from each source
  for (const source of sourcesToFetch) {
    console.log(`Fetching from ${source.name}...`);

    let parsedGames: ParsedGame[] = [];

    if (source.type === "readme") {
      const content = await fetchReadme(
        octokit,
        source.owner!,
        source.repo!,
        source.path,
      );
      if (content) {
        parsedGames = parseReadmeContent(content, source.name);
      }
    } else if (source.type === "github-topic") {
      parsedGames = await fetchByTopic(
        octokit,
        source.topic || "open-source-game",
        100,
      );
    } else if (source.type === "html") {
      if (!source.url) {
        console.warn(`  Missing url for source: ${source.name}`);
      } else {
        parsedGames = await fetchHtmlSource(source.url, source.name);
      }
    } else if (source.type === "itch-tag") {
      if (!source.url) {
        console.warn(`  Missing url for source: ${source.name}`);
      } else {
        parsedGames = await fetchItchTagSource(
          source.url,
          source.name,
          source.maxPages ?? 1,
          source.maxItems ?? 20,
        );
      }
    }

    const newGames: ParsedGame[] = [];
    const duplicates: ParsedGame[] = [];

    for (const game of parsedGames) {
      const key = (game.owner + "/" + game.repo).toLowerCase();
      if (existingGames.has(key)) {
        duplicates.push(game);
        continue;
      }
      newGames.push(game);
    }

    const perSourceLimit = options.limit || newGames.length;
    const limitedCandidates = newGames.slice(0, perSourceLimit);

    const uniqueNewGames: ParsedGame[] = [];
    for (const game of limitedCandidates) {
      const key = (game.owner + "/" + game.repo).toLowerCase();
      if (seenNewReposAcrossSources.has(key)) {
        duplicates.push(game);
        continue;
      }
      seenNewReposAcrossSources.add(key);
      uniqueNewGames.push(game);
    }

    console.log(`  Parsed: ${parsedGames.length} games`);
    console.log(`  New: ${uniqueNewGames.length} games`);
    console.log(`  Duplicates: ${duplicates.length} games`);

    // Fetch GitHub metadata for new games (if not disabled)
    const enrichedGames: FetchedGame[] = [];
    const batchSize = 10;
    const limit = uniqueNewGames.length;

    for (let i = 0; i < limit; i += batchSize) {
      const batch = uniqueNewGames.slice(i, i + batchSize);

      if (options.noApi) {
        // Skip API fetching
        for (const game of batch) {
          enrichedGames.push({
            name: game.name,
            repoUrl: game.repoUrl,
            owner: game.owner,
            repo: game.repo,
            description: game.description || null,
            category: game.category || null,
            source: game.source,
          });
        }
      } else {
        // Fetch metadata from GitHub API
        const results = await Promise.all(
          batch.map(async (game) => {
            const repoData = await fetchRepoData(
              octokit,
              game.owner,
              game.repo,
            );
            if (repoData) {
              return {
                name: game.name,
                repoUrl: game.repoUrl,
                owner: game.owner,
                repo: game.repo,
                description: repoData.description || game.description || null,
                category: game.category || null,
                source: game.source,
                stars: repoData.stargazers_count,
                language: repoData.language,
                topics: repoData.topics,
                license: repoData.license?.spdx_id || repoData.license?.key,
                homepage: repoData.homepage,
                forks: repoData.forks_count,
              };
            }
            // Still include even if API failed
            return {
              name: game.name,
              repoUrl: game.repoUrl,
              owner: game.owner,
              repo: game.repo,
              description: game.description || null,
              category: game.category || null,
              source: game.source,
            };
          }),
        );

        enrichedGames.push(...results);

        // Rate limit delay
        if (i + batchSize < limit) {
          await sleep(1000);
        }
      }

      const progress = Math.min(i + batchSize, limit);
      console.log(`  Progress: ${progress}/${limit}`);
    }

    allFetchedGames.push(...enrichedGames);

    allStats.push({
      source: source.name,
      totalParsed: parsedGames.length,
      newGames: enrichedGames.length,
      duplicates: duplicates.length,
      invalid: 0,
    });

    console.log("");
  }

  // Sort all games by stars
  allFetchedGames.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  console.log("=== Summary ===");
  console.log("Total new games found: " + allFetchedGames.length);

  for (const stat of allStats) {
    console.log(`  ${stat.source}: ${stat.newGames} new games`);
  }
  console.log("");

  // Top games by stars
  console.log("Top 20 games:");
  for (const game of allFetchedGames.slice(0, 20)) {
    const stars =
      game.stars !== undefined ? game.stars.toString().padStart(5) : "  N/A";
    console.log(`  ${stars} stars - ${game.name} (${game.owner}/${game.repo})`);
  }
  console.log("");

  // Write output
  if (options.jsonOutput) {
    const output = {
      fetchedAt: new Date().toISOString(),
      totalGames: allFetchedGames.length,
      stats: allStats,
      games: allFetchedGames,
    };
    writeFileSync(options.outputFile, JSON.stringify(output, null, 2));
  } else {
    const markdown = generateMarkdown(allFetchedGames, allStats);
    writeFileSync(options.outputFile, markdown);
  }

  console.log("Output written to: " + options.outputFile);
  console.log("");

  // Also write a curated list of popular games (auto-generated)
  const curatedOutputFile = resolve(DATA_DIR, "auto-curated-games.md");
  const curatedGames = allFetchedGames
    .filter((g) => (g.stars || 0) >= 100)
    .slice(0, 100);

  const curatedLines: string[] = [];
  curatedLines.push("# Curated Popular Open Source Games");
  curatedLines.push("");
  curatedLines.push(`*Generated on ${new Date().toISOString()}*`);
  curatedLines.push("");
  curatedLines.push(
    "A curated list of popular open-source games (100+ stars) from various sources.",
  );
  curatedLines.push("");

  // Group by category
  const gamesByCategory = new Map<string, FetchedGame[]>();
  for (const game of curatedGames) {
    const cat = game.category || "Other";
    if (!gamesByCategory.has(cat)) {
      gamesByCategory.set(cat, []);
    }
    gamesByCategory.get(cat)!.push(game);
  }

  for (const [category, games] of gamesByCategory.entries()) {
    curatedLines.push("");
    curatedLines.push(`## ${category}`);
    curatedLines.push("");

    for (const game of games) {
      const stars = game.stars ?? 0;
      const language = game.language ?? "Unknown";
      const desc = game.description || "No description";

      curatedLines.push(`- **[${game.name}](${game.repoUrl})** - ${desc}`);
      curatedLines.push(
        `  - Language: ${language} | Stars: ${stars} | Forks: ${game.forks || 0}`,
      );
    }
  }

  writeFileSync(curatedOutputFile, curatedLines.join("\n"));
  console.log("Curated list written to: " + curatedOutputFile);
  console.log("");

  console.log("=== Complete ===");
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
