import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with K/M suffix for readability
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Convert GitHub stars to a 5-point rating scale
 * Based on the spec: Math.min(5, game.stars / 2000)
 */
export function starsToRating(stars: number): number {
  return Math.min(5, Math.max(1, stars / 2000));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "Unknown";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Extract GitHub owner and repo from URL
 */
export function parseGitHubUrl(
  url: string,
): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

/**
 * Get the base URL for the site
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://osgames.dev";
}

/**
 * Calculate relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string | null): string {
  if (!date) return "Unknown";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get language color for display (GitHub-style)
 */
export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Rust: "#dea584",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Java: "#b07219",
    Go: "#00ADD8",
    Lua: "#000080",
    GDScript: "#355570",
    Ruby: "#701516",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Dart: "#00B4AB",
    PHP: "#4F5D95",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Haxe: "#df7900",
  };
  return colors[language || ""] || "#8b949e";
}

/**
 * Format a date to relative time using date-fns (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  return getRelativeTime(date);
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Genre emoji mapping
 */
export function getGenreEmoji(genre: string): string {
  const emojis: Record<string, string> = {
    action: "🎮",
    adventure: "🗺️",
    puzzle: "🧩",
    strategy: "♟️",
    rpg: "⚔️",
    simulation: "🏗️",
    sports: "⚽",
    racing: "🏎️",
    shooter: "🔫",
    platformer: "🏃",
    horror: "👻",
    sandbox: "🏖️",
    survival: "🏕️",
    mmo: "🌐",
    card: "🃏",
    board: "🎲",
    educational: "📚",
    music: "🎵",
    fighting: "🥊",
    arcade: "👾",
  };
  return emojis[genre.toLowerCase()] || "🎮";
}

/**
 * Default game thumbnail emoji based on first letter
 */
export function getDefaultEmoji(name: string): string {
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
  ];
  const index = name.charCodeAt(0) % gameEmojis.length;
  return gameEmojis[index];
}

/**
 * Debounce function for search input
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
