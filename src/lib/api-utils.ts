/**
 * API Utilities for Open Source Games Platform
 * Edge runtime compatible helpers for responses, errors, and rate limiting
 */

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a successful JSON response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>["meta"],
  status = 200,
): Response {
  const body: ApiResponse<T> = { data };
  if (meta) body.meta = meta;

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
): Response {
  const body: ApiResponse<null> = {
    error: { code, message, ...(details && { details }) },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Common error responses
 */
export const errors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    errorResponse("BAD_REQUEST", message, 400, details),

  notFound: (resource: string) =>
    errorResponse("NOT_FOUND", `${resource} not found`, 404),

  methodNotAllowed: (allowed: string[]) =>
    errorResponse(
      "METHOD_NOT_ALLOWED",
      `Allowed methods: ${allowed.join(", ")}`,
      405,
    ),

  tooManyRequests: (retryAfter: number) => {
    const response = errorResponse(
      "TOO_MANY_REQUESTS",
      "Rate limit exceeded",
      429,
    );
    response.headers.set("Retry-After", String(retryAfter));
    return response;
  },

  internalError: (message = "Internal server error") =>
    errorResponse("INTERNAL_ERROR", message, 500),
};

// ============================================================================
// Pagination Helpers
// ============================================================================

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePagination(
  searchParams: URLSearchParams,
): PaginationParams {
  const page = Math.max(1, parsePositiveInt(searchParams.get("page"), 1));
  const requestedPageSize = parsePositiveInt(
    searchParams.get("pageSize") ?? searchParams.get("limit"),
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedPageSize));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): NonNullable<ApiResponse<unknown>["meta"]> {
  return {
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  };
}

// ============================================================================
// Filter Helpers
// ============================================================================

export interface GameFilters {
  languages?: string[];
  genres?: string[];
  minStars?: number;
  maxStars?: number;
  isMultiplayer?: boolean;
  topics?: string[];
  platforms?: string[];
  hasRelease?: boolean;
}

/**
 * Parse game filters from URL search params
 */
export function parseGameFilters(searchParams: URLSearchParams): GameFilters {
  const filters: GameFilters = {};

  const parseCsv = (value: string | null): string[] =>
    (value || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

  const languages = parseCsv(searchParams.get("language"));
  if (languages.length > 0) filters.languages = [...new Set(languages)];

  const genres = parseCsv(searchParams.get("genre"));
  if (genres.length > 0) filters.genres = [...new Set(genres)];

  const minStars = searchParams.get("minStars");
  if (minStars) {
    const parsed = Number.parseInt(minStars, 10);
    if (Number.isFinite(parsed)) filters.minStars = parsed;
  }

  const maxStars = searchParams.get("maxStars");
  if (maxStars) {
    const parsed = Number.parseInt(maxStars, 10);
    if (Number.isFinite(parsed)) filters.maxStars = parsed;
  }

  const isMultiplayer = searchParams.get("multiplayer");
  if (isMultiplayer === "true") filters.isMultiplayer = true;
  if (isMultiplayer === "false") filters.isMultiplayer = false;

  const topics = parseCsv(searchParams.get("topic"));
  if (topics.length > 0) filters.topics = [...new Set(topics)];

  const platforms = parseCsv(searchParams.get("platform"));
  if (platforms.length > 0) {
    filters.platforms = [...new Set(platforms)].map((p) => p.toLowerCase());
  }

  const hasRelease = searchParams.get("hasRelease");
  if (hasRelease === "true") filters.hasRelease = true;

  return filters;
}

// ============================================================================
// Sort Helpers
// ============================================================================

export type SortField =
  | "stars"
  | "lastCommit"
  | "createdAt"
  | "title"
  | "downloadCount";
export type SortOrder = "asc" | "desc";

export interface SortParams {
  field: SortField;
  order: SortOrder;
}

const VALID_SORT_FIELDS: SortField[] = [
  "stars",
  "lastCommit",
  "createdAt",
  "title",
  "downloadCount",
];

/**
 * Parse sort parameters from URL search params
 */
export function parseSortParams(searchParams: URLSearchParams): SortParams {
  const sortParam = searchParams.get("sort") || "stars";
  const orderParam = searchParams.get("order") || "desc";

  // Handle format like "-stars" or "+createdAt"
  let field: string = sortParam;
  let order: SortOrder = orderParam === "asc" ? "asc" : "desc";

  if (sortParam.startsWith("-")) {
    field = sortParam.slice(1);
    order = "desc";
  } else if (sortParam.startsWith("+")) {
    field = sortParam.slice(1);
    order = "asc";
  }

  // Validate sort field
  if (!VALID_SORT_FIELDS.includes(field as SortField)) {
    field = "stars";
  }

  return { field: field as SortField, order };
}

// ============================================================================
// Rate Limiting Helpers (using Cloudflare KV or in-memory for dev)
// ============================================================================

/**
 * Simple rate limit check using request headers
 * In production, use Cloudflare Rate Limiting or KV for distributed state
 */
export function getRateLimitHeaders(
  remaining: number,
  limit: number,
  reset: number,
): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(limit));
  headers.set("X-RateLimit-Remaining", String(remaining));
  headers.set("X-RateLimit-Reset", String(reset));
  return headers;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!query || typeof query !== "string") {
    return {
      valid: false,
      sanitized: "",
      error: "Query parameter is required",
    };
  }

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      sanitized: "",
      error: "Query must be at least 2 characters",
    };
  }

  if (trimmed.length > 200) {
    return {
      valid: false,
      sanitized: "",
      error: "Query must be less than 200 characters",
    };
  }

  // Sanitize for FTS5 - escape special characters
  // FTS5 special characters: AND OR NOT NEAR ( ) " *
  const sanitized = trimmed
    .replace(/"/g, '""') // Escape quotes by doubling
    .replace(/\*/g, "") // Remove wildcards (we'll add our own)
    .trim();

  return { valid: true, sanitized };
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// ============================================================================
// Cache Control Helpers
// ============================================================================

export const cacheControl = {
  /** Cache for 1 minute, serve stale for 5 minutes while revalidating */
  short: "public, max-age=60, stale-while-revalidate=300",

  /** Cache for 5 minutes, serve stale for 30 minutes */
  medium: "public, max-age=300, stale-while-revalidate=1800",

  /** Cache for 1 hour, serve stale for 1 day */
  long: "public, max-age=3600, stale-while-revalidate=86400",

  /** No caching */
  none: "no-store",

  /** Private cache only (browser), 5 minutes */
  private: "private, max-age=300",
};

/**
 * Add cache headers to response
 */
export function withCacheHeaders(
  response: Response,
  cacheType: keyof typeof cacheControl,
): Response {
  response.headers.set("Cache-Control", cacheControl[cacheType]);
  return response;
}

// ============================================================================
// CORS Helpers
// ============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || null,
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace("://", "://www.")
    : null,
  "https://osgames.dev",
  "https://www.osgames.dev",
  "http://localhost:3000",
  "http://localhost:8788",
].filter(
  (value): value is string => typeof value === "string" && value.length > 0,
);

/**
 * Get CORS headers for the request
 */
export function getCorsHeaders(origin: string | null): Headers {
  const headers = new Headers();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(request: Request): Response {
  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);
  return new Response(null, { status: 204, headers });
}
