import { describe, it, expect } from "vitest";
import {
  parseSortParams,
  successResponse,
  errorResponse,
  errors,
  parsePagination,
  parseGameFilters,
  createPaginationMeta,
  validateSearchQuery,
  isValidSlug,
  isNonEmptyString,
  cacheControl,
  getCorsHeaders,
  handleCorsPreflightRequest,
  withCacheHeaders,
} from "@/lib/api-utils";

describe("parseSortParams", () => {
  it("should return default sort when no params provided", () => {
    const searchParams = new URLSearchParams();
    const result = parseSortParams(searchParams);
    expect(result.field).toBe("stars");
    expect(result.order).toBe("desc");
  });

  it("should parse sort field", () => {
    const searchParams = new URLSearchParams("sort=lastCommit");
    const result = parseSortParams(searchParams);
    expect(result.field).toBe("lastCommit");
  });

  it("should parse order parameter", () => {
    const searchParams = new URLSearchParams("sort=stars&order=asc");
    const result = parseSortParams(searchParams);
    expect(result.order).toBe("asc");
  });

  it("should parse -prefix for descending order", () => {
    const searchParams = new URLSearchParams("sort=-createdAt");
    const result = parseSortParams(searchParams);
    expect(result.field).toBe("createdAt");
    expect(result.order).toBe("desc");
  });

  it("should parse +prefix for ascending order", () => {
    const searchParams = new URLSearchParams("sort=%2Btitle");
    const result = parseSortParams(searchParams);
    expect(result.field).toBe("title");
    expect(result.order).toBe("asc");
  });

  it("should fall back to stars for invalid sort field", () => {
    const searchParams = new URLSearchParams("sort=invalidField");
    const result = parseSortParams(searchParams);
    expect(result.field).toBe("stars");
  });

  it("should default order to desc for invalid order value", () => {
    const searchParams = new URLSearchParams("sort=stars&order=invalid");
    const result = parseSortParams(searchParams);
    expect(result.order).toBe("desc");
  });
});

describe("parsePagination", () => {
  it("should return default values when no params provided", () => {
    const searchParams = new URLSearchParams();
    const result = parsePagination(searchParams);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.offset).toBe(0);
  });

  it("should parse page parameter", () => {
    const searchParams = new URLSearchParams("page=3");
    const result = parsePagination(searchParams);
    expect(result.page).toBe(3);
    expect(result.offset).toBe(40);
  });

  it("should parse pageSize parameter", () => {
    const searchParams = new URLSearchParams("pageSize=50");
    const result = parsePagination(searchParams);
    expect(result.pageSize).toBe(50);
  });

  it("should parse limit parameter as alias for pageSize", () => {
    const searchParams = new URLSearchParams("limit=30");
    const result = parsePagination(searchParams);
    expect(result.pageSize).toBe(30);
  });

  it("should cap pageSize at MAX_PAGE_SIZE", () => {
    const searchParams = new URLSearchParams("pageSize=200");
    const result = parsePagination(searchParams);
    expect(result.pageSize).toBe(100);
  });

  it("should ensure minimum page of 1", () => {
    const searchParams = new URLSearchParams("page=0");
    const result = parsePagination(searchParams);
    expect(result.page).toBe(1);
  });

  it("should ensure minimum pageSize of 1", () => {
    const searchParams = new URLSearchParams("pageSize=0");
    const result = parsePagination(searchParams);
    expect(result.pageSize).toBe(1);
  });

  it("should handle negative page numbers", () => {
    const searchParams = new URLSearchParams("page=-5");
    const result = parsePagination(searchParams);
    expect(result.page).toBe(1);
  });

  it("should calculate correct offset", () => {
    const searchParams = new URLSearchParams("page=5&pageSize=25");
    const result = parsePagination(searchParams);
    expect(result.offset).toBe(100);
  });
});

