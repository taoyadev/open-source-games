import { Star, GitFork, Download, Calendar, Clock, Scale } from "lucide-react";
import type { Game } from "@/db/schema";
import {
  formatNumber,
  formatDate,
  getRelativeTime,
  starsToRating,
} from "@/lib/utils";

interface GameStatsProps {
  game: Game;
}

export function GameStats({ game }: GameStatsProps) {
  const rating = starsToRating(game.stars);
  const ratingStars = Math.round(rating);

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        GitHub Stats
      </h2>

      <dl className="space-y-4">
        {/* Star rating visual */}
        <div>
          <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Community Rating
          </dt>
          <dd className="mt-1 flex items-center gap-2">
            <div
              className="flex"
              aria-label={`${rating.toFixed(1)} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= ratingStars
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {rating.toFixed(1)}
            </span>
          </dd>
        </div>

        {/* Stars count */}
        <div className="flex items-center justify-between">
          <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Star className="h-4 w-4" aria-hidden="true" />
            Stars
          </dt>
          <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {formatNumber(game.stars)}
          </dd>
        </div>

        {/* Downloads */}
        {game.downloadCount > 0 && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Download className="h-4 w-4" aria-hidden="true" />
              Downloads
            </dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {formatNumber(game.downloadCount)}
            </dd>
          </div>
        )}

        {/* Latest Release */}
        {game.latestRelease && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <GitFork className="h-4 w-4" aria-hidden="true" />
              Version
            </dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {game.latestRelease}
            </dd>
          </div>
        )}

        {/* License */}
        {game.license && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Scale className="h-4 w-4" aria-hidden="true" />
              License
            </dt>
            <dd className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {game.license}
            </dd>
          </div>
        )}

        <hr className="border-zinc-200 dark:border-zinc-700" />

        {/* Created date */}
        {game.createdAt && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Created
            </dt>
            <dd className="text-sm text-zinc-700 dark:text-zinc-300">
              {formatDate(game.createdAt)}
            </dd>
          </div>
        )}

        {/* Last updated */}
        {game.lastCommitAt && (
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Last Update
            </dt>
            <dd className="text-sm text-zinc-700 dark:text-zinc-300">
              {getRelativeTime(game.lastCommitAt)}
            </dd>
          </div>
        )}
      </dl>

      {/* Quick links */}
      <div className="mt-6 space-y-2">
        <a
          href={`${game.repoUrl}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Report Issue
        </a>
        <a
          href={`${game.repoUrl}/wiki`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Documentation
        </a>
      </div>
    </aside>
  );
}
