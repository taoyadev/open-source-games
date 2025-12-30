#!/usr/bin/env npx tsx
/**
 * Fetch ALL OSGL Games from Website
 *
 * Fetches all letter pages (A.html, B.html, etc.) from OSGL website
 * and extracts games with their GitHub repository URLs.
 */

import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT_DIR, "data");

// All letter pages to fetch
const letters = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const BASE_URL = "https://trilarion.github.io/opensourcegames/games";

interface GameInfo {
  title: string;
  slug: string;
  githubUrl?: string;
  gitlabUrl?: string;
  genre?: string;
  tags: string[];
  status: string; // active, inactive, beta, mature
  languages: string[];
}

/**
 * Extract GitHub URL from HTML
 */
function extractGitHubUrl(html: string, gameTitle: string): string | undefined {
  // Look for github.com links in the game's HTML section
  const githubRegex = /href="(https:\/\/github\.com\/[^"]+)"/gi;
  const matches = [...html.matchAll(githubRegex)];

  for (const match of matches) {
    const url = match[1];
    // Filter out non-repository links
    if (
      !url.includes("/releases/") &&
      !url.includes("/issues/") &&
      !url.includes("/pull/") &&
      !url.includes("/wiki/") &&
      !url.includes("/blob/") &&
      !url.includes("/tree/") &&
      !url.endsWith(".git") &&
      !url.includes("/raw/")
    ) {
      return url.replace(/\.git$/, "");
    }
  }
  return undefined;
}

/**
 * Extract GitLab URL from HTML
 */
function extractGitLabUrl(html: string): string | undefined {
  const gitlabRegex = /href="(https:\/\/gitlab\.com\/[^"]+)"/gi;
  const matches = [...html.matchAll(gitlabRegex)];

  for (const match of matches) {
    const url = match[1];
    if (
      !url.includes("/-/") &&
      !url.includes("/releases") &&
      !url.endsWith(".git")
    ) {
      return url.replace(/\.git$/, "");
    }
  }
  return undefined;
}

/**
 * Extract tags/genres from HTML
 */
function extractGenres(html: string): string[] {
  const genres: string[] = [];
  const genreRegex = /href="genres\.html#([^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/gi;
  for (const match of html.matchAll(genreRegex)) {
    genres.push(match[2]);
  }
  return genres;
}

/**
 * Extract languages from HTML
 */
function extractLanguages(html: string): string[] {
  const languages: string[] = [];
  const langRegex = /href="languages\.html#([^"]+)"[^>]*>\s*([^<]+)\s*<\/a>/gi;
  for (const match of html.matchAll(langRegex)) {
    languages.push(match[2]);
  }
  return languages;
}

/**
 * Extract status from HTML
 */
function extractStatus(html: string): string {
  if (html.includes('has-text-weight-bold">mature')) return "mature";
  if (html.includes('has-text-weight-bold">active')) return "active";
  if (html.includes('has-text-weight-bold">beta')) return "beta";
  return "unknown";
}

/**
 * Parse a single letter page HTML
 */
function parseLetterPage(html: string, letter: string): GameInfo[] {
  const games: GameInfo[] = [];

  // Split by game boxes (each game is in a div with class="box" and id)
  const gameBoxes = html.split(/<div id="/g).slice(1);

  for (const box of gameBoxes) {
    // Extract the game ID/slug from the start
    const idMatch = box.match(/^([a-z0-9_\-]+)"/);
    if (!idMatch) continue;

    const slug = idMatch[1];

    // Extract title
    const titleMatch = box.match(
      /<div class="level-item title is-4">([^<]+)<\/div>/,
    );
    if (!titleMatch) continue;

    const title = titleMatch[1]
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .trim();

    // Extract GitHub URL
    const githubUrl = extractGitHubUrl(box, title);

    // Only include games with GitHub URLs
    if (!githubUrl) continue;

    games.push({
      title,
      slug,
      githubUrl,
      gitlabUrl: extractGitLabUrl(box),
      genre: extractGenres(box)[0],
      tags: extractGenres(box),
      status: extractStatus(box),
      languages: extractLanguages(box),
    });
  }

  return games;
}

/**
 * Main function
 */
async function main() {
  console.log("=== Fetching All OSGL Games ===");
  console.log("Started at: " + new Date().toISOString());
  console.log("");

  const allGames: GameInfo[] = [];
  let totalFetched = 0;

  for (const letter of letters) {
    const url = `${BASE_URL}/${letter.toUpperCase()}.html`;
    console.log(`Fetching ${letter.toUpperCase()}.html...`);

    try {
      execSync(`curl -sL "${url}" -o "${DATA_DIR}/osgl-${letter}.html"`, {
        cwd: ROOT_DIR,
        stdio: "inherit",
      });

      const html = readFileSync(
        resolve(DATA_DIR, `osgl-${letter}.html`),
        "utf-8",
      );
      const games = parseLetterPage(html, letter);

      console.log(`  Found ${games.length} games with GitHub URLs`);
      allGames.push(...games);
      totalFetched++;
    } catch (error) {
      console.error(`  Error fetching ${letter}:`, (error as Error).message);
    }
  }

  console.log("");
  console.log(`=== Summary ===`);
  console.log(`Total letters fetched: ${totalFetched}`);
  console.log(`Total games with GitHub URLs: ${allGames.length}`);

  // Write to JSON
  const outputFile = resolve(DATA_DIR, "osgl-all-games.json");
  writeFileSync(
    outputFile,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        source: "OSGL (https://trilarion.github.io/opensourcegames/)",
        totalGames: allGames.length,
        games: allGames,
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(`Written to: ${outputFile}`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Review the games in data/osgl-all-games.json");
  console.log(
    "  2. Import to database: npx tsx scripts/import-osgl-all-games.ts",
  );
}

main().catch(console.error);
