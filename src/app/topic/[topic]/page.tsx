import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDatabase } from "@/db";
import { getGames } from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import type { GameFilters } from "@/lib/api-utils";
import { isNonEmptyString } from "@/lib/api-utils";
import type { Game } from "@/db/schema";
import { GameListCard } from "@/components/GameListCard";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { getSiteUrl } from "@/lib/utils";
import { generateFAQSchema, generateCollectionPageSchema } from "@/lib/schema";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const safeTopic = isNonEmptyString(topic) ? topic : "topic";
  const formattedTopic =
    safeTopic.charAt(0).toUpperCase() + safeTopic.slice(1).replace(/-/g, " ");

  return {
    title: `${formattedTopic} Open Source Games - Free #${safeTopic} Games | OpenGames`,
    description: `Discover the best free and open source ${formattedTopic.toLowerCase()} games. Browse ${safeTopic} tagged games with source code available on GitHub.`,
    alternates: { canonical: `/topic/${safeTopic}` },
    robots: { index: true, follow: true },
    keywords: [
      safeTopic,
      `${safeTopic} games`,
      "open source games",
      "free games",
      "github games",
    ],
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const safeTopic = isNonEmptyString(topic) ? topic.trim() : "";

  if (!safeTopic) {
    notFound();
  }

  const pagination = { page: 1, pageSize: 48, offset: 0 };
  const filters: GameFilters = { topics: [safeTopic] };

  const ctx = getOptionalRequestContext();
  const db = ctx?.env?.DB ? createDatabase(ctx.env.DB) : null;

  let games: Game[] = [];
  let total = 0;

  if (db) {
    const result = await getGames(db, filters, pagination, {
      field: "stars",
      order: "desc",
    });
    games = result.games;
    total = result.total;
  } else {
    const all = await getAllGames();
    const filtered = all.filter((game) => {
      const topicSet = new Set((game.topics || []).map((t) => t.toLowerCase()));
      return topicSet.has(safeTopic.toLowerCase());
    });
    filtered.sort((a, b) => b.stars - a.stars);
    games = filtered.slice(0, pagination.pageSize);
    total = filtered.length;
  }

  // Generate structured data
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/topic/${safeTopic}`;
  const formattedTopic =
    safeTopic.charAt(0).toUpperCase() + safeTopic.slice(1).replace(/-/g, " ");

  // Generate FAQs for the topic
  const faqs = [
    {
      question: `What are the best open source ${formattedTopic.toLowerCase()} games?`,
      answer: `We have curated ${total} open source ${formattedTopic.toLowerCase()} games. These games are free to play, modify, and contribute to. Popular choices include games with high GitHub stars and active development.`,
    },
    {
      question: `Are ${formattedTopic.toLowerCase()} games free to play?`,
      answer: `Yes! All games tagged with #${safeTopic} are open source and completely free. You can download them from GitHub and play without any cost.`,
    },
    {
      question: `Can I contribute to ${formattedTopic.toLowerCase()} game projects?`,
      answer: `Absolutely! Open source games welcome contributions. You can report bugs, suggest features, create art assets, or contribute code. Check each game's GitHub repository for contribution guidelines.`,
    },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const collectionSchema = generateCollectionPageSchema({
    name: `${formattedTopic} Open Source Games`,
    description: `Browse ${total} free and open source games tagged with #${safeTopic}`,
    url: pageUrl,
    items: games.slice(0, 10).map((game) => ({
      name: game.title,
      url: `${siteUrl}/games/${game.slug}`,
    })),
    totalCount: total,
  });

  return (
    <>
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([collectionSchema, faqSchema]),
        }}
      />

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
            <Link
              href="/games"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Games
            </Link>{" "}
            <span aria-hidden="true">/</span>{" "}
            <span className="text-zinc-900 dark:text-zinc-100">
              #{safeTopic}
            </span>
          </nav>

          <header>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              {formattedTopic} Open Source Games
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
              Discover the best free and open source games tagged with #
              {safeTopic}. All games are available on GitHub with source code
              you can study, modify, and contribute to.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {total} {total === 1 ? "game" : "games"} found
            </p>
          </header>

          <section className="mt-8" aria-label="Games list">
            {games.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                  <GameListCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No games found for this topic yet.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
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
            )}
          </section>

          {/* FAQ Section for SEO content and reduced thin content risk */}
          {games.length > 0 && (
            <section className="mt-16" aria-labelledby="faq-heading">
              <h2
                id="faq-heading"
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                Frequently Asked Questions
              </h2>

              <dl className="mt-6 space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Related Categories Section for internal linking */}
          <section className="mt-16" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Explore More Categories
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/category"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                All Categories
              </Link>
              <Link
                href="/trending"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Trending Games
              </Link>
              <Link
                href="/category/multiplayer-open-source-games"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Multiplayer Games
              </Link>
              <Link
                href="/category/browser-playable-open-source-games"
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Browser Games
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
