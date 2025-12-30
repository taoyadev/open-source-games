#!/usr/bin/env npx tsx
/**
 * Parse Open Source Games Markdown List to JSON
 *
 * Parses markdown-formatted game lists and converts them to structured JSON
 * compatible with the database schema. Can read from a file or accept markdown
 * content via stdin/command line.
 *
 * Usage:
 *   npx tsx scripts/parse-games-list.ts <path-to-markdown-file>
 *   cat games.md | npx tsx scripts/parse-games-list.ts -
 *   npx tsx scripts/parse-games-list.ts --content "# Games..."
 *
 * The markdown format expected:
 *   ## Category Name
 *   - **[Game Title](url)** - Description. [[source]](https://github.com/owner/repo)
 *   - **Game Title** - Description. [[source]](https://github.com/owner/repo)
 *   - [Game Title](https://github.com/owner/repo) - Description
 *
 * Output:
 *   JSON file with parsed games matching the database schema structure
 *
 * Options:
 *   --output PATH   Output file path (default: data/parsed-games.json)
 *   --format TYPE   Output format: 'json' or 'sql' (default: json)
 *   --strict        Skip entries without valid GitHub URLs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

/**
 * Game entry parsed from markdown
 */
interface ParsedGameEntry {
  title: string;
  slug: string;
  id: string; // owner-repo format
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
  inputFile: string | null;
  outputFile: string;
  format: "json" | "sql";
  strict: boolean;
} {
  const args = process.argv.slice(2);
  const options: {
    inputFile: string | null;
    outputFile: string;
    format: "json" | "sql";
    strict: boolean;
  } = {
    inputFile: null,
    outputFile: resolve(DATA_DIR, "parsed-games.json"),
    format: "json",
    strict: false,
  };

  let contentMode = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--output" && args[i + 1]) {
      options.outputFile = args[i + 1];
      i++;
      continue;
    }

    if (arg === "--format" && args[i + 1]) {
      const fmt = args[i + 1].toLowerCase();
      if (fmt === "json" || fmt === "sql") {
        options.format = fmt;
      }
      i++;
      continue;
    }

    if (arg === "--strict") {
      options.strict = true;
      continue;
    }

    if (arg === "--content") {
      contentMode = true;
      // Read content from next arg
      if (args[i + 1]) {
        options.inputFile = args[i + 1];
        i++;
      }
      continue;
    }

    // Positional argument is the input file
    if (!arg.startsWith("-") && !options.inputFile) {
      options.inputFile = arg;
    }
  }

  // Special handling for stdin mode (dash as filename)
  if (options.inputFile === "-" && !contentMode) {
    // Read from stdin will be handled later
  }

  return options;
}

/**
 * Read content from file or stdin
 */
async function readContent(
  inputFile: string | null,
): Promise<{ content: string; source: string }> {
  if (!inputFile) {
    console.error("Error: No input file specified.");
    console.error(
      "Usage: npx tsx scripts/parse-games-list.ts <path-to-markdown-file>",
    );
    process.exit(1);
  }

  // Handle stdin mode
  if (inputFile === "-") {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return {
      content: Buffer.concat(chunks).toString("utf-8"),
      source: "stdin",
    };
  }

  // Handle regular file
  const filePath = resolve(ROOT_DIR, inputFile);
  if (!existsSync(filePath)) {
    console.error("Error: File not found: " + filePath);
    process.exit(1);
  }

  return {
    content: readFileSync(filePath, "utf-8"),
    source: filePath,
  };
}

/**
 * Generate slug from title
 */
