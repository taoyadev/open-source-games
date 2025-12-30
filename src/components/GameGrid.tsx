"use client";

import { GameCard, type Game } from "./GameCard";
import { GameCardSkeleton } from "./ui/Skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameGridProps {
  games: Game[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function GameGrid({
  games,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
}: GameGridProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {/* Results Count Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-5 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-20",
          className,
        )}
      >
        <div className="text-6xl">🎮</div>
        <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
          No games found
        </h3>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    pages.push(1);

    if (showEllipsisStart) {
      pages.push("...");
    }

    // Show pages around current
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return (
      <nav
        className="mt-12 flex items-center justify-center gap-2"
        aria-label="Pagination"
      >
        {/* Previous */}
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors",
            currentPage === 1
              ? "cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
              : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) =>
            typeof page === "string" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-zinc-400 dark:text-zinc-600"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  page === currentPage
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "border border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
                )}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors",
            currentPage === totalPages
              ? "cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
              : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    );
  };

  return (
    <div className={className}>
      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing{" "}
          <span className="font-medium text-zinc-900 dark:text-white">
            {games.length}
          </span>{" "}
          games
          {totalPages > 1 && (
            <>
              {" "}
              - Page{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {currentPage}
              </span>{" "}
              of{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {totalPages}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
