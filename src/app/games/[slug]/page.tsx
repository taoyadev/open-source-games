import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createDatabase } from "@/db";
import { getGameBySlugFromDb, getRelatedGamesFromDb } from "@/lib/db-queries";
import { getGameBySlug, getRelatedGames } from "@/lib/data";
import {
  generateGameSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/schema";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { getSiteUrl } from "@/lib/utils";
import {
  GameHeader,
  GameStats,
  GameReview,
  ScreenshotCarousel,
  RelatedGames,
  AffiliateSection,
  InstallGuide,
} from "@/components/GameDetail";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedGamesSkeleton } from "@/components/ui/Skeleton";
import type { Game } from "@/db/schema";

export const runtime = "edge";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

// Enable ISR for better performance - revalidate every 24 hours
// Note: Do NOT use force-dynamic with revalidate as they conflict
export const revalidate = 86400;

async function loadGame(slug: string): Promise<Game | null> {
  const ctx = getOptionalRequestContext();
  if (ctx?.env?.DB) {
    const db = createDatabase(ctx.env.DB);
    return getGameBySlugFromDb(db, slug);
  }

  return getGameBySlug(slug);
}

async function loadRelatedGames(game: Game, limit: number): Promise<Game[]> {
  const ctx = getOptionalRequestContext();
  if (ctx?.env?.DB) {
    const db = createDatabase(ctx.env.DB);
    return getRelatedGamesFromDb(db, game, limit);
  }

  return getRelatedGames(game, limit);
}

/**
 * Generate metadata for SEO
 * Includes Open Graph, Twitter cards, and canonical URL
 */
