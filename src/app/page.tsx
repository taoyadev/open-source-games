import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles, TrendingUp } from "lucide-react";
import { getCategoriesByType, TOTAL_CATEGORIES } from "@/lib/categories";
import { CategoryCard } from "@/components/CategoryCard";
import { HomeDataLoader } from "@/components/HomeDataLoader";
import { HomeStats } from "@/components/HomeStats";
import { TrendingGames } from "@/components/TrendingGames";
import { RecentlyUpdatedGames } from "@/components/RecentlyUpdatedGames";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OpenGames - Discover Open Source Games",
  description:
    "Discover free, open-source games. Browse by genre, language, platform, and explore trending projects from GitHub.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const categoriesByType = getCategoriesByType();
  const featuredCategories = [
    ...categoriesByType["By Genre"].slice(0, 6),
    ...categoriesByType["By Programming Language"].slice(0, 6),
  ];

  return (
    <div className="bg-zinc-50 dark:bg-black">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              SEO-first directory of open source games
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Discover{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                Open Source
              </span>{" "}
              Games
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
              Browse, search, and learn from real game codebases. Find trending
              projects, play for free, and contribute back to the community.
            </p>

            <form
              method="GET"
              action="/games"
              className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
            >
              <label className="sr-only" htmlFor="q">
                Search games
              </label>
              <input
                id="q"
                name="q"
                placeholder="Search by title, description, or topics…"
                className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/70 outline-none ring-0 backdrop-blur focus:border-white/40 focus:ring-4 focus:ring-white/15 sm:h-14"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 sm:h-14"
              >
                Search
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-center">
              <HomeDataLoader>
                <HomeStats />
              </HomeDataLoader>
              <div>
                <p className="text-3xl font-bold">{TOTAL_CATEGORIES}</p>
                <p className="text-sm text-indigo-100">Categories</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/games"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Browse all games
              </Link>
              <Link
                href="/category"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Explore categories
              </Link>
              <Link
                href="/submit"
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              >
                Submit a game
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Trending
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Popular games with recent activity
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Projects updated recently and ranked by GitHub stars.
            </p>
          </div>
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View trending
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <HomeDataLoader>
          <TrendingGames />
        </HomeDataLoader>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Explore by category
            </h2>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Find long-tail collections optimized for discovery: genres,
              languages, engines, platforms, and alternatives.
            </p>
          </div>
          <Link
            href="/category"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Browse categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* Recently updated */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Recently Updated
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Fresh commits, active communities
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Games with the most recent repository activity.
        </p>

        <HomeDataLoader>
          <RecentlyUpdatedGames />
        </HomeDataLoader>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-10 text-white dark:from-zinc-950 dark:to-zinc-900">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Have a game we should include?
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-200">
            Submit a GitHub repository and help the directory grow. We
            prioritize playable projects with clear licensing and active
            communities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Submit a game
            </Link>
            <Link
              href="/games"
              className="rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
            >
              Browse games
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