describe("parseGameFilters", () => {
  it("should return empty object when no filters provided", () => {
    const searchParams = new URLSearchParams();
    const result = parseGameFilters(searchParams);
    expect(result).toEqual({});
  });

  it("should parse language filter (CSV)", () => {
    const searchParams = new URLSearchParams("language=Rust,Python");
    const result = parseGameFilters(searchParams);
    expect(result.languages).toEqual(["Rust", "Python"]);
  });

  it("should parse genre filter", () => {
    const searchParams = new URLSearchParams("genre=puzzle");
    const result = parseGameFilters(searchParams);
    expect(result.genres).toEqual(["puzzle"]);
  });

  it("should parse minStars filter", () => {
    const searchParams = new URLSearchParams("minStars=1000");
    const result = parseGameFilters(searchParams);
    expect(result.minStars).toBe(1000);
  });

  it("should parse maxStars filter", () => {
    const searchParams = new URLSearchParams("maxStars=50000");
    const result = parseGameFilters(searchParams);
    expect(result.maxStars).toBe(50000);
  });

  it("should parse multiplayer=true filter", () => {
    const searchParams = new URLSearchParams("multiplayer=true");
    const result = parseGameFilters(searchParams);
    expect(result.isMultiplayer).toBe(true);
  });

  it("should parse multiplayer=false filter", () => {
    const searchParams = new URLSearchParams("multiplayer=false");
    const result = parseGameFilters(searchParams);
    expect(result.isMultiplayer).toBe(false);
  });

  it("should parse topic filter", () => {
    const searchParams = new URLSearchParams("topic=voxel");
    const result = parseGameFilters(searchParams);
    expect(result.topics).toEqual(["voxel"]);
  });

  it("should parse platform filter and convert to lowercase", () => {
    const searchParams = new URLSearchParams("platform=Linux,Windows");
    const result = parseGameFilters(searchParams);
    expect(result.platforms).toEqual(["linux", "windows"]);
  });

  it("should parse hasRelease filter", () => {
    const searchParams = new URLSearchParams("hasRelease=true");
    const result = parseGameFilters(searchParams);
    expect(result.hasRelease).toBe(true);
  });

  it("should trim whitespace from CSV values", () => {
    const searchParams = new URLSearchParams("language=Rust, Python ,Go");
    const result = parseGameFilters(searchParams);
    expect(result.languages).toEqual(["Rust", "Python", "Go"]);
  });
});

describe("createPaginationMeta", () => {
  it("should create meta with correct values", () => {
    const result = createPaginationMeta(1, 20, 100);
    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      total: 100,
      hasMore: true,
    });
  });

  it("should set hasMore to false when on last page", () => {
    const result = createPaginationMeta(5, 20, 100);
    expect(result.hasMore).toBe(false);
  });

  it("should set hasMore to false when total is less than pageSize", () => {
    const result = createPaginationMeta(1, 20, 15);
    expect(result.hasMore).toBe(false);
  });

  it("should handle edge case with 0 total", () => {
    const result = createPaginationMeta(1, 20, 0);
    expect(result.hasMore).toBe(false);
    expect(result.total).toBe(0);
  });
});

describe("validateSearchQuery", () => {
  it("should return invalid for empty query", () => {
    const result = validateSearchQuery("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query parameter is required");
  });

  it("should return invalid for query shorter than 2 characters", () => {
    const result = validateSearchQuery("a");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query must be at least 2 characters");
  });

  it("should return valid for query with 2 characters", () => {
    const result = validateSearchQuery("ab");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("ab");
  });

  it("should return invalid for query longer than 200 characters", () => {
    const longQuery = "a".repeat(201);
    const result = validateSearchQuery(longQuery);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query must be less than 200 characters");
  });

  it("should trim whitespace from query", () => {
    const result = validateSearchQuery("  minecraft  ");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("minecraft");
  });

  it("should escape double quotes for FTS5", () => {
    const result = validateSearchQuery('search "term"');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('search ""term""');
  });

  it("should remove asterisks from query", () => {
    const result = validateSearchQuery("search*term");
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("searchterm");
  });
});

