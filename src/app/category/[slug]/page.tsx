/**
 * Dynamic Category Page - pSEO page for each category
 * Features: Dynamic metadata, Schema.org CollectionPage, FAQ section, ISR
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createDatabase } from "@/db";
import { getGames } from "@/lib/db-queries";
import { getAllGames } from "@/lib/data";
import { getCategoryBySlug, type Category } from "@/lib/categories";
import type { Game } from "@/db/schema";
import type { GameFilters } from "@/lib/api-utils";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { getSiteUrl } from "@/lib/utils";
import { FAQSection } from "@/components/FAQSection";
import { GameListCard } from "@/components/GameListCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { generateFAQSchema, generateCollectionPageSchema } from "@/lib/schema";

export const runtime = "edge";
export const revalidate = 43200;
export const dynamic = "force-dynamic";

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | Open Source Games",
    };
  }

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      type: "website",
      url: `/category/${category.slug}`,
      images: [
        {
          url: `/category/${category.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: category.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: category.metaTitle,
      description: category.metaDescription,
      images: [`/category/${category.slug}/opengraph-image`],
    },
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

function categoryToGameFilters(category: Category): GameFilters {
  const topics = [
    ...(category.filter.topics ?? []),
    ...(category.filter.engine ? [category.filter.engine] : []),
    ...(category.filter.alternativeTo ? [category.filter.alternativeTo] : []),
  ].filter(Boolean);

  return {
    languages: category.filter.language
      ? [category.filter.language]
      : undefined,
    topics: topics.length > 0 ? topics : undefined,
    platforms: category.filter.platforms,
    isMultiplayer: category.filter.isMultiplayer,
    minStars: category.filter.minStars,
  };
}

async function getCategoryGames(category: Category): Promise<{
  games: Game[];
  totalCount: number;
}> {
  const pagination = { page: 1, pageSize: 48, offset: 0 };
  const filters = categoryToGameFilters(category);

  const ctx = getOptionalRequestContext();
  const db = ctx?.env?.DB ? createDatabase(ctx.env.DB) : null;

  if (db) {
    const result = await getGames(db, filters, pagination, {
      field: "stars",
      order: "desc",
    });
    return { games: result.games, totalCount: result.total };
  }

  const all = await getAllGames();
  const filtered = filterGamesInMemory(all, filters);
  const sorted = filtered.sort((a, b) => b.stars - a.stars);
  return {
    games: sorted.slice(0, pagination.pageSize),
    totalCount: filtered.length,
  };
}

function filterGamesInMemory(all: Game[], filters: GameFilters): Game[] {
  return all.filter((game) => {
    if (filters.languages?.length) {
      const lang = game.language || "";
      if (!filters.languages.includes(lang)) return false;
    }

    if (filters.minStars !== undefined && game.stars < filters.minStars) {
      return false;
    }

    if (
      filters.isMultiplayer !== undefined &&
      game.isMultiplayer !== filters.isMultiplayer
    ) {
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
      const matches = filters.platforms.some((p) =>
        platformSet.has(p.toLowerCase()),
      );
      if (!matches) return false;
    }

    return true;
  });
}

async function getCategoryContent(category: Category): Promise<string | null> {
  return category.intro ?? null;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { games, totalCount } = await getCategoryGames(category);
  const aiContent = await getCategoryContent(category);
  const siteUrl = getSiteUrl();
  const categoryUrl = `${siteUrl}/category/${category.slug}`;

  // Generate Schema.org structured data with @id fields
  const collectionSchema = generateCollectionPageSchema({
    name: category.title,
    description: category.metaDescription,
    url: categoryUrl,
    items: games.map((g) => ({
      name: g.title,
      url: `${siteUrl}/games/${g.slug}`,
    })),
    totalCount,
  });

  // Generate FAQ schema for category FAQs
  const faqSchema = category.faqs
    ? generateFAQSchema(
        category.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      )
    : null;

  return (
    <div className="bg-zinc-50 dark:bg-black">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema ? [collectionSchema, faqSchema] : [collectionSchema],
          ),
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <Breadcrumb
            items={[
              { name: "Categories", href: "/category" },
              { name: category.title.replace(/ in \d{4}$/, ""), current: true },
            ]}
          />
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {category.title}
          </h1>
          <p className="max-w-3xl text-lg text-zinc-600 dark:text-zinc-400">
            {category.description}
          </p>
          {totalCount > 0 && (
            <p className="mt-2 text-sm text-zinc-500">
              {totalCount} {totalCount === 1 ? "game" : "games"} in this
              category
            </p>
          )}
        </div>

        {/* AI-Generated Intro Content (for SEO) */}
        {aiContent && (
          <section className="prose prose-zinc mb-12 max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: aiContent }} />
          </section>
        )}

        {/* Category-specific intro when no AI content */}
        {!aiContent && (
          <section className="mb-12 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              About {category.title.replace(/ in \d{4}$/, "")}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {category.description} Browse our curated collection of free,
              open-source games. All games feature publicly available source
              code, allowing you to learn, modify, and contribute to their
              development.
            </p>
          </section>
        )}

        {/* Games Grid */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Games
          </h2>

          {games.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {games.map((game) => (
                <GameListCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-6 w-6 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Games Coming Soon
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                We are still populating this category with games. Check back
                soon or explore other categories.
              </p>
              <Link
                href="/category"
                className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
              >
                Browse all categories
              </Link>
            </div>
          )}
        </section>

        {/* Related Categories */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Related Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* These would be dynamically generated based on the current category */}
            <Link
              href="/category/multiplayer-open-source-games"
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Multiplayer Games
            </Link>
            <Link
              href="/category/cross-platform-open-source-games"
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Cross-Platform
            </Link>
            <Link
              href="/category/active-development-games"
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Active Development
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={category.faqs} />

        {/* Bottom CTA */}
        <section className="mt-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Looking for More Games?</h2>
          <p className="mb-6 text-blue-100">
            Browse our complete collection of 2000+ open-source games or explore
            other categories.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/games"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              All Games
            </Link>
            <Link
              href="/category"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
            >
              All Categories
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
