"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/db/schema";

export type HomeData = {
  totalGames: number;
  topStars: number;
  avgStars: number;
  trendingGames: Game[];
  recentlyUpdated: Game[];
};

type StatsResponse = {
  data: {
    totalGames: number;
    topStars: number;
    avgStars: number;
    trendingGames: Game[];
    recentlyUpdated: Game[];
  };
};

export function useHomeData(): HomeData {
  const [data, setData] = useState<HomeData>({
    totalGames: 0,
    topStars: 0,
    avgStars: 0,
    trendingGames: [],
    recentlyUpdated: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const result = (await response.json()) as StatsResponse;
          setData({
            totalGames: result.data.totalGames ?? 0,
            topStars: result.data.topStars ?? 0,
            avgStars: result.data.avgStars ?? 0,
            trendingGames: (result.data.trendingGames ?? []).slice(0, 8),
            recentlyUpdated: (result.data.recentlyUpdated ?? []).slice(0, 8),
          });
        }
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return data;
}

type HomeDataLoaderProps = {
  children: React.ReactNode;
};

export function HomeDataLoader({ children }: HomeDataLoaderProps) {
  const data = useHomeData();

  return (
    <HomeDataContext.Provider value={data}>{children}</HomeDataContext.Provider>
  );
}

import { createContext, useContext } from "react";

const HomeDataContext = createContext<HomeData | null>(null);

export function useHomeDataContext(): HomeData {
  const context = useContext(HomeDataContext);
  if (!context) {
    return {
      totalGames: 0,
      topStars: 0,
      avgStars: 0,
      trendingGames: [],
      recentlyUpdated: [],
    };
  }
  return context;
}
