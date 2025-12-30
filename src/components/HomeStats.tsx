"use client";

import { useHomeDataContext } from "./HomeDataLoader";
import { formatNumber } from "@/lib/utils";

export function HomeStats() {
  const data = useHomeDataContext();

  return (
    <>
      <div>
        <p className="text-3xl font-bold">{formatNumber(data.totalGames)}</p>
        <p className="text-sm text-indigo-100">Games indexed</p>
      </div>
      <div>
        <p className="text-3xl font-bold">{formatNumber(data.topStars)}</p>
        <p className="text-sm text-indigo-100">Top repo stars</p>
      </div>
      <div>
        <p className="text-3xl font-bold">{formatNumber(data.avgStars)}</p>
        <p className="text-sm text-indigo-100">Avg stars</p>
      </div>
    </>
  );
}
