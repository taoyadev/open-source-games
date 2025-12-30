import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | OpenGames",
  description:
    "Product updates, launch notes, and guides for discovering and playing open source games.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Blog
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Launch notes and guides are coming soon. In the meantime, explore the
        catalog.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Start exploring
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Browse games, categories, and search by keywords.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/games"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Browse Games
          </Link>
          <Link
            href="/category"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
