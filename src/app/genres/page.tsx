/**
 * Genres Index Page - Lists all game genre categories
 * Hub page for SEO with links to individual genre category pages
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/utils";
import {
  Gamepad2,
  Sword,
  Crosshair,
  Flag,
  Puzzle,
  Footprints,
  Skull,
  Plane,
  Car,
  Box,
  Spade,
  Compass,
  Trophy,
  Music,
  GraduationCap,
  Flame,
  Ghost,
  Joystick,
  Swords,
  TowerControl,
} from "lucide-react";

// Genre data with their category slugs
const GENRES = [
  {
    slug: "rpg",
    name: "RPG",
    fullName: "Role-Playing Games",
    description:
      "Character development, story-driven gameplay, and immersive worlds",
    categorySlug: "best-open-source-rpg-games",
    icon: Sword,
  },
  {
    slug: "fps",
    name: "FPS",
    fullName: "First-Person Shooter",
    description: "Fast-paced action from a first-person perspective",
    categorySlug: "best-open-source-fps-games",
    icon: Crosshair,
  },
  {
    slug: "rts",
    name: "RTS",
    fullName: "Real-Time Strategy",
    description: "Base building, resource management, and tactical warfare",
    categorySlug: "best-open-source-rts-games",
    icon: Flag,
  },
  {
    slug: "puzzle",
    name: "Puzzle",
    fullName: "Puzzle Games",
    description: "Brain-teasing challenges and logical problem solving",
    categorySlug: "best-open-source-puzzle-games",
    icon: Puzzle,
  },
  {
    slug: "platformer",
    name: "Platformer",
    fullName: "Platformer Games",
    description: "Jumping, running, and navigating through challenging levels",
    categorySlug: "best-open-source-platformer-games",
    icon: Footprints,
  },
  {
    slug: "roguelike",
    name: "Roguelike",
    fullName: "Roguelike Games",
    description: "Procedural generation, permadeath, and high replayability",
    categorySlug: "best-open-source-roguelike-games",
    icon: Skull,
  },
  {
    slug: "simulation",
    name: "Simulation",
    fullName: "Simulation Games",
    description: "Realistic simulations of real-world activities",
    categorySlug: "best-open-source-simulation-games",
    icon: Plane,
  },
  {
    slug: "strategy",
    name: "Strategy",
    fullName: "Strategy Games",
    description: "Turn-based or real-time tactical decision making",
    categorySlug: "best-open-source-strategy-games",
    icon: Flag,
  },
  {
    slug: "racing",
    name: "Racing",
    fullName: "Racing Games",
    description: "High-speed vehicle racing and competition",
    categorySlug: "best-open-source-racing-games",
    icon: Car,
  },
  {
    slug: "sandbox",
    name: "Sandbox",
    fullName: "Sandbox Games",
    description: "Open-world exploration and creative freedom",
    categorySlug: "best-open-source-sandbox-games",
    icon: Box,
  },
  {
    slug: "card",
    name: "Card",
    fullName: "Card Games",
    description: "Digital card games and deck building",
    categorySlug: "best-open-source-card-games",
    icon: Spade,
  },
  {
    slug: "tower-defense",
    name: "Tower Defense",
    fullName: "Tower Defense Games",
    description: "Strategic placement of defenses to stop waves of enemies",
    categorySlug: "best-open-source-tower-defense-games",
    icon: TowerControl,
  },
  {
    slug: "adventure",
    name: "Adventure",
    fullName: "Adventure Games",
    description: "Story-driven exploration and puzzle solving",
    categorySlug: "best-open-source-adventure-games",
    icon: Compass,
  },
  {
    slug: "survival",
    name: "Survival",
    fullName: "Survival Games",
    description: "Resource gathering, crafting, and staying alive",
    categorySlug: "best-open-source-survival-games",
    icon: Flame,
  },
  {
    slug: "horror",
    name: "Horror",
    fullName: "Horror Games",
    description: "Scary, atmospheric experiences that test your nerves",
    categorySlug: "best-open-source-horror-games",
    icon: Ghost,
  },
  {
    slug: "arcade",
    name: "Arcade",
    fullName: "Arcade Games",
    description: "Classic arcade-style gameplay and high scores",
    categorySlug: "best-open-source-arcade-games",
    icon: Joystick,
  },
  {
    slug: "fighting",
    name: "Fighting",
    fullName: "Fighting Games",
    description: "One-on-one or team combat with complex move sets",
    categorySlug: "best-open-source-fighting-games",
    icon: Swords,
  },
  {
    slug: "sports",
    name: "Sports",
    fullName: "Sports Games",
    description: "Digital versions of real-world sports",
    categorySlug: "best-open-source-sports-games",
    icon: Trophy,
  },
  {
    slug: "music",
    name: "Music",
    fullName: "Music/Rhythm Games",
    description: "Rhythm-based gameplay synchronized with music",
    categorySlug: "best-open-source-music-games",
    icon: Music,
  },
  {
    slug: "educational",
    name: "Educational",
    fullName: "Educational Games",
    description: "Learning through interactive gameplay",
    categorySlug: "best-open-source-educational-games",
    icon: GraduationCap,
  },
];

export const metadata: Metadata = {
  title: "Browse Open Source Games by Genre | Open Source Games",
  description:
    "Explore open-source games by genre. Find RPGs, FPS, puzzle games, platformers, roguelikes, strategy games, and more. All free with source code available.",
  keywords: [
    "open source games",
    "free games by genre",
    "RPG games",
    "FPS games",
    "puzzle games",
    "platformer games",
    "strategy games",
    "roguelike games",
  ],
  openGraph: {
    title: "Browse Open Source Games by Genre",
    description:
      "Explore open-source games by genre. Find RPGs, FPS, puzzle games, platformers, roguelikes, strategy games, and more.",
    type: "website",
    url: "/genres",
  },
  alternates: {
    canonical: "/genres",
  },
};

export default function GenresPage() {
  const siteUrl = getSiteUrl();

  // Schema.org CollectionPage
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Open Source Games by Genre",
    description:
      "Browse open-source games organized by genre including RPGs, FPS, puzzle games, platformers, and more.",
    url: `${siteUrl}/genres`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: GENRES.length,
      itemListElement: GENRES.map((genre, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: genre.fullName,
        url: `${siteUrl}/category/${genre.categorySlug}`,
      })),
    },
  };

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Genres</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Gamepad2 className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Browse Games by Genre
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Explore {GENRES.length} game genres from action-packed shooters to
            relaxing puzzle games. All games are free, open-source, and ready to
            play.
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GENRES.map((genre) => {
            const IconComponent = genre.icon;
            return (
              <Link
                key={genre.slug}
                href={`/category/${genre.categorySlug}`}
                className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                      {genre.fullName}
                    </h2>
                    {genre.name !== genre.fullName.split(" ")[0] && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {genre.name}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-3 line-clamp-2 flex-grow text-sm text-zinc-600 dark:text-zinc-400">
                  {genre.description}
                </p>

                <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  Browse {genre.name} Games
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Related Links */}
        <section className="mt-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">
            Looking for More Ways to Browse?
          </h2>
          <p className="mb-6 text-blue-100">
            Explore games by programming language, game engine, or find
            alternatives to your favorite commercial games.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/languages"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Browse by Language
            </Link>
            <Link
              href="/category"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
            >
              All Categories
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
