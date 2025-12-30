import type { Metadata } from "next";
import Link from "next/link";
import { createDatabase } from "@/db";
import {
  createPaginationMeta,
  parseGameFilters,
  parsePagination,
  parseSortParams,
  validateSearchQuery,
} from "@/lib/api-utils";
import { getGames, searchGames, searchGamesFallback } from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { GameListCard } from "@/components/GameListCard";
import type { Game } from "@/db/schema";

export const runtime = "edge";
export const revalidate = 21600;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Open Source Games | OpenGames",
  description:
    "Browse, filter, and search open source games by language, genre, topic, and platform.",
  alternates: { canonical: "/games" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = toURLSearchParams(await searchParams);

  const query = (sp.get("q") || "").trim();
  const pagination = parsePagination(sp);
  const filters = parseGameFilters(sp);
  const sort = parseSortParams(sp);

  const ctx = getOptionalRequestContext();
  const d1 = ctx?.env?.DB ?? null;
  const db = d1 ? createDatabase(d1) : null;

  let games: Game[] = [];
  let total = 0;
  let queryError: string | null = null;

  if (query.length > 0) {
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      queryError = validation.error || "Invalid query";
    } else if (d1) {
      try {
        const result = await searchGames(
          d1,
          validation.sanitized,
          filters,
          pagination,
        );
        games = result.results as Game[];
        total = result.total;
      } catch (error) {
        if (error instanceof Error && error.message.includes("games_fts")) {
          const result = await searchGamesFallback(
            d1,
            validation.sanitized,
            filters,
            pagination,
          );
          games = result.results as Game[];
          total = result.total;
        } else {
          throw error;
        }
      }
    } else {
      const result = await searchGamesFromMock(
        validation.sanitized,
        filters,
        pagination,
      );
      games = result.games;
      total = result.total;
    }
  } else if (db) {
    const result = await getGames(db, filters, pagination, sort);
    games = result.games;
    total = result.total;
  } else {
    const result = await getGamesFromMock(filters, pagination, sort);
    games = result.games;
    total = result.total;
  }

  const meta = createPaginationMeta(
    pagination.page,
    pagination.pageSize,
    total,
  );
  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || 0) / pagination.pageSize),
  );

  return (
    <div className="bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {query ? "Search Results" : "Browse Games"}
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              {query
                ? `Results for “${query}”`
                : "Discover free, community-driven games with publicly available source code."}
            </p>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {typeof meta.total === "number" ? `${meta.total} games` : null}
          </div>
        </div>

        {/* Filters */}
        <form
          method="GET"
          action="/games"
          className="mt-8 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-6"
        >
          <div className="lg:col-span-2">
            <label className="sr-only" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={sp.get("q") || ""}
              placeholder="Search by title, description, or topics…"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="language">
              Language
            </label>
            <input
              id="language"
              name="language"
              defaultValue={sp.get("language") || ""}
              placeholder="Language (e.g., Rust)"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="genre">
              Genre
            </label>
            <input
              id="genre"
              name="genre"
              defaultValue={sp.get("genre") || ""}
              placeholder="Genre (e.g., rpg)"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="multiplayer">
              Multiplayer
            </label>
            <select
              id="multiplayer"
              name="multiplayer"
              defaultValue={sp.get("multiplayer") || ""}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="">Any</option>
              <option value="true">Multiplayer</option>
              <option value="false">Single-player</option>
            </select>
          </div>

          <div>
            <label className="sr-only" htmlFor="sort">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sp.get("sort") || "stars"}
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="stars">Most Stars</option>
              <option value="lastCommit">Recently Updated</option>
              <option value="createdAt">Newest</option>
              <option value="downloadCount">Most Downloads</option>
              <option value="title">Name</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 lg:col-span-6">
            <input type="hidden" name="page" value="1" />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Apply
            </button>
            <Link
              href="/games"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Reset
            </Link>
          </div>
        </form>

        {queryError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {queryError}
          </div>
        )}

        {/* Results */}
        <div className="mt-8">
          {games.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <div className="text-6xl" aria-hidden="true">
                🎮
              </div>
              <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                No games found
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameListCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex items-center justify-center gap-3"
              aria-label="Pagination"
            >
              <PaginationLink
                label="Previous"
                href={withPage(sp, pagination.page - 1)}
                disabled={pagination.page <= 1}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {pagination.page} of {totalPages}
              </span>
              <PaginationLink
                label="Next"
                href={withPage(sp, pagination.page + 1)}
                disabled={pagination.page >= totalPages}
              />
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function toURLSearchParams(searchParams: SearchParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => sp.append(key, v));
    } else if (value !== undefined) {
      sp.set(key, value);
    }
  }
  return sp;
}