describe("isValidSlug", () => {
  it("should return true for valid slugs", () => {
    expect(isValidSlug("game")).toBe(true);
    expect(isValidSlug("my-game")).toBe(true);
    expect(isValidSlug("game-123")).toBe(true);
  });

  it("should return false for invalid slugs", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("Game")).toBe(false);
    expect(isValidSlug("my_game")).toBe(false);
    expect(isValidSlug("my game")).toBe(false);
    expect(isValidSlug("-game")).toBe(false);
    expect(isValidSlug("game-")).toBe(false);
  });
});

describe("isNonEmptyString", () => {
  it("should return true for non-empty strings", () => {
    expect(isNonEmptyString("hello")).toBe(true);
    expect(isNonEmptyString("a")).toBe(true);
    expect(isNonEmptyString(" text ")).toBe(true);
  });

  it("should return false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  it("should return false for non-string types", () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
  });
});

describe("successResponse", () => {
  it("should create response with data", async () => {
    const data = { games: [{ id: 1, name: "Test" }] };
    const response = successResponse(data);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(data);
  });

  it("should include meta when provided", async () => {
    const data = { games: [] };
    const meta = { page: 1, pageSize: 20, total: 100, hasMore: true };
    const response = successResponse(data, meta);
    const body = await response.json();

    expect(body.meta).toEqual(meta);
  });

  it("should set correct content type", () => {
    const response = successResponse({ test: true });
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should accept custom status code", async () => {
    const response = successResponse({ created: true }, undefined, 201);
    expect(response.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("should create error response with code and message", async () => {
    const response = errorResponse("TEST_ERROR", "Test error message");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("TEST_ERROR");
    expect(body.error.message).toBe("Test error message");
  });

  it("should accept custom status code", async () => {
    const response = errorResponse("NOT_FOUND", "Resource not found", 404);
    expect(response.status).toBe(404);
  });

  it("should include details when provided", async () => {
    const details = { field: "email", reason: "invalid format" };
    const response = errorResponse(
      "VALIDATION_ERROR",
      "Invalid input",
      400,
      details,
    );
    const body = await response.json();

    expect(body.error.details).toEqual(details);
  });
});

describe("errors helpers", () => {
  it("should create badRequest error", async () => {
    const response = errors.badRequest("Invalid parameter");
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("should create notFound error", async () => {
    const response = errors.notFound("Game");
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("should create methodNotAllowed error", async () => {
    const response = errors.methodNotAllowed(["GET", "POST"]);
    const body = await response.json();

    expect(response.status).toBe(405);
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("should create tooManyRequests error with Retry-After header", async () => {
    const response = errors.tooManyRequests(60);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("should create internalError with default message", async () => {
    const response = errors.internalError();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});

describe("cacheControl", () => {
  it("should have correct short cache values", () => {
    expect(cacheControl.short).toContain("max-age=60");
    expect(cacheControl.short).toContain("stale-while-revalidate=300");
  });

  it("should have correct medium cache values", () => {
    expect(cacheControl.medium).toContain("max-age=300");
  });

  it("should have correct long cache values", () => {
    expect(cacheControl.long).toContain("max-age=3600");
  });

  it("should have no-store for none", () => {
    expect(cacheControl.none).toBe("no-store");
  });
});

describe("getCorsHeaders", () => {
  it("should set origin for allowed origins", () => {
    const headers = getCorsHeaders("https://osgames.dev");
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://osgames.dev",
    );
  });

  it("should not set origin for disallowed origins", () => {
    const headers = getCorsHeaders("https://malicious-site.com");
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("should set allowed methods", () => {
    const headers = getCorsHeaders("https://osgames.dev");
    expect(headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("should handle null origin", () => {
    const headers = getCorsHeaders(null);
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});

describe("handleCorsPreflightRequest", () => {
  it("should return 204 status", () => {
    const request = new Request("https://example.com", {
      method: "OPTIONS",
      headers: { Origin: "https://osgames.dev" },
    });
    const response = handleCorsPreflightRequest(request);
    expect(response.status).toBe(204);
  });
});

describe("withCacheHeaders", () => {
  it("should add cache headers to response", () => {
    const response = new Response(null);
    const updated = withCacheHeaders(response, "short");
    expect(updated.headers.get("Cache-Control")).toContain("max-age=60");
  });
});
