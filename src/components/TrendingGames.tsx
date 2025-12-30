"use client";

import { useHomeDataContext } from "./HomeDataLoader";
import { GameListCard } from "./GameListCard";

export function TrendingGames() {
  const data = useHomeDataContext();

  return data.trendingGames.length > 0 ? (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.trendingGames.map((game) => (
        <GameListCard key={game.id} game={game} />
      ))}
    </div>
  ) : (
    <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No trending games yet.
      </p>
    </div>
  );
}