function withPage(current: URLSearchParams, page: number): string {
  const next = new URLSearchParams(current);
  next.set("page", String(Math.max(1, page)));
  const qs = next.toString();
  return qs ? `/games?${qs}` : "/games";
}

function PaginationLink({
  href,
  label,
  disabled,
}: {
  href: string;
  label: string;
  disabled: boolean;
}) {
  return disabled ? (
    <span className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
      {label}
    </span>
  ) : (
    <Link
      href={href}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {label}
    </Link>
  );
}

async function getGamesFromMock(
  filters: Parameters<typeof getGames>[1],
  pagination: Parameters<typeof getGames>[2],
  sort: Parameters<typeof getGames>[3],
): Promise<{ games: Game[]; total: number }> {
  const games = await getAllGames();

  const filtered = games.filter((game) => {
    if (
      filters.languages?.length &&
      !filters.languages.includes(game.language || "")
    ) {
      return false;
    }
    if (filters.genres?.length && !filters.genres.includes(game.genre || "")) {
      return false;
    }
    if (filters.minStars !== undefined && game.stars < filters.minStars) {
      return false;
    }
    if (filters.maxStars !== undefined && game.stars > filters.maxStars) {
      return false;
    }
    if (
      filters.isMultiplayer !== undefined &&
      game.isMultiplayer !== filters.isMultiplayer
    ) {
      return false;
    }
    if (filters.hasRelease && !game.latestRelease) {
      return false;
    }

    if (filters.topics?.length) {
      const topicSet = new Set((game.topics || []).map((t) => t.toLowerCase()));
      const matches = filters.topics.some((t) => topicSet.has(t.toLowerCase()));
      if (!matches) return false;
    }

    if (filters.platforms?.length) {
      const platformSet = new Set(
        (game.platforms || []).map((p) => p.toLowerCase()),
      );
      const matches = filters.platforms.every((p) =>
        platformSet.has(p.toLowerCase()),
      );
      if (!matches) return false;
    }

    return true;
  });

  const dir = sort.order === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    switch (sort.field) {
      case "stars":
        return dir * (a.stars - b.stars);
      case "downloadCount":
        return dir * (a.downloadCount - b.downloadCount);
      case "title":
        return dir * a.title.localeCompare(b.title);
      case "createdAt": {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return dir * (aTime - bTime);
      }
      case "lastCommit": {
        const aTime = a.lastCommitAt ? a.lastCommitAt.getTime() : 0;
        const bTime = b.lastCommitAt ? b.lastCommitAt.getTime() : 0;
        return dir * (aTime - bTime);
      }
      default:
        return 0;
    }
  });

  const total = sorted.length;
  const paged = sorted.slice(
    pagination.offset,
    pagination.offset + pagination.pageSize,
  );

  return { games: paged, total };
}

async function searchGamesFromMock(
  query: string,
  filters: Parameters<typeof getGames>[1],
  pagination: Parameters<typeof getGames>[2],
): Promise<{ games: Game[]; total: number }> {
  const games = await getAllGames();
  const q = query.toLowerCase();

  const filtered = games.filter((game) => {
    const haystack = [
      game.title,
      game.description || "",
      (game.topics || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(q)) return false;

    if (
      filters.languages?.length &&
      !filters.languages.includes(game.language || "")
    ) {
      return false;
    }
    if (filters.genres?.length && !filters.genres.includes(game.genre || "")) {
      return false;
    }
    if (
      filters.isMultiplayer !== undefined &&
      game.isMultiplayer !== filters.isMultiplayer
    ) {
      return false;
    }
    if (filters.platforms?.length) {
      const platformSet = new Set(
        (game.platforms || []).map((p) => p.toLowerCase()),
      );
      const matches = filters.platforms.every((p) =>
        platformSet.has(p.toLowerCase()),
      );
      if (!matches) return false;
    }

    return true;
  });

  const total = filtered.length;
  const paged = filtered
    .sort((a, b) => b.stars - a.stars)
    .slice(pagination.offset, pagination.offset + pagination.pageSize);

  return { games: paged, total };
}
