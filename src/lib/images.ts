/**
 * Image utilities for Open Source Games Platform
 *
 * Handles image URL generation, README image extraction,
 * and fallback emoji mapping for games without images.
 */

export type ImageSize = "thumb" | "medium" | "large";

export interface ImageSizeConfig {
  width: number;
  height: number;
  quality: number;
}

// Image size configurations matching the spec
export const IMAGE_SIZES: Record<ImageSize, ImageSizeConfig> = {
  thumb: { width: 300, height: 200, quality: 85 },
  medium: { width: 600, height: 400, quality: 85 },
  large: { width: 1200, height: 800, quality: 90 },
};

// CDN base URL for R2 bucket
const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.osgames.dev";

// Local storage path for development
const LOCAL_IMAGES_PATH = "/images/games";

/**
 * Get the image URL for a game at a specific size
 *
 * @param gameId - The game's unique ID
 * @param size - Image size variant (thumb, medium, large)
 * @returns The full URL to the image
 */
export function getImageUrl(gameId: string, size: ImageSize = "thumb"): string {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // In development, use local storage path
    return `${LOCAL_IMAGES_PATH}/${gameId}/${size}.webp`;
  }

  // In production, use R2 CDN
  return `${CDN_BASE_URL}/games/${gameId}/${size}.webp`;
}

/**
 * Get all image URLs for a game (all sizes)
 *
 * @param gameId - The game's unique ID
 * @returns Object with URLs for all sizes
 */
export function getAllImageUrls(gameId: string): Record<ImageSize, string> {
  return {
    thumb: getImageUrl(gameId, "thumb"),
    medium: getImageUrl(gameId, "medium"),
    large: getImageUrl(gameId, "large"),
  };
}

/**
 * Extract images from a GitHub README content
 *
 * Looks for:
 * 1. Markdown images: ![alt](url)
 * 2. HTML img tags: <img src="url" />
 * 3. Reference-style images: ![alt][ref]
 *
 * @param readmeContent - The raw README content
 * @returns Array of image URLs found in the README
 */
export function extractImagesFromReadme(readmeContent: string): string[] {
  const images: string[] = [];

  // Match Markdown images: ![alt text](url)
  const mdImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = mdImageRegex.exec(readmeContent)) !== null) {
    const url = match[1].split(" ")[0]; // Handle ![alt](url "title") format
    if (isValidImageUrl(url)) {
      images.push(url);
    }
  }

  // Match HTML img tags: <img src="url" /> or <img src='url'>
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(readmeContent)) !== null) {
    if (isValidImageUrl(match[1])) {
      images.push(match[1]);
    }
  }

  // Remove duplicates and return
  return [...new Set(images)];
}

/**
 * Get the first valid image from a README
 *
 * @param readmeContent - The raw README content
 * @param repoUrl - The repository URL for resolving relative paths
 * @returns The first valid image URL or null
 */
export function getFirstImageFromReadme(
  readmeContent: string,
  repoUrl: string,
): string | null {
  const images = extractImagesFromReadme(readmeContent);

  if (images.length === 0) {
    return null;
  }

  // Get the first image and resolve relative URLs
  const firstImage = images[0];
  return resolveImageUrl(firstImage, repoUrl);
}

/**
 * Resolve a potentially relative image URL to an absolute URL
 *
 * @param imageUrl - The image URL (may be relative)
 * @param repoUrl - The repository URL for context
 * @returns The resolved absolute URL
 */
export function resolveImageUrl(imageUrl: string, repoUrl: string): string {
  // Already absolute URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Parse the GitHub repo URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return imageUrl;
  }

  const [, owner, repo] = match;
  const repoName = repo.replace(/\.git$/, "");

  // Remove leading ./ or /
  const cleanPath = imageUrl.replace(/^\.?\//, "");

  // Convert to raw.githubusercontent.com URL
  return `https://raw.githubusercontent.com/${owner}/${repoName}/HEAD/${cleanPath}`;
}

