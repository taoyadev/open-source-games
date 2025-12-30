import { describe, it, expect } from "vitest";
import {
  parseSortParams,
  successResponse,
  errorResponse,
  errors,
  getRateLimitHeaders,
  isNonEmptyString,
  isValidSlug,
  cacheControl,
  getCorsHeaders,
} from "@/lib/api-utils";

describe("parseSortParams", () => {
  it("should return default sort when no params provided", () => {
    // Arrange
    const searchParams = new URLSearchParams();

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.field).toBe("stars");
    expect(result.order).toBe("desc");
  });

  it("should parse sort field", () => {
    // Arrange
    const searchParams = new URLSearchParams("sort=lastCommit");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.field).toBe("lastCommit");
  });

  it("should parse order parameter", () => {
    // Arrange
    const searchParams = new URLSearchParams("sort=stars&order=asc");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.order).toBe("asc");
  });

  it("should parse -prefix for descending order", () => {
    // Arrange
    const searchParams = new URLSearchParams("sort=-createdAt");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.field).toBe("createdAt");
    expect(result.order).toBe("desc");
  });

  it("should parse +prefix for ascending order", () => {
    // Arrange - note: URLSearchParams may convert + to space, so use %2B for literal +
    const searchParams = new URLSearchParams("sort=%2Btitle");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.field).toBe("title");
    expect(result.order).toBe("asc");
  });

  it("should fall back to stars for invalid sort field", () => {
    // Arrange
    const searchParams = new URLSearchParams("sort=invalidField");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.field).toBe("stars");
  });

  it("should accept all valid sort fields", () => {
    const validFields = [
      "stars",
      "lastCommit",
      "createdAt",
      "title",
      "downloadCount",
    ];

    validFields.forEach((field) => {
      const searchParams = new URLSearchParams(`sort=${field}`);
      const result = parseSortParams(searchParams);
      expect(result.field).toBe(field);
    });
  });

  it("should default order to desc for invalid order value", () => {
    // Arrange
    const searchParams = new URLSearchParams("sort=stars&order=invalid");

    // Act
    const result = parseSortParams(searchParams);

    // Assert
    expect(result.order).toBe("desc");
  });
});

