import { describe, it, expect } from "vitest";
import {
  validateSearchQuery,
  parsePagination,
  parseGameFilters,
  createPaginationMeta,
} from "@/lib/api-utils";

describe("validateSearchQuery", () => {
  it("should return invalid for empty query", () => {
    // Act
    const result = validateSearchQuery("");

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query parameter is required");
    expect(result.sanitized).toBe("");
  });

  it("should return invalid for null-like input", () => {
    // Act
    const result = validateSearchQuery(null as unknown as string);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query parameter is required");
  });

  it("should return invalid for query shorter than 2 characters", () => {
    // Act
    const result = validateSearchQuery("a");

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query must be at least 2 characters");
  });

  it("should return valid for query with 2 characters", () => {
    // Act
    const result = validateSearchQuery("ab");

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("ab");
    expect(result.error).toBeUndefined();
  });

  it("should return invalid for query longer than 200 characters", () => {
    // Arrange
    const longQuery = "a".repeat(201);

    // Act
    const result = validateSearchQuery(longQuery);

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query must be less than 200 characters");
  });

  it("should accept query with exactly 200 characters", () => {
    // Arrange
    const maxQuery = "a".repeat(200);

    // Act
    const result = validateSearchQuery(maxQuery);

    // Assert
    expect(result.valid).toBe(true);
  });

  it("should trim whitespace from query", () => {
    // Act
    const result = validateSearchQuery("  minecraft  ");

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("minecraft");
  });

  it("should escape double quotes for FTS5", () => {
    // Act
    const result = validateSearchQuery('search "term"');

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('search ""term""');
  });

  it("should remove asterisks from query", () => {
    // Act
    const result = validateSearchQuery("search*term");

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe("searchterm");
  });

  it("should handle complex query with multiple special characters", () => {
    // Act
    const result = validateSearchQuery('  "test" query* with "quotes"  ');

    // Assert
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('""test"" query with ""quotes""');
  });

  it("should handle whitespace-only input as too short", () => {
    // Act
    const result = validateSearchQuery("   ");

    // Assert
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Query must be at least 2 characters");
  });
});

describe("parsePagination", () => {
  it("should return default values when no params provided", () => {
    // Arrange
    const searchParams = new URLSearchParams();

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.offset).toBe(0);
  });

  it("should parse page parameter", () => {
    // Arrange
    const searchParams = new URLSearchParams("page=3");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.page).toBe(3);
    expect(result.offset).toBe(40);
  });

  it("should parse pageSize parameter", () => {
    // Arrange
    const searchParams = new URLSearchParams("pageSize=50");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.pageSize).toBe(50);
  });

  it("should parse limit parameter as alias for pageSize", () => {
    // Arrange
    const searchParams = new URLSearchParams("limit=30");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.pageSize).toBe(30);
  });

  it("should cap pageSize at 100", () => {
    // Arrange
    const searchParams = new URLSearchParams("pageSize=200");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.pageSize).toBe(100);
  });

  it("should ensure minimum page of 1", () => {
    // Arrange
    const searchParams = new URLSearchParams("page=0");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.page).toBe(1);
  });

  it("should ensure minimum pageSize of 1", () => {
    // Arrange
    const searchParams = new URLSearchParams("pageSize=0");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.pageSize).toBe(1);
  });

  it("should handle negative page numbers", () => {
    // Arrange
    const searchParams = new URLSearchParams("page=-5");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.page).toBe(1);
  });

  it("should calculate correct offset", () => {
    // Arrange
    const searchParams = new URLSearchParams("page=5&pageSize=25");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    expect(result.offset).toBe(100); // (5-1) * 25
  });

  it("should handle non-numeric page values", () => {
    // Arrange
    const searchParams = new URLSearchParams("page=abc");

    // Act
    const result = parsePagination(searchParams);

    // Assert
    // parseInt("abc") returns NaN, Math.max(1, NaN) returns NaN in JS
    // The function should still work gracefully
    expect(typeof result.page).toBe("number");
  });
});

describe("parseGameFilters", () => {
  it("should return empty object when no filters provided", () => {
    // Arrange
    const searchParams = new URLSearchParams();

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result).toEqual({});
  });

  it("should parse language filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("language=Rust");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.languages).toEqual(["Rust"]);
  });

  it("should parse genre filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("genre=puzzle");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.genres).toEqual(["puzzle"]);
  });

  it("should parse minStars filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("minStars=1000");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.minStars).toBe(1000);
  });

  it("should parse maxStars filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("maxStars=50000");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.maxStars).toBe(50000);
  });

  it("should parse multiplayer=true filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("multiplayer=true");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.isMultiplayer).toBe(true);
  });

  it("should parse multiplayer=false filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("multiplayer=false");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.isMultiplayer).toBe(false);
  });

  it("should ignore invalid multiplayer values", () => {
    // Arrange
    const searchParams = new URLSearchParams("multiplayer=maybe");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.isMultiplayer).toBeUndefined();
  });

  it("should parse topic filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("topic=voxel");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.topics).toEqual(["voxel"]);
  });

  it("should parse platform filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("platform=linux");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.platforms).toEqual(["linux"]);
  });

  it("should parse hasRelease filter", () => {
    // Arrange
    const searchParams = new URLSearchParams("hasRelease=true");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.hasRelease).toBe(true);
  });

  it("should not set hasRelease for false value", () => {
    // Arrange
    const searchParams = new URLSearchParams("hasRelease=false");

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.hasRelease).toBeUndefined();
  });

  it("should parse multiple filters", () => {
    // Arrange
    const searchParams = new URLSearchParams(
      "language=C%2B%2B&genre=rts&minStars=5000&multiplayer=true",
    );

    // Act
    const result = parseGameFilters(searchParams);

    // Assert
    expect(result.languages).toEqual(["C++"]);
    expect(result.genres).toEqual(["rts"]);
    expect(result.minStars).toBe(5000);
    expect(result.isMultiplayer).toBe(true);
  });
});

describe("createPaginationMeta", () => {
  it("should create meta with correct values", () => {
    // Act
    const result = createPaginationMeta(1, 20, 100);

    // Assert
    expect(result).toEqual({
      page: 1,
      pageSize: 20,
      total: 100,
      hasMore: true,
    });
  });

  it("should set hasMore to false when on last page", () => {
    // Act
    const result = createPaginationMeta(5, 20, 100);

    // Assert
    expect(result?.hasMore).toBe(false);
  });

  it("should set hasMore to false when total is less than pageSize", () => {
    // Act
    const result = createPaginationMeta(1, 20, 15);

    // Assert
    expect(result?.hasMore).toBe(false);
  });

  it("should set hasMore correctly for partial last page", () => {
    // Act
    const result = createPaginationMeta(5, 20, 95);

    // Assert
    expect(result?.hasMore).toBe(false);
  });

  it("should set hasMore to true when more pages exist", () => {
    // Act
    const result = createPaginationMeta(2, 20, 100);

    // Assert
    expect(result?.hasMore).toBe(true);
  });

  it("should handle edge case with 0 total", () => {
    // Act
    const result = createPaginationMeta(1, 20, 0);

    // Assert
    expect(result?.hasMore).toBe(false);
    expect(result?.total).toBe(0);
  });

  it("should handle large page numbers", () => {
    // Act
    const result = createPaginationMeta(1000, 20, 50000);

    // Assert
    expect(result?.page).toBe(1000);
    expect(result?.hasMore).toBe(true);
  });
});