export async function generateMetadata({
  params,
}: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await loadGame(slug);

  if (!game) {
    return {
      title: "Game Not Found | Open Source Games",
      description: "The requested game could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const gameUrl = `${siteUrl}/games/${game.slug}`;
  const title =
    game.metaTitle || `${game.title} - Open Source Game | Free Download`;
  const description =
    game.metaDescription ||
    game.description ||
    `Download ${game.title}, a free open-source game. ${game.language ? `Built with ${game.language}.` : ""} ${game.stars} GitHub stars.`;

  return {
    title,
    description,
    keywords: [
      game.title,
      "open source game",
      "free game",
      game.language || "",
      ...(game.topics || []),
      "download",
      "github",
    ].filter(Boolean),
    authors: [{ name: game.repoUrl.split("/")[3] }],
    openGraph: {
      type: "website",
      url: gameUrl,
      title,
      description,
      siteName: "Open Source Games",
      images: game.thumbnailUrl
        ? [
            {
              url: `${siteUrl}/games/${game.slug}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: game.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: game.thumbnailUrl
        ? [`${siteUrl}/games/${game.slug}/opengraph-image`]
        : undefined,
    },
    alternates: {
      canonical: gameUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Async component for loading related games
 * Wrapped in Suspense for non-blocking render
 */
async function RelatedGamesLoader({
  game,
  limit,
}: {
  game: Game;
  limit: number;
}) {
  const relatedGames = await loadRelatedGames(game, limit);

  if (relatedGames.length === 0) {
    return null;
  }

  return <RelatedGames games={relatedGames} currentGameTitle={game.title} />;
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = await loadGame(slug);

  if (!game) {
    notFound();
  }

  // Generate Schema.org structured data
  const gameSchema = generateGameSchema(game);
  const breadcrumbSchema = generateBreadcrumbSchema(game);

  // Generate FAQ schema for structured data
  const faqs = generateGameFAQs(game);
  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([gameSchema, breadcrumbSchema, faqSchema]),
        }}
      />

      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <Breadcrumb
              items={[
                { name: "Games", href: "/games" },
                { name: game.title, current: true },
              ]}
            />
          </nav>

          {/* Game header with title, badges, and actions */}
          <GameHeader game={game} />

          {/* Main content grid */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left column - main content */}
            <div className="space-y-10">
              {/* Screenshots carousel */}
              <section aria-label="Screenshots">
                <ScreenshotCarousel game={game} />
              </section>

              {/* AI-generated review */}
              <GameReview game={game} />

              {/* Installation guide */}
              <InstallGuide game={game} />

              {/* Affiliate recommendations */}
              <AffiliateSection game={game} />
            </div>

            {/* Right column - sidebar */}
            <div className="space-y-6">
              {/* GitHub stats */}
              <GameStats game={game} />

              {/* Ad placeholder for future monetization */}
              <div
                className="rounded-xl border border-dashed border-zinc-300 bg-zinc-100 p-6 text-center dark:border-zinc-700 dark:bg-zinc-800"
                aria-hidden="true"
              >
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Ad Space
                </p>
              </div>
            </div>
          </div>

          {/* Related games - wrapped in Suspense for non-blocking render */}
          <div className="mt-16">
            <Suspense fallback={<RelatedGamesSkeleton />}>
              <RelatedGamesLoader game={game} limit={4} />
            </Suspense>
          </div>

          {/* FAQ Section for SEO */}
          <section className="mt-16" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Frequently Asked Questions
            </h2>

            <dl className="mt-6 space-y-6">
              <div>
                <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Is {game.title} free to play?
                </dt>
                <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Yes, {game.title} is completely free and open source. You can
                  download it from GitHub and play without any cost. The source
                  code is available under the {game.license || "open source"}{" "}
                  license.
                </dd>
              </div>

              <div>
                <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  What platforms does {game.title} support?
                </dt>
                <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {game.platforms && game.platforms.length > 0
                    ? `${game.title} is available for ${game.platforms.join(", ")}.`
                    : `${game.title} is cross-platform and can be built for most operating systems.`}
                </dd>
              </div>

              <div>
                <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  How do I install {game.title}?
                </dt>
                <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                  You can download pre-built binaries from the GitHub Releases
                  page, or build from source. Check the installation guide above
                  for detailed instructions.
                </dd>
              </div>

              {game.isMultiplayer && (
                <div>
                  <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Can I play {game.title} with friends?
                  </dt>
                  <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Yes, {game.title} supports multiplayer. You can host your
                    own server or join existing community servers.
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  How can I contribute to {game.title}?
                </dt>
                <dd className="mt-2 text-zinc-600 dark:text-zinc-400">
                  You can contribute by reporting bugs, suggesting features, or
                  submitting pull requests on{" "}
                  <a
                    href={game.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    GitHub
                  </a>
                  . Check the project&apos;s contributing guidelines for more
                  information.
                </dd>
              </div>
            </dl>
          </section>
        </main>
      </div>
    </>
  );
}

/**
 * Generate FAQ items for a game
 * Used for both the FAQ section and structured data
 */
function generateGameFAQs(
  game: Game,
): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [
    {
      question: `Is ${game.title} free to play?`,
      answer: `Yes, ${game.title} is completely free and open source. You can download it from GitHub and play without any cost. The source code is available under the ${game.license || "open source"} license.`,
    },
    {
      question: `What platforms does ${game.title} support?`,
      answer:
        game.platforms && game.platforms.length > 0
          ? `${game.title} is available for ${game.platforms.join(", ")}.`
          : `${game.title} is cross-platform and can be built for most operating systems.`,
    },
    {
      question: `How do I install ${game.title}?`,
      answer:
        "You can download pre-built binaries from the GitHub Releases page, or build from source. Check the installation guide above for detailed instructions.",
    },
    {
      question: `How can I contribute to ${game.title}?`,
      answer:
        "You can contribute by reporting bugs, suggesting features, or submitting pull requests on GitHub. Check the project's contributing guidelines for more information.",
    },
  ];

  if (game.isMultiplayer) {
    faqs.splice(3, 0, {
      question: `Can I play ${game.title} with friends?`,
      answer: `Yes, ${game.title} supports multiplayer. You can host your own server or join existing community servers.`,
    });
  }

  return faqs;
}
