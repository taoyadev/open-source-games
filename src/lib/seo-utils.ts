/**
 * SEO utility functions for canonical URLs, structured data validation, and metadata generation
 */

const DEFAULT_SITE_URL = "https://osgames.dev";

/**
 * Get the canonical URL for a page
 * Handles pagination, search parameters, and trailing slashes
 */
export function getCanonicalUrl(
  path: string,
  searchParams?: {
    page?: number;
    query?: string;
    [key: string]: string | number | undefined;
  },
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  // Remove trailing slash except for root
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");

  // Build URL with search parameters
  const url = new URL(cleanPath, siteUrl);

  if (searchParams) {
    // Only include canonical-safe parameters
    if (searchParams.page && searchParams.page > 1) {
      url.searchParams.set("page", String(searchParams.page));
    }
    // Note: We typically exclude search query from canonical for search results
    // to avoid duplicate content issues
  }

  return url.toString();
}

/**
 * Generate pagination meta tags for SEO
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function getPaginationLinks({
  currentPage,
  totalPages,
  basePath,
}: PaginationMeta): {
  prev: string | null;
  next: string | null;
} {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const prev =
    currentPage > 1
      ? `${siteUrl}${basePath}${currentPage > 2 ? `?page=${currentPage - 1}` : ""}`
      : null;
  const next =
    currentPage < totalPages
      ? `${siteUrl}${basePath}?page=${currentPage + 1}`
      : null;

  return { prev, next };
}

/**
 * Generate alternate language links (hreflang)
 */
export interface HrefLangLink {
  hreflang: string;
  href: string;
}

export function generateHrefLangLinks(
  path: string,
  availableLocales: string[] = ["en"],
): HrefLangLink[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const links: HrefLangLink[] = [];

  for (const locale of availableLocales) {
    links.push({
      hreflang: locale,
      href: `${siteUrl}${locale === "en" ? path : `/${locale}${path}`}`,
    });
  }

  // Add x-default for language detection
  if (!availableLocales.includes("x-default")) {
    links.push({
      hreflang: "x-default",
      href: `${siteUrl}${path}`,
    });
  }

  return links;
}

/**
 * Validate and fix Schema.org structured data
 * Ensures required fields are present and adds @id fields
 */
export function validateAndFixSchema(schema: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
  fixed?: Record<string, unknown>;
} {
  const errors: string[] = [];
  const fixed = { ...schema };

  // Check for required @context and @type
  if (!fixed["@context"]) {
    errors.push("Missing @context");
    fixed["@context"] = "https://schema.org";
  }

  if (!fixed["@type"]) {
    errors.push("Missing @type");
  }

  // Add @id if url is present (for disambiguation)
  if (fixed.url && typeof fixed.url === "string" && !fixed["@id"]) {
    fixed["@id"] = fixed.url;
  }

  // Validate specific types
  const type = fixed["@type"];
  if (Array.isArray(type)) {
    for (const t of type) {
      if (typeof t === "string") {
        const validation = validateSchemaType(t, fixed);
        errors.push(...validation);
      }
    }
  } else if (typeof type === "string") {
    const validation = validateSchemaType(type, fixed);
    errors.push(...validation);
  }

  return {
    valid: errors.length === 0,
    errors,
    fixed: errors.length > 0 ? fixed : undefined,
  };
}

function validateSchemaType(
  type: string,
  schema: Record<string, unknown>,
): string[] {
  const errors: string[] = [];

  switch (type) {
    case "VideoGame":
    case "SoftwareApplication":
      if (!schema.name) errors.push("VideoGame requires 'name'");
      if (!schema.url) errors.push("VideoGame requires 'url'");
      break;

    case "BreadcrumbList":
      if (!schema.itemListElement) {
        errors.push("BreadcrumbList requires 'itemListElement'");
      } else if (Array.isArray(schema.itemListElement)) {
        schema.itemListElement.forEach((item: unknown, index: number) => {
          if (
            !item ||
            typeof item !== "object" ||
            !("@type" in item) ||
            item["@type"] !== "ListItem"
          ) {
            errors.push(`BreadcrumbList item ${index} is not a ListItem`);
          }
        });
      }
      break;

    case "CollectionPage":
      if (!schema.name) errors.push("CollectionPage requires 'name'");
      break;
  }

  return errors;
}

/**
 * Extract clean text content for SEO meta descriptions
 * Strips HTML tags and limits length
 */
export function extractMetaDescription(
  content: string,
  maxLength: number = 160,
): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, " ");

  // Decode HTML entities
  const decoded = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Truncate to max length with ellipsis
  if (decoded.length <= maxLength) return decoded.trim();

  // Find last complete word within limit
  const truncated = decoded.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0
    ? truncated.slice(0, lastSpace).trim() + "..."
    : truncated.trim() + "...";
}

/**
 * Generate robots meta for different page types
 */
export type RobotsConfig = {
  index: boolean;
  follow: boolean;
  maxImagePreview?: "none" | "standard" | "large";
  maxSnippet?: number;
  maxVideoPreview?: number;
};

export function getPageRobots(
  pageType: "page" | "search" | "category" | "game",
): RobotsConfig {
  switch (pageType) {
    case "search":
      // Search results can be indexed but with restrictions
      return {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
      };
    case "category":
      return {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
      };
    case "game":
      return {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
      };
    default:
      return {
        index: true,
        follow: true,
        maxImagePreview: "large",
        maxSnippet: -1,
      };
  }
}

/**
 * Generate structured data script tag content
 */
export function createStructuredDataScript(
  schemas: Array<Record<string, unknown>>,
): string {
  // Validate and fix each schema
  const validatedSchemas = schemas.map((schema) => {
    const { fixed } = validateAndFixSchema(schema);
    return fixed || schema;
  });

  return JSON.stringify(validatedSchemas);
}

/**
 * Parse user agent for SEO analytics (simplified)
 */
export function getUserDeviceType(
  userAgent: string,
): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();

  if (
    /mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(
      ua,
    )
  ) {
    return "mobile";
  }

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }

  return "desktop";
}