/**
 * Check if a URL is a valid image URL
 *
 * @param url - The URL to check
 * @returns True if the URL appears to be a valid image
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Skip data URIs (too large to process)
  if (url.startsWith("data:")) {
    return false;
  }

  // Skip SVG badges (not useful as game thumbnails)
  if (url.includes("shields.io") || url.includes("badge")) {
    return false;
  }

  // Skip CI/CD status badges
  if (
    url.includes("github.com") &&
    (url.includes("/workflows/") || url.includes("/actions/"))
  ) {
    return false;
  }

  // Check for common image extensions
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const urlLower = url.toLowerCase();

  // Check if URL has image extension or is from known image hosts
  const hasImageExtension = imageExtensions.some((ext) =>
    urlLower.includes(ext),
  );
  const isFromImageHost =
    url.includes("imgur.com") ||
    url.includes("githubusercontent.com") ||
    url.includes("cloudinary.com") ||
    url.includes("itch.io") ||
    url.includes("steamcdn");

  return hasImageExtension || isFromImageHost;
}

/**
 * Get a fallback emoji for a game based on its genre
 *
 * @param genre - The game's primary genre
 * @returns An emoji representing the genre
 */
export function getFallbackEmoji(genre: string | null | undefined): string {
  if (!genre) {
    return "🎮"; // Default game emoji
  }

  const genreEmojis: Record<string, string> = {
    // Action games
    action: "🎯",
    shooter: "🔫",
    fps: "🎯",
    fighting: "🥊",

    // Adventure games
    adventure: "🗺️",
    exploration: "🧭",
    openworld: "🌍",

    // Strategy games
    strategy: "♟️",
    rts: "⚔️",
    "tower-defense": "🏰",
    "4x": "👑",

    // RPG games
    rpg: "⚔️",
    roguelike: "💀",
    roguelite: "🎲",
    jrpg: "🗡️",
    mmorpg: "🌐",

    // Puzzle games
    puzzle: "🧩",
    logic: "🧠",
    match3: "💎",

    // Simulation games
    simulation: "🏗️",
    sandbox: "🏖️",
    building: "🧱",
    management: "📊",

    // Sports and racing
    sports: "⚽",
    racing: "🏎️",
    football: "🏈",
    basketball: "🏀",

    // Platformer games
    platformer: "🏃",
    metroidvania: "🦸",
    "2d": "👾",

    // Horror and survival
    horror: "👻",
    survival: "🏕️",
    zombie: "🧟",

    // Card and board games
    card: "🃏",
    board: "🎲",
    chess: "♟️",

    // Other genres
    educational: "📚",
    music: "🎵",
    rhythm: "🎶",
    arcade: "👾",
    casual: "🎪",
    multiplayer: "🌐",
    coop: "🤝",
    indie: "🌟",
    retro: "📺",
    pixel: "🕹️",
    vr: "🥽",

    // Engine/tech specific
    godot: "🤖",
    unity: "🎮",
    unreal: "🎬",
    love2d: "❤️",
    phaser: "⚡",
  };

  const normalizedGenre = genre.toLowerCase().replace(/[^a-z0-9]/g, "");
  return genreEmojis[normalizedGenre] || "🎮";
}

/**
 * Get a fallback emoji based on the game's name
 * Uses consistent hashing to always return the same emoji for a given name
 *
 * @param name - The game's name
 * @returns An emoji for the game
 */
export function getFallbackEmojiByName(name: string): string {
  const gameEmojis = [
    "🎮",
    "🕹️",
    "👾",
    "🎲",
    "🏆",
    "⚔️",
    "🛡️",
    "🗡️",
    "🔮",
    "🎯",
    "🚀",
    "🌟",
    "💎",
    "🎪",
    "🎭",
  ];

  // Simple hash based on character codes
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % gameEmojis.length;
  return gameEmojis[index];
}

/**
 * Generate srcset for responsive images
 *
 * @param gameId - The game's unique ID
 * @returns A srcset string for use in img or source elements
 */
export function generateSrcSet(gameId: string): string {
  const thumb = getImageUrl(gameId, "thumb");
  const medium = getImageUrl(gameId, "medium");
  const large = getImageUrl(gameId, "large");

  return `${thumb} 300w, ${medium} 600w, ${large} 1200w`;
}

/**
 * Get sizes attribute for responsive images
 *
 * @returns A sizes string based on common breakpoints
 */
export function getImageSizes(): string {
  return "(max-width: 640px) 300px, (max-width: 1024px) 600px, 1200px";
}
