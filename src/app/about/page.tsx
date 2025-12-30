import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About OpenGames | OpenGames",
  description:
    "OpenGames is a searchable directory of open source games, built for players, developers, and curators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        About OpenGames
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        OpenGames turns popular open-source game lists into a fast, searchable
        catalog with dedicated game pages, programmatic SEO categories, and
        developer-friendly metadata.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            For Players
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Find great free games and learn how to install and run them safely.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            For Developers
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Filter by language, engine, and activity to discover codebases worth
            studying and contributing to.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            For Curators
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track trends, releases, and licensing to build trustworthy
            collections.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
        <h2 className="text-xl font-bold">Explore the directory</h2>
        <p className="mt-2 max-w-2xl text-indigo-100">
          Start with the full catalog or browse our long-tail category pages.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/games"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Browse Games
          </Link>
          <Link
            href="/category"
            className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