function generateSlug(title: string, owner: string = ""): string {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });

  // If slug is too short or generic, include owner
  if (baseSlug.length < 3 || ["game", "games", "app"].includes(baseSlug)) {
    if (owner) {
      return slugify(owner + "-" + title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
    }
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
    /^([^\/]+)\/([^\/\s#?]+)$/, // owner/repo format
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
 * Extract homepage URL from markdown link
 * Looks for links before the [[source]] link that aren't GitHub URLs
 */
function extractHomepage(line: string, repoUrl: string): string | null {
  // Remove the [[source]] part temporarily
  const withoutSource = line.replace(/\[\[source\]\]\([^)]+\)/gi, "");

  // Find all markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: { title: string; url: string }[] = [];

  let match;
  while ((match = linkRegex.exec(withoutSource)) !== null) {
    links.push({ title: match[1], url: match[2] });
  }

  // Filter out GitHub repo URLs (those are source links)
  for (const link of links) {
    if (!link.url.includes("github.com") && !link.url.includes("gitlab.com")) {
      // Could be a homepage
      if (link.url.startsWith("http://") || link.url.startsWith("https://")) {
        return link.url;
      }
    }
  }

  return null;
}

/**
 * Parse markdown content to extract game entries
 *
 * Supported formats:
 * - ## Category Name
 * - **[Game Title](url)** - Description. [[source]](https://github.com/owner/repo)
 * - **Game Title** - Description. [[source]](https://github.com/owner/repo)
 * - [Game Title](https://github.com/owner/repo) - Description
 * - [Game Title](https://github.com/owner/repo)
 */
function parseMarkdownContent(content: string): ParsedGamesOutput {
  const games: ParsedGameEntry[] = [];
  const skipped: { reason: string; line: string; count: number }[] = [];
  const skipCounts = new Map<string, number>();

  const lines = content.split("\n");
  const seenRepos = new Set<string>();

  let currentCategory: string | null = null;

  // Skip patterns for non-game sections
  const skipSections = [
    "contributing",
    "license",
    "table of contents",
    "other lists",
    "see also",
    "references",
    "external links",
    "footnotes",
  ];

  for (let line of lines) {
    // Trim whitespace
    line = line.trim();

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Check for category headers (## Category Name or ### Category Name)
    const categoryMatch = line.match(/^#{2,3}\s+(.+)$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
      // Check if this section should be skipped
      const lowerCat = currentCategory.toLowerCase();
      if (skipSections.some((skip) => lowerCat.includes(skip))) {
        currentCategory = null;
      }
      continue;
    }

    // Skip lines without bullet points
    if (!line.match(/^[\*\-]\s+/)) {
      continue;
    }

    // Extract game name - multiple patterns supported
    let title: string | null = null;
    let homepage: string | null = null;

    // Pattern 1: **[Game Title](website_url)** format with bold link
    const boldLinkMatch = line.match(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/);
    if (boldLinkMatch) {
      title = boldLinkMatch[1].trim();
      const url = boldLinkMatch[2].trim();
      if (!url.includes("github.com") && !url.includes("gitlab.com")) {
        homepage = url;
      }
    }

    // Pattern 2: **Game Title** format (bold without link)
    if (!title) {
      const boldMatch = line.match(/\*\*([^*\[]+)\*\*/);
      if (boldMatch) {
        title = boldMatch[1].trim();
      }
    }

    // Pattern 3: - [Game Title](github_url) format (direct GitHub link)
    if (!title) {
      const directLinkMatch = line.match(
        /^[\*\-]\s+\[([^\]]+)\]\((https?:\/\/(?:github\.com|gitlab\.com|codeberg\.org)\/[^\s)]+)\)/,
      );
      if (directLinkMatch) {
        title = directLinkMatch[1].trim();
      }
    }

    // Pattern 4: [Game Title](url) format (any link)
    if (!title) {
      const anyLinkMatch = line.match(/^[\*\-]\s+\[([^\]]+)\]/);
      if (anyLinkMatch) {
        title = anyLinkMatch[1].trim();
      }
    }

    if (!title) {
      // Skip lines where we can't extract a title
      const reason = "No title found";
      skipCounts.set(reason, (skipCounts.get(reason) || 0) + 1);
      continue;
    }

    // Extract GitHub source URL
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

    // Pattern 3: Plain GitHub URL in the line
    if (!repoUrl) {
      const urlMatch = line.match(
        /https?:\/\/(?:github\.com|gitlab\.com|codeberg\.org)\/[^\/\s]+\/[^\/\s]+/,
      );
      if (urlMatch) {
        repoUrl = urlMatch[0];
      }
    }

    if (!repoUrl) {
      const reason = "No GitHub URL found";
      skipCounts.set(reason, (skipCounts.get(reason) || 0) + 1);
      if (homepage) {
        // Still count it, just with null repoUrl
        skipCounts.set(
          "Homepage without source",
          (skipCounts.get("Homepage without source") || 0) + 1,
        );
      }
      continue;
    }

    // Only process GitHub repos for now (skip gitlab and codeberg for now)
    if (!repoUrl.includes("github.com")) {
      const reason = "Non-GitHub URL (GitLab/Codeberg)";
      skipCounts.set(reason, (skipCounts.get(reason) || 0) + 1);
      continue;
    }

    // Parse the URL and validate
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      const reason = "Invalid GitHub URL format";
      skipCounts.set(reason, (skipCounts.get(reason) || 0) + 1);
      continue;
    }

    // Deduplicate by owner/repo
    const repoKey = (parsed.owner + "/" + parsed.repo).toLowerCase();
    if (seenRepos.has(repoKey)) {
      const reason = "Duplicate repository";
      skipCounts.set(reason, (skipCounts.get(reason) || 0) + 1);
      continue;
    }
    seenRepos.add(repoKey);

    // Extract description - text after the game name/link and before [[source]]
    let description: string | null = null;

    // Remove the [[source]] link first
    let descPart = line.replace(/\[\[source\]\]\([^)]+\)/gi, "");

    // Remove the game title part (various patterns)
    descPart = descPart
      .replace(/^[\*\-]\s+/, "") // Remove bullet
      .replace(/\*\*\[[^\]]+\]\([^\)]+\)\*\*/, "") // Remove bold link title
      .replace(/\*\*[^*\[]+\*\*/, "") // Remove bold title
      .replace(/\[[^\]]+\]\([^\)]+\)/, "") // Remove first markdown link
      .replace(/^[\s\-–—]+/, "") // Remove leading dashes/spaces
      .trim();

    // Clean up remaining markdown
    description = descPart
      .replace(/\[\[.*?\]\]\([^)]*\)/g, "") // Remove other markdown links
      .replace(/\[.*?\]\(.*?\)/g, "") // Remove any links
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/\*/g, "") // Remove italic markers
      .replace(/^-/, "") // Remove leading dash
      .trim();

    // Clean description ending
    if (description && description.endsWith(".")) {
      description = description.slice(0, -1).trim();
    }

    if (description && description.length < 3) {
      description = null;
    }

    // Get homepage if not already found
    if (!homepage) {
      homepage = extractHomepage(line, repoUrl);
    }

    // Generate slug and id
    const slug = generateSlug(title, parsed.owner);
    const id = parsed.owner.toLowerCase() + "-" + parsed.repo.toLowerCase();

    games.push({
      title,
      slug,
      id,
      repoUrl: "https://github.com/" + parsed.owner + "/" + parsed.repo,
      owner: parsed.owner,
      repo: parsed.repo,
      description,
      category: currentCategory || null,
      homepage,
    });
  }

  // Build skip summary
  const skippedSummary = Array.from(skipCounts.entries()).map(
    ([reason, count]) => ({
      reason,
      line: "(see parser logs)",
      count,
    }),
  );

  // Count by category
  const categories: Record<string, number> = {};
  for (const game of games) {
    const cat = game.category || "Uncategorized";
    categories[cat] = (categories[cat] || 0) + 1;
  }

  return {
    parsedAt: new Date().toISOString(),
    sourceFile: "parsed-markdown",
    totalGames: games.length,
    categories,
    games,
    skipped: skippedSummary,
  };
}

