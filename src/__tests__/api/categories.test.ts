import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/categories/route";

// Mock dependencies
vi.mock("@/lib/server/request-context", () => ({
  getOptionalRequestContext: () => null,
}));

vi.mock("@/db", () => ({
  createDatabase: vi.fn(),
}));

vi.mock("@/lib/db-queries", () => ({
  getCategoriesFromDb: vi.fn(() => Promise.resolve([])),
  getCategoriesByType: vi.fn(() => Promise.resolve([])),
}));

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return static categories by default", async () => {
    const request = new Request("https://example.com/api/categories");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.categories).toBeDefined();
    expect(body.data.source).toBe("static");
  });

  it("should return categories with total count", async () => {
    const request = new Request("https://example.com/api/categories");
    const response = await GET(request);
    const body = await response.json();

    expect(body.data.total).toBeDefined();
    expect(body.data.total).toBeGreaterThan(50);
  });

  it("should filter by type parameter", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=genre",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeDefined();
    expect(body.data.total).toBeGreaterThan(0);
  });

  it("should use static source by default", async () => {
    const request = new Request(
      "https://example.com/api/categories?source=static",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(body.data.source).toBe("static");
  });

  it("should set cache headers", async () => {
    const request = new Request("https://example.com/api/categories");
    const response = await GET(request);

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toContain("max-age");
  });

  it("should filter by language type", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=language",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeInstanceOf(Array);
  });

  it("should filter by engine type", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=engine",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeInstanceOf(Array);
  });

  it("should filter by platform type", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=platform",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeInstanceOf(Array);
  });

  it("should filter by alternative type", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=alternative",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeInstanceOf(Array);
  });

  it("should filter by special type", async () => {
    const request = new Request(
      "https://example.com/api/categories?type=special",
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.categories).toBeInstanceOf(Array);
  });
});
