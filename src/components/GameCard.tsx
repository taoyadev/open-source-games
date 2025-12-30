"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, GitFork, Clock, ExternalLink } from "lucide-react";
import {
  cn,
  formatNumber,
  formatRelativeDate,
  getLanguageColor,
  getDefaultEmoji,
  truncateText,
} from "@/lib/utils";
import { useState } from "react";

export interface Game {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail?: string;
  stars: number;
  forks: number;
  language: string;
  genres: string[];
  lastUpdated: string;
  repoUrl: string;
  demoUrl?: string;
}

interface GameCardProps {
  game: Game;
  className?: string;
}

export function GameCard({ game, className }: GameCardProps) {
  const [imageError, setImageError] = useState(false);
  const fallbackEmoji = getDefaultEmoji(game.name);

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-600 dark:hover:shadow-indigo-900/30",
        className,
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {game.thumbnail && !imageError ? (
          <Image
            src={game.thumbnail}
            alt={game.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-6xl">{fallbackEmoji}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900">
            View Details
            <ExternalLink className="h-4 w-4" />
          </span>
        </div>

        {/* Language badge */}
        <div className="absolute right-2 top-2">
          <span
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-800 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200"
            style={{
              borderLeft: `3px solid ${getLanguageColor(game.language)}`,
            }}
          >
            {game.language}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {game.name}
        </h3>

        {/* Description */}
        <p className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {truncateText(game.description, 100)}
        </p>

        {/* Genres */}
        {game.genres.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {genre}
              </span>
            ))}
            {game.genres.length > 3 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                +{game.genres.length - 3}
              </span>
            )}
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
            {formatRelativeDate(game.lastUpdated)}
          </span>
        </div>
      </div>
    </Link>
  );
}