/**
 * Convert parsed games to SQL INSERT statements
 */
function generateSQL(games: ParsedGameEntry[]): string {
  const statements: string[] = [];

  statements.push("-- Generated SQL for parsed games");
  statements.push(
    "-- Run with: wrangler d1 execute open-source-games-db --local --file=generated.sql",
  );
  statements.push("");

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    return "'" + String(val).replace(/'/g, "''") + "'";
  };

  for (const game of games) {
    const now = Math.floor(Date.now() / 1000);
    const jsonTopics = escape("[]"); // Empty topics array, will be filled by GitHub API

    const sql = `INSERT OR REPLACE INTO games (
  id, slug, title, repo_url, description, category, homepage,
  stars, language, genre, topics,
  created_at, updated_at
) VALUES (
  ${escape(game.id)},
  ${escape(game.slug)},
  ${escape(game.title)},
  ${escape(game.repoUrl)},
  ${escape(game.description)},
  ${escape(game.category)},
  ${escape(game.homepage)},
  0, NULL, NULL, ${jsonTopics},
  ${now}, ${now}
);`;

    statements.push(sql);
    statements.push("");
  }

  return statements.join("\n");
}

/**
 * Main function
 */
async function main() {
  console.log("=== Open Source Games Markdown Parser ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const options = parseArgs();

  // Read input content
  console.log("Reading input from: " + (options.inputFile || "stdin"));
  const { content, source } = await readContent(options.inputFile);
  console.log("Read " + content.length + " bytes");
  console.log("");

  // Parse markdown
  console.log("Parsing markdown content...");
  const result = parseMarkdownContent(content);

  console.log("Found " + result.totalGames + " games");
  console.log("");

  // Print category summary
  console.log("=== Categories ===");
  const sortedCats = Object.entries(result.categories).sort(
    (a, b) => b[1] - a[1],
  );
  for (const [cat, count] of sortedCats) {
    console.log("  " + cat + ": " + count);
  }
  console.log("");

  // Print skip summary
  if (result.skipped.length > 0) {
    console.log("=== Skipped Entries ===");
    for (const entry of result.skipped) {
      console.log("  " + entry.reason + ": " + entry.count);
    }
    console.log("");
  }

  // Print sample games
  console.log("=== Sample Games (first 5) ===");
  for (const game of result.games.slice(0, 5)) {
    console.log("  - " + game.title + " (" + game.repoUrl + ")");
  }
  console.log("");

  // Output result
  const outputFile = resolve(ROOT_DIR, options.outputFile);

  if (options.format === "sql") {
    const sql = generateSQL(result.games);
    writeFileSync(outputFile, sql, "utf-8");
    console.log("SQL written to: " + outputFile);
  } else {
    writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
    console.log("JSON written to: " + outputFile);
  }

  console.log("");
  console.log("=== Parsing Complete ===");
}

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
