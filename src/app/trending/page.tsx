import type { Metadata } from "next";
import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";
import { getStats } from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import type { Game } from "@/db/schema";
import { GameListCard } from "@/components/GameListCard";
import { formatNumber } from "@/lib/utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending Open Source Games | OpenGames",
  description:
    "Discover trending open source games based on recent activity and popularity.",
  alternates: { canonical: "/trending" },
};

type TrendingData = {
  totalGames: number;
  trendingGames: Game[];
  recentlyUpdated: Game[];
};

async function getTrendingData(): Promise<TrendingData> {
  const ctx = getOptionalRequestContext();
  const d1 = ctx?.env?.DB ?? null;

  if (d1) {
    const stats = await getStats(d1);
    return {
      totalGames: stats.totalGames,
      trendingGames: stats.trendingGames,
      recentlyUpdated: stats.recentlyUpdated,
    };
  }

  const games = await getAllGames();
  const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const trending = games
    .filter((g) => (g.lastCommitAt?.getTime() ?? 0) >= thirtyDaysAgoMs)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 12);

  const recentlyUpdated = [...games]
    .sort(
      (a, b) =>
        (b.lastCommitAt?.getTime() ?? 0) - (a.lastCommitAt?.getTime() ?? 0),
    )
    .slice(0, 12);

  return { totalGames: games.length, trendingGames: trending, recentlyUpdated };
}

export default async function TrendingPage() {
  const data = await getTrendingData();

  return (
    <div className="bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href="/"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Home
          </Link>{" "}
          <span aria-hidden="true">/</span>{" "}
          <span className="text-zinc-900 dark:text-zinc-100">Trending</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Trending Open Source Games
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Projects updated recently and ranked by GitHub stars.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {formatNumber(data.totalGames)} games indexed
        </p>

        <section className="mt-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Trending (last 30 days)
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.trendingGames.map((game) => (
              <GameListCard key={game.id} game={game} />
            ))}
          </div>

          {data.trendingGames.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No trending games available yet.
              </p>
              <Link
                href="/games"
                className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Browse all games
              </Link>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Recently Updated
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.recentlyUpdated.map((game) => (
              <GameListCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
