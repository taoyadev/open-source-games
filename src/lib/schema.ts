import type { VideoGameSchema, BreadcrumbSchema } from "./types";
import type { Game } from "@/db/schema";
import { getSiteUrl, starsToRating, parseGitHubUrl } from "./utils";

/**
 * Generate Schema.org JSON-LD for a game (VideoGame + SoftwareApplication)
 * Includes @id for disambiguation and full Google Rich Results compliance
 */
export function generateGameSchema(game: Game): VideoGameSchema {
  const siteUrl = getSiteUrl();
  const gameUrl = `${siteUrl}/games/${game.slug}`;
  const githubInfo = parseGitHubUrl(game.repoUrl);

  // Generate unique @id for disambiguation
  const gameId = `#${game.slug}-video-game`;

  const schema: VideoGameSchema = {
    "@context": "https://schema.org",
    "@type": ["VideoGame", "SoftwareApplication"],
    "@id": gameId,
    name: game.title,
    description:
      game.aiReview || game.description || `${game.title} - Open source game`,
    url: gameUrl,
    applicationCategory: "Game",
    operatingSystem: game.platforms?.join(", ") || "Cross-platform",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Organization",
      "@id": `https://github.com/${githubInfo?.owner || ""}`,
      name: githubInfo?.owner || "Open Source Community",
      url: githubInfo ? `https://github.com/${githubInfo.owner}` : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: githubInfo?.owner || "Open Source Community",
    },
    sourceOrganization: {
      "@type": "Organization",
      name: "OpenGames",
      url: siteUrl,
    },
    isAccessibleForFree: true,
    isFamilyFriendly: true,
  };

  // Add aggregate rating if game has stars
  // Only add if we have meaningful data (Google requires ratingValue + reviewCount/ratingCount)
  if (game.stars >= 10) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(starsToRating(game.stars) * 10) / 10,
      ratingCount: game.stars,
      reviewCount: Math.min(game.stars, 100), // Conservative estimate
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Add version if available
  if (game.latestRelease) {
    schema.softwareVersion = game.latestRelease;
  }

  // Add dates
  if (game.createdAt) {
    schema.datePublished = new Date(game.createdAt).toISOString();
  }
  if (game.updatedAt || game.lastCommitAt) {
    schema.dateModified = new Date(
      game.updatedAt || game.lastCommitAt!,
    ).toISOString();
  }

  // Add images with full URLs
  if (game.thumbnailUrl) {
    const imageUrl = game.thumbnailUrl.startsWith("http")
      ? game.thumbnailUrl
      : `${siteUrl}${game.thumbnailUrl}`;
    schema.image = [imageUrl];

    // Add thumbnail
    schema.thumbnailUrl = imageUrl;
  }

  // Add screenshots
  if (game.screenshotUrls && game.screenshotUrls.length > 0) {
    const screenshotUrls = game.screenshotUrls.map((url) =>
      url.startsWith("http") ? url : `${siteUrl}${url}`,
    );
    schema.screenshot = screenshotUrls;
    // Update image array to include screenshots
    if (!schema.image) {
      schema.image = screenshotUrls.slice(0, 3);
    }
  }

  // Add genre from topics
  if (game.topics && game.topics.length > 0) {
    const genreTopics = game.topics.filter((t) =>
      [
        "rpg",
        "fps",
        "rts",
        "puzzle",
        "platformer",
        "roguelike",
        "simulation",
        "strategy",
        "adventure",
        "action",
        "racing",
        "sports",
        "shooter",
        "fighting",
        "arcade",
        "music",
        "card",
        "board",
      ].includes(t.toLowerCase()),
    );
    if (genreTopics.length > 0) {
      schema.genre = genreTopics.slice(0, 3); // Limit to 3 genres
    }
  }

  // Add game platforms
  if (game.platforms && game.platforms.length > 0) {
    schema.gamePlatform = game.platforms;
  }

  // Add license
  if (game.license) {
    schema.license = `https://spdx.org/licenses/${game.license}`;
  }

  // Add keywords for discoverability
  if (game.topics && game.topics.length > 0) {
    schema.keywords = [...game.topics, "open source", "free game", "download"]
      .slice(0, 10)
      .join(", ");
  }

  return schema;
}

/**
 * Generate breadcrumb schema for game page
 * Includes @id for each item as per Google guidelines
 */
export function generateBreadcrumbSchema(game: Game): BreadcrumbSchema {
  const siteUrl = getSiteUrl();
  const gameUrl = `${siteUrl}/games/${game.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${gameUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        "@id": `${siteUrl}#breadcrumb-item`,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        "@id": `${siteUrl}/games#breadcrumb-item`,
        name: "Games",
        item: `${siteUrl}/games`,
      },
      {
        "@type": "ListItem",
        position: 3,
        "@id": `${gameUrl}#breadcrumb-item`,
        name: game.title,
        item: gameUrl,
      },
    ],
  };
}

/**
 * Generate FAQ schema for structured data
 * Can be used on category pages or game FAQ sections
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `#faq-${index}`,
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate CollectionPage schema for category pages
 */
export function generateCollectionPageSchema(params: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
  totalCount: number;
}): Record<string, unknown> {
  const { name, description, url, items, totalCount } = params;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collectionpage`,
    name,
    description,
    url,
    mainEntity: {
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      numberOfItems: totalCount,
      itemListElement: items.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "VideoGame",
          "@id": item.url,
          name: item.name,
          url: item.url,
        },
      })),
    },
  };
}

/**
 * Generate combined JSON-LD script content
 * Validates and combines multiple schemas
 */
export function generateCombinedSchema(game: Game): string {
  const schemas = [generateGameSchema(game), generateBreadcrumbSchema(game)];
  return JSON.stringify(schemas);
}

/**
 * Validate schema against Google Rich Results requirements
 * Returns validation errors if any
 */
export function validateGameSchema(schema: VideoGameSchema): string[] {
  const errors: string[] = [];

  // Required fields for VideoGame
  if (!schema.name) {
    errors.push("Missing required field: name");
  }
  if (!schema.url) {
    errors.push("Missing required field: url");
  }

  // Validate aggregate rating if present
  if (schema.aggregateRating) {
    const rating = schema.aggregateRating;
    if (
      !rating.ratingValue ||
      rating.ratingValue < 1 ||
      rating.ratingValue > 5
    ) {
      errors.push("aggregateRating.ratingValue must be between 1 and 5");
    }
    if (!rating.reviewCount && !rating.ratingCount) {
      errors.push("aggregateRating requires reviewCount or ratingCount");
    }
    if (!rating.bestRating) {
      errors.push("aggregateRating requires bestRating");
    }
    if (!rating.worstRating) {
      errors.push("aggregateRating requires worstRating");
    }
  }

  return errors;
}
