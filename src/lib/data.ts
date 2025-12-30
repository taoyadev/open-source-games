import type { Game } from "@/db/schema";

/**
 * Mock game data for development
 * In production, this would fetch from D1 database
 */
const mockGames: Game[] = [
  {
    id: "veloren-veloren",
    title: "Veloren",
    slug: "veloren",
    repoUrl: "https://github.com/veloren/veloren",
    description:
      "An open-world, open-source multiplayer voxel RPG inspired by games such as Cube World, Legend of Zelda: Breath of the Wild, Dwarf Fortress and Minecraft.",
    stars: 5200,
    language: "Rust",
    genre: "rpg",
    topics: ["game", "voxel", "rpg", "multiplayer", "rust", "open-world"],
    lastCommitAt: new Date("2024-12-20"),
    createdAt: new Date("2019-01-15"),
    homepage: "https://veloren.net",
    forks: 700,
    openIssues: 500,
    isArchived: false,
    etag: null,
    category: "Role-Playing",
    aiReview: `## Game Type and Gameplay

Veloren is an ambitious open-source voxel RPG that blends the exploration of Breath of the Wild with the blocky aesthetics of Minecraft. Think of it as an open-source alternative to Cube World, but with active development and a thriving community.

## Technical Highlights

Built entirely in Rust, Veloren showcases the language's strengths in game development. The custom Veloren engine handles massive procedurally generated worlds with impressive performance. The ECS architecture enables smooth multiplayer experiences with hundreds of players.

## Target Audience

Perfect for players who enjoy exploration-focused RPGs and want to contribute to or learn from a large open-source project. The learning curve is moderate, suitable for both casual players and those seeking deeper gameplay.

## Comparison with Competitors

Unlike the abandoned Cube World, Veloren receives regular updates. Compared to Minecraft, it offers more RPG mechanics like skill trees and quests. The voxel graphics may deter some players, but the art style has its own charm.

## Recommendation

A must-try for open-source gaming enthusiasts who want a living, breathing world to explore with friends.`,
    metaTitle: "Veloren - Open Source Voxel RPG Game | Free Download",
    metaDescription:
      "Download Veloren, a free open-source multiplayer voxel RPG. Explore vast worlds, battle creatures, and join a thriving community. Built with Rust.",
    affiliateDevices: null,
    isMultiplayer: true,
    thumbnailUrl: "/images/games/veloren-thumb.webp",
    screenshotUrls: [
      "/images/games/veloren-1.webp",
      "/images/games/veloren-2.webp",
      "/images/games/veloren-3.webp",
    ],
    license: "GPL-3.0",
    platforms: ["Windows", "Linux", "macOS"],
    latestRelease: "0.16.0",
    downloadCount: 150000,
    updatedAt: new Date("2024-12-20"),
  },
  {
    id: "minetest-minetest",
    title: "Minetest",
    slug: "minetest",
    repoUrl: "https://github.com/minetest/minetest",
    description:
      "An open source voxel game engine. Play one of our many games, mod a game to your liking, make your own game, or play on a multiplayer server.",
    stars: 10200,
    language: "C++",
    genre: "sandbox",
    topics: [
      "game-engine",
      "voxel",
      "sandbox",
      "multiplayer",
      "moddable",
      "lua",
    ],
    lastCommitAt: new Date("2024-12-22"),
    createdAt: new Date("2010-11-28"),
    homepage: "https://www.minetest.net/",
    forks: 2100,
    openIssues: 250,
    isArchived: false,
    etag: null,
    category: "Sandbox",
    aiReview: `## Game Type and Gameplay

Minetest is the open-source answer to Minecraft - a voxel sandbox game engine that's infinitely moddable. It's not just a game; it's a platform for creating voxel-based experiences with Lua scripting.

## Technical Highlights

Written in C++ for performance, Minetest runs on virtually any hardware - from Raspberry Pi to gaming rigs. The Lua modding API is comprehensive, allowing everything from simple texture packs to complete game overhauls. Multiplayer servers can handle hundreds of concurrent players.

## Target Audience

Ideal for educators, modders, and players who value customization over polish. If you've ever wanted to create your own Minecraft-like game without starting from scratch, Minetest is your answer.

## Comparison with Competitors

More flexible than Minecraft but with a steeper learning curve. The base game is minimal - you'll want to install game mods like Mineclone2 for a complete experience. Performance is generally better than Minecraft on low-end hardware.

## Recommendation

The ultimate sandbox for those who want total control over their voxel gaming experience. Perfect for schools and makers.`,
    metaTitle:
      "Minetest - Free Open Source Voxel Game Engine | Minecraft Alternative",
    metaDescription:
      "Minetest is a free, open-source voxel game engine. Create, mod, and play sandbox games. The best Minecraft alternative with Lua scripting support.",
    affiliateDevices: [
      {
        name: "Raspberry Pi 5",
        url: "https://amzn.to/rpi5-example",
        price: "$80",
        description: "Perfect for running Minetest servers",
      },
    ],
    isMultiplayer: true,
    thumbnailUrl: "/images/games/minetest-thumb.webp",
    screenshotUrls: [
      "/images/games/minetest-1.webp",
      "/images/games/minetest-2.webp",
    ],
    license: "LGPL-2.1",
    platforms: ["Windows", "Linux", "macOS", "Android", "FreeBSD"],
    latestRelease: "5.8.0",
    downloadCount: 500000,
    updatedAt: new Date("2024-12-22"),
  },
  {
    id: "endless-sky-endless-sky",
    title: "Endless Sky",
    slug: "endless-sky",
    repoUrl: "https://github.com/endless-sky/endless-sky",
    description:
      "Space exploration, trading, and combat game. A 2D space trading and combat game similar to the classic Escape Velocity series.",
    stars: 5500,
    language: "C++",
    genre: "simulation",
    topics: ["game", "space", "trading", "combat", "2d", "exploration"],
    lastCommitAt: new Date("2024-12-18"),
    createdAt: new Date("2015-07-11"),
    homepage: "https://endless-sky.github.io/",
    forks: 850,
    openIssues: 200,
    isArchived: false,
    etag: null,
    category: "Simulation",
    aiReview: `## Game Type and Gameplay

Endless Sky is a spiritual successor to the classic Escape Velocity series. It's a 2D space exploration game where you captain a starship, trade goods, fight pirates, and uncover the galaxy's mysteries. Think Elite Dangerous, but top-down and completely free.

## Technical Highlights

Built with C++ and SDL2, Endless Sky runs smoothly on modest hardware. The game features a sophisticated economy simulation, dynamic faction relationships, and extensive modding support through JSON data files.

## Target Audience

Perfect for fans of classic space trading games and those who enjoy narrative-driven exploration. The slow pace and text-heavy storytelling may not appeal to action-focused players.

## Comparison with Competitors

More story-focused than Elite Dangerous, more accessible than X4: Foundations. The 2D perspective is both a limitation and a charm. The active modding community has created entire new storylines and ship sets.

## Recommendation

A hidden gem for space sim enthusiasts who appreciate depth over graphics. Hundreds of hours of content, all completely free.`,
    metaTitle: "Endless Sky - Free Open Source Space Trading Game",
    metaDescription:
      "Endless Sky is a free, open-source 2D space trading and combat game. Explore the galaxy, trade goods, and uncover mysteries. Download now.",
    affiliateDevices: null,
    isMultiplayer: false,
    thumbnailUrl: "/images/games/endless-sky-thumb.webp",
    screenshotUrls: ["/images/games/endless-sky-1.webp"],
    license: "GPL-3.0",
    platforms: ["Windows", "Linux", "macOS"],
    latestRelease: "0.10.4",
    downloadCount: 200000,
    updatedAt: new Date("2024-12-18"),
  },
];

export async function getAllGames(): Promise<Game[]> {
  return mockGames;
}

/**
 * Get game by slug
 */
export async function getGameBySlug(slug: string): Promise<Game | null> {
  // In production, this would query D1:
  // const { env } = getRequestContext();
  // const db = drizzle(env.DB);
  // return db.select().from(gamesTable).where(eq(gamesTable.slug, slug)).get();

  return mockGames.find((g) => g.slug === slug) || null;
}

/**
 * Get related games based on topics and language
 */
export async function getRelatedGames(
  game: Game,
  limit: number = 4,
): Promise<Game[]> {
  // In production, this would query D1 with topic matching
  return mockGames.filter((g) => g.id !== game.id).slice(0, limit);
}

/**
 * Get all game slugs for static generation
 */
export async function getAllGameSlugs(): Promise<string[]> {
  // In production, query all slugs from D1
  return mockGames.map((g) => g.slug);
}
