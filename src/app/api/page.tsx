import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API | OpenGames",
  description:
    "Public API endpoints for browsing open source games, categories, search, and platform statistics.",
  alternates: { canonical: "/api" },
};

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        OpenGames API
      </h1>
      <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
        These endpoints are optimized for read-only browsing. Responses are
        JSON, include pagination metadata when relevant, and are cached on the
        edge.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            List games
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
            {`GET /api/games?page=1&pageSize=20&sort=stars&order=desc`}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Get a single game
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
            {`GET /api/games/{slug}?include=related`}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Search
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
            {`GET /api/search?q=minecraft&page=1&pageSize=20`}
          </pre>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Categories & stats
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
            {`GET /api/categories
GET /api/stats`}
          </pre>
        </section>
      </div>
    </div>
  );
}
