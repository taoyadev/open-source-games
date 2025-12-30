/**
 * GitHub API utilities using Octokit
 *
 * Provides rate-limited access to GitHub API for fetching repository data.
 * Implements exponential backoff and caching headers for efficient syncing.
 */

import { Octokit } from "@octokit/core";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type {
  GitHubRepoData,
  GitHubRelease,
  RateLimitStatus,
} from "@/types/game";

// Create extended Octokit with REST endpoints
const MyOctokit = Octokit.plugin(restEndpointMethods);
type OctokitInstance = InstanceType<typeof MyOctokit>;

// Re-export the type for use elsewhere
export type { OctokitInstance };

// Create Octokit instance with auth token
export function createOctokit(token?: string): OctokitInstance {
  return new MyOctokit({
    auth: token || process.env.GITHUB_TOKEN,
  });
}

// Singleton instance for scripts
let octokitInstance: OctokitInstance | null = null;

export function getOctokit(): OctokitInstance {
  if (!octokitInstance) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn(
        "Warning: GITHUB_TOKEN not set. API rate limits will be restricted.",
      );
    }
    octokitInstance = createOctokit(token);
  }
  return octokitInstance;
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  octokit?: OctokitInstance,
): Promise<RateLimitStatus> {
  const client = octokit || getOctokit();
  const { data } = await client.rest.rateLimit.get();

  return {
    limit: data.resources.core.limit,
    remaining: data.resources.core.remaining,
    reset: new Date(data.resources.core.reset * 1000),
    used: data.resources.core.used,
  };
}

/**
 * Wait for rate limit reset if needed
 */
export async function waitForRateLimit(
  octokit?: OctokitInstance,
): Promise<void> {
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
          "s until reset...",
      );
      await sleep(waitMs);
    }
  }
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch repository data with error handling and optional ETag support
 */
export async function fetchRepoData(
  owner: string,
  repo: string,
  etag?: string,
  octokit?: OctokitInstance,
): Promise<{
  data: GitHubRepoData | null;
  etag: string | null;
  notModified: boolean;
}> {
  const client = octokit || getOctokit();

  try {
    const response = await client.rest.repos.get({
      owner,
      repo,
      headers: etag ? { "If-None-Match": etag } : undefined,
    });

    // Transform to our interface
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

    return {
      data,
      etag: response.headers.etag || null,
      notModified: false,
    };
  } catch (error: unknown) {
    // Handle 304 Not Modified
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 304
    ) {
      return { data: null, etag: etag || null, notModified: true };
    }

    // Handle 404 Not Found
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      console.warn("Repository not found: " + owner + "/" + repo);
      return { data: null, etag: null, notModified: false };
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch latest release for a repository
 */
export async function fetchLatestRelease(
  owner: string,
  repo: string,
  octokit?: OctokitInstance,
): Promise<GitHubRelease | null> {
  const client = octokit || getOctokit();

  try {
    const { data } = await client.rest.repos.getLatestRelease({
      owner,
      repo,
    });

    return {
      tag_name: data.tag_name,
      name: data.name || data.tag_name,
      published_at: data.published_at || "",
      html_url: data.html_url,
      assets: data.assets.map((asset) => ({
        name: asset.name,
        download_count: asset.download_count,
        browser_download_url: asset.browser_download_url,
      })),
    };
  } catch (error: unknown) {
    // No releases found is not an error
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetch README content from a repository
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  octokit?: OctokitInstance,
): Promise<string | null> {
  const client = octokit || getOctokit();

  try {
    const { data } = await client.rest.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: "raw",
      },
    });

    return data as unknown as string;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Fetch raw file content from GitHub
 */
export async function fetchRawContent(url: string): Promise<string> {
  // Convert github.com URL to raw.githubusercontent.com
  const rawUrl = url
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob/", "/");

  const response = await fetch(rawUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch " + rawUrl + ": " + response.status);
  }

  return response.text();
}

/**
 * Extract GitHub repos from bobeff/open-source-games README
 */
export async function fetchOpenSourceGamesReadme(
  octokit?: OctokitInstance,
): Promise<string> {
  const client = octokit || getOctokit();

  const { data } = await client.rest.repos.getReadme({
    owner: "bobeff",
    repo: "open-source-games",
    mediaType: {
      format: "raw",
    },
  });

  return data as unknown as string;
}

/**
 * Batch fetch with rate limiting and progress callback
 */
export async function batchFetchRepos<T>(
  items: T[],
  fetchFn: (item: T, index: number) => Promise<void>,
  options: {
    batchSize?: number;
    delayMs?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {},
): Promise<void> {
  const { batchSize = 10, delayMs = 100, onProgress } = options;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch in parallel
    await Promise.all(batch.map((item, idx) => fetchFn(item, i + idx)));

    // Report progress
    const completed = Math.min(i + batchSize, items.length);
    if (onProgress) {
      onProgress(completed, items.length);
    }

    // Check rate limit every batch
    if (i + batchSize < items.length) {
      await waitForRateLimit();
      await sleep(delayMs);
    }
  }
}

/**
 * Check if a topic indicates multiplayer
 */
export function isMultiplayerGame(topics: string[]): boolean {
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
 * Infer platforms from topics and language
 */
export function inferPlatforms(
  topics: string[],
  language: string | null,
): string[] {
  const platforms: Set<string> = new Set();
  const topicsLower = topics.map((t) => t.toLowerCase());

  // Check for explicit platform topics
  const platformMap: Record<string, string> = {
    windows: "Windows",
    linux: "Linux",
    macos: "macOS",
    mac: "macOS",
    osx: "macOS",
    android: "Android",
    ios: "iOS",
    web: "Web",
    browser: "Web",
    html5: "Web",
    wasm: "Web",
    webgl: "Web",
    steam: "Steam",
    "itch-io": "itch.io",
  };

  for (const topic of topicsLower) {
    if (platformMap[topic]) {
      platforms.add(platformMap[topic]);
    }
  }

  // If no platforms found, assume cross-platform based on language
  if (platforms.size === 0) {
    const crossPlatformLangs = [
      "Rust",
      "C++",
      "C",
      "Python",
      "Java",
      "Go",
      "JavaScript",
      "TypeScript",
    ];
    if (language && crossPlatformLangs.includes(language)) {
      platforms.add("Windows");
      platforms.add("Linux");
      platforms.add("macOS");
    }
  }

  return Array.from(platforms);
}
