/**
 * Category Index Page - Lists all pSEO category pages
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesByType, TOTAL_CATEGORIES } from "@/lib/categories";
import { CategoryCard } from "@/components/CategoryCard";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse Open Source Games by Category | Open Source Games",
  description: `Explore ${TOTAL_CATEGORIES}+ categories of open-source games. Find games by genre, programming language, game engine, or discover alternatives to commercial games.`,
  openGraph: {
    title: "Browse Open Source Games by Category",
    description: `Explore ${TOTAL_CATEGORIES}+ categories of open-source games. Find games by genre, programming language, game engine, or discover alternatives to commercial games.`,
    type: "website",
    url: "/category",
  },
};

export default function CategoryIndexPage() {
  const categoriesByType = getCategoriesByType();
  const siteUrl = getSiteUrl();

  // Schema.org CollectionPage for the index
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Open Source Games Categories",
    description: `Browse ${TOTAL_CATEGORIES}+ categories of free and open-source games`,
    url: `${siteUrl}/category`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOTAL_CATEGORIES,
      itemListElement: Object.values(categoriesByType).flatMap(
        (categories, typeIndex) =>
          categories.map((cat, catIndex) => ({
            "@type": "ListItem",
            position: typeIndex * 100 + catIndex + 1,
            name: cat.title,
            url: `${siteUrl}/category/${cat.slug}`,
          })),
      ),
    },
  };

  return (
    <div className="bg-zinc-50 dark:bg-black">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Categories</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Browse by Category
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Discover {TOTAL_CATEGORIES}+ curated collections of open-source
            games. Find exactly what you are looking for by genre, programming
            language, game engine, or explore free alternatives to popular
            commercial games.
          </p>
        </div>

        {/* Categories by Type */}
        {Object.entries(categoriesByType).map(([type, categories]) => (
          <section key={type} className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {type}
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-sm font-normal text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {categories.length}
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.slug} category={category} />
              ))}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <section className="mt-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">
            Cannot Find What You Are Looking For?
          </h2>
          <p className="mb-6 text-blue-100">
            Search our database of 2000+ open-source games or browse all games.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/games"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              Browse All Games
            </Link>
            <Link
              href="/games?search=true"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
            >
              Search Games
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
