import { Star, GitFork, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Game } from "@/db/schema";
import { formatNumber, getLanguageColor } from "@/lib/utils";

interface GameHeaderProps {
  game: Game;
}

export function GameHeader({ game }: GameHeaderProps) {
  return (
    <header className="border-b border-zinc-200 pb-8 dark:border-zinc-800">
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link
              href="/"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/games"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Games
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span
              className="text-zinc-900 dark:text-zinc-100"
              aria-current="page"
            >
              {game.title}
            </span>
          </li>
        </ol>
      </nav>

      {/* Title and primary info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
            {game.title}
          </h1>

          {/* Short description */}
          <p className="mt-3 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            {game.description}
          </p>

          {/* Meta badges */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Stars */}
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>{formatNumber(game.stars)} stars</span>
            </div>

            {/* Language - linked to category */}
            {game.language && (
              <Link
                href={`/category/games-written-in-${game.language.toLowerCase().replace(/[#+]/g, "").replace(/\s+/g, "-")}`}
                className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(game.language) }}
                  aria-hidden="true"
                />
                <span>{game.language}</span>
              </Link>
            )}

            {/* License */}
            {game.license && (
              <div className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {game.license}
              </div>
            )}

            {/* Multiplayer badge - linked to category */}
            {game.isMultiplayer && (
              <Link
                href="/category/multiplayer-open-source-games"
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                Multiplayer
              </Link>
            )}
          </div>

          {/* Platforms - linked to category pages */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {game.platforms.map((platform) => (
                <Link
                  key={platform}
                  href={`/category/lightweight-games-for-${platform.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                >
                  {platform}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 md:items-end">
          <a
            href={`${game.repoUrl}/releases/latest`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Download
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href={game.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <GitFork className="h-4 w-4" aria-hidden="true" />
            View on GitHub
          </a>

          {/* Version info */}
          {game.latestRelease && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Latest: v{game.latestRelease}
            </p>
          )}
        </div>
      </div>

      {/* Topics - linked to topic pages */}
      {game.topics && game.topics.length > 0 && (
        <div className="mt-6">
          <h2 className="sr-only">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {game.topics.map((topic) => (
              <Link
                key={topic}
                href={`/topic/${encodeURIComponent(topic.toLowerCase())}`}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                #{topic}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
