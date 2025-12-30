import Link from "next/link";
import Image from "next/image";
import { Star, GitFork, Clock, ExternalLink } from "lucide-react";
import type { Game } from "@/db/schema";
import {
  formatNumber,
  formatRelativeDate,
  getDefaultEmoji,
  getLanguageColor,
  truncateText,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

interface GameListCardProps {
  game: Game;
  className?: string;
}

export function GameListCard({ game, className }: GameListCardProps) {
  const href = game.slug ? `/games/${game.slug}` : game.repoUrl;
  const updatedAt = game.lastCommitAt || game.updatedAt;
  const emoji = getDefaultEmoji(game.title);

  const Card = (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white card-hover hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-600 dark:hover:shadow-indigo-900/30 animate-fade-in",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {game.thumbnailUrl ? (
          <Image
            src={game.thumbnailUrl}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="text-6xl transition-transform duration-500 group-hover:scale-110"
              aria-hidden="true"
            >
              {emoji}
            </span>
          </div>
        )}

        {/* Language badge with internal link */}
        {game.language && (
          <div className="absolute right-2 top-2">
            <Link
              href={`/category/games-written-in-${game.language.toLowerCase().replace(/[#+]/g, "").replace(/\s+/g, "-")}`}
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-800 backdrop-blur-sm transition-transform duration-300 hover:scale-110 group-hover:scale-105 dark:bg-zinc-900/90 dark:text-zinc-200"
              style={{
                borderLeft: `3px solid ${getLanguageColor(game.language)}`,
              }}
            >
              {game.language}
            </Link>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-transform duration-300 group-hover:scale-105">
            View Details
            <ExternalLink className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-zinc-900 transition-colors duration-200 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {game.title}
        </h3>

        <p className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {truncateText(game.description || "Open-source game", 110)}
        </p>

        {/* Tags with internal links */}
        {(game.genre || (game.topics && game.topics.length > 0)) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.genre && (
              <Link
                href={`/category/best-open-source-${game.genre.toLowerCase()}-games`}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 transition-transform duration-200 hover:scale-105 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
              >
                {game.genre}
              </Link>
            )}
            {(game.topics || [])
              .filter((t) => t && t.length <= 20)
              .slice(0, game.genre ? 2 : 3)
              .map((topic) => (
                <Link
                  key={topic}
                  href={`/topic/${encodeURIComponent(topic.toLowerCase())}`}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 transition-transform duration-200 hover:scale-105 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-indigo-900 dark:hover:text-indigo-300"
                >
                  {topic}
                </Link>
              ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-500" />
            {formatNumber(game.stars)}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {formatNumber(game.forks)}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {updatedAt ? formatRelativeDate(updatedAt) : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );

  return href.startsWith("/") ? (
    <Link href={href} aria-label={game.title}>
      {Card}
    </Link>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={game.title}
    >
      {Card}
    </a>
  );
}