describe("successResponse", () => {
  it("should create response with data", async () => {
    // Arrange
    const data = { games: [{ id: 1, name: "Test" }] };

    // Act
    const response = successResponse(data);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.data).toEqual(data);
  });

  it("should include meta when provided", async () => {
    // Arrange
    const data = { games: [] };
    const meta = { page: 1, pageSize: 20, total: 100, hasMore: true };

    // Act
    const response = successResponse(data, meta);
    const body = await response.json();

    // Assert
    expect(body.meta).toEqual(meta);
  });

  it("should set correct content type", () => {
    // Act
    const response = successResponse({ test: true });

    // Assert
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should set cache control header", () => {
    // Act
    const response = successResponse({ test: true });

    // Assert
    expect(response.headers.get("Cache-Control")).toContain("public");
    expect(response.headers.get("Cache-Control")).toContain("max-age");
  });

  it("should accept custom status code", async () => {
    // Act
    const response = successResponse({ created: true }, undefined, 201);

    // Assert
    expect(response.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("should create error response with code and message", async () => {
    // Act
    const response = errorResponse("TEST_ERROR", "Test error message");
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("TEST_ERROR");
    expect(body.error.message).toBe("Test error message");
  });

  it("should accept custom status code", async () => {
    // Act
    const response = errorResponse("NOT_FOUND", "Resource not found", 404);

    // Assert
    expect(response.status).toBe(404);
  });

  it("should include details when provided", async () => {
    // Arrange
    const details = { field: "email", reason: "invalid format" };

    // Act
    const response = errorResponse(
      "VALIDATION_ERROR",
      "Invalid input",
      400,
      details,
    );
    const body = await response.json();

    // Assert
    expect(body.error.details).toEqual(details);
  });

  it("should set no-store cache control", () => {
    // Act
    const response = errorResponse("ERROR", "Error");

    // Assert
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("errors helpers", () => {
  it("should create badRequest error", async () => {
    // Act
    const response = errors.badRequest("Invalid parameter");
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.error.code).toBe("BAD_REQUEST");
    expect(body.error.message).toBe("Invalid parameter");
  });

  it("should create notFound error", async () => {
    // Act
    const response = errors.notFound("Game");
    const body = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("Game not found");
  });

  it("should create methodNotAllowed error", async () => {
    // Act
    const response = errors.methodNotAllowed(["GET", "POST"]);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(405);
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
    expect(body.error.message).toBe("Allowed methods: GET, POST");
  });

  it("should create tooManyRequests error with Retry-After header", async () => {
    // Act
    const response = errors.tooManyRequests(60);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(429);
    expect(body.error.code).toBe("TOO_MANY_REQUESTS");
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("should create internalError with default message", async () => {
    // Act
    const response = errors.internalError();
    const body = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toBe("Internal server error");
  });

  it("should create internalError with custom message", async () => {
    // Act
    const response = errors.internalError("Database connection failed");
    const body = await response.json();

    // Assert
    expect(body.error.message).toBe("Database connection failed");
  });
});

describe("getRateLimitHeaders", () => {
  it("should create headers with rate limit info", () => {
    // Act
    const headers = getRateLimitHeaders(95, 100, 1609459200);

    // Assert
    expect(headers.get("X-RateLimit-Limit")).toBe("100");
    expect(headers.get("X-RateLimit-Remaining")).toBe("95");
    expect(headers.get("X-RateLimit-Reset")).toBe("1609459200");
  });

  it("should handle zero remaining requests", () => {
    // Act
    const headers = getRateLimitHeaders(0, 100, 1609459200);

    // Assert
    expect(headers.get("X-RateLimit-Remaining")).toBe("0");
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

  it("should return false for whitespace-only string", () => {
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString("\t\n")).toBe(false);
  });

  it("should return false for non-string types", () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
    expect(isNonEmptyString([])).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("should return true for valid slugs", () => {
    expect(isValidSlug("game")).toBe(true);
    expect(isValidSlug("my-game")).toBe(true);
    expect(isValidSlug("game-123")).toBe(true);
    expect(isValidSlug("a-b-c-d")).toBe(true);
    expect(isValidSlug("game123")).toBe(true);
  });

  it("should return false for invalid slugs", () => {
    expect(isValidSlug("")).toBe(false);
    expect(isValidSlug("Game")).toBe(false); // uppercase
    expect(isValidSlug("my_game")).toBe(false); // underscore
    expect(isValidSlug("my game")).toBe(false); // space
    expect(isValidSlug("-game")).toBe(false); // starts with hyphen
    expect(isValidSlug("game-")).toBe(false); // ends with hyphen
    expect(isValidSlug("my--game")).toBe(false); // double hyphen
    expect(isValidSlug("game!")).toBe(false); // special character
  });
});

describe("cacheControl", () => {
  it("should have correct short cache values", () => {
    expect(cacheControl.short).toContain("max-age=60");
    expect(cacheControl.short).toContain("stale-while-revalidate=300");
  });

  it("should have correct medium cache values", () => {
    expect(cacheControl.medium).toContain("max-age=300");
    expect(cacheControl.medium).toContain("stale-while-revalidate=1800");
  });

  it("should have correct long cache values", () => {
    expect(cacheControl.long).toContain("max-age=3600");
    expect(cacheControl.long).toContain("stale-while-revalidate=86400");
  });

  it("should have no-store for none", () => {
    expect(cacheControl.none).toBe("no-store");
  });

  it("should have private cache option", () => {
    expect(cacheControl.private).toContain("private");
    expect(cacheControl.private).toContain("max-age=300");
  });
});

describe("getCorsHeaders", () => {
  it("should set origin for allowed origins", () => {
    // Act
    const headers = getCorsHeaders("https://osgames.dev");

    // Assert
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://osgames.dev",
    );
  });

  it("should set origin for localhost", () => {
    // Act
    const headers = getCorsHeaders("http://localhost:3000");

    // Assert
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
  });

  it("should not set origin for disallowed origins", () => {
    // Act
    const headers = getCorsHeaders("https://malicious-site.com");

    // Assert
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("should set allowed methods", () => {
    // Act
    const headers = getCorsHeaders("https://osgames.dev");

    // Assert
    expect(headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("should set allowed headers", () => {
    // Act
    const headers = getCorsHeaders("https://osgames.dev");

    // Assert
    expect(headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
  });

  it("should set max age for preflight", () => {
    // Act
    const headers = getCorsHeaders("https://osgames.dev");

    // Assert
    expect(headers.get("Access-Control-Max-Age")).toBe("86400");
  });

  it("should handle null origin", () => {
    // Act
    const headers = getCorsHeaders(null);

    // Assert
    expect(headers.get("Access-Control-Allow-Origin")).toBeNull();
    // Other headers should still be set
    expect(headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });
});
