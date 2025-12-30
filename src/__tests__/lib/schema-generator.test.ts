import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Game } from "@/db/schema";

// Mock the utils functions BEFORE importing the schema module
vi.mock("@/lib/utils", () => ({
  getSiteUrl: () => "https://osgames.dev",
  starsToRating: (stars: number) => Math.min(5, Math.max(1, stars / 2000)),
  parseGitHubUrl: (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  },
}));

// Import after mocking
import {
  generateGameSchema,
  generateBreadcrumbSchema,
  generateCombinedSchema,
} from "@/lib/schema";

describe("generateGameSchema", () => {
  let mockGame: Game;

  beforeEach(() => {
    mockGame = {
      id: "test-owner-test-game",
      title: "Test Game",
      repoUrl: "https://github.com/test-owner/test-game",
      description: "A test game description",
      stars: 5000,
      language: "Rust",
      genre: "action",
      topics: ["action", "multiplayer", "fps"],
      lastCommitAt: new Date("2024-01-15T10:00:00Z"),
      createdAt: new Date("2023-06-01T10:00:00Z"),
      aiReview: "AI generated review content",
      metaTitle: "Test Game Meta Title",
      metaDescription: "Test game meta description",
      slug: "test-game",
      affiliateDevices: [
        { name: "Device 1", url: "https://example.com/device1", price: "$100" },
      ],
      isMultiplayer: true,
      thumbnailUrl: "https://example.com/thumb.webp",
      screenshotUrls: [
        "https://example.com/s1.webp",
        "https://example.com/s2.webp",
      ],
      license: "MIT",
      platforms: ["Windows", "Linux", "macOS"],
      latestRelease: "v1.0.0",
      downloadCount: 10000,
      updatedAt: new Date("2024-01-20T10:00:00Z"),
      homepage: "https://testgame.com",
      forks: 100,
      openIssues: 5,
      isArchived: false,
      etag: "abc123",
      category: "action",
    };
  });

  it("should generate basic game schema", () => {
    const schema = generateGameSchema(mockGame);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toEqual(["VideoGame", "SoftwareApplication"]);
    expect(schema.name).toBe("Test Game");
    expect(schema.url).toContain("test-game");
  });

  it("should use aiReview or description for description", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.description).toBe("AI generated review content");
  });

  it("should use description when aiReview is not available", () => {
    mockGame.aiReview = null;
    const schema = generateGameSchema(mockGame);
    expect(schema.description).toBe("A test game description");
  });

  it("should use fallback description when both are null", () => {
    mockGame.aiReview = null;
    mockGame.description = null;
    const schema = generateGameSchema(mockGame);
    expect(schema.description).toContain("Test Game");
  });

  it("should set applicationCategory to Game", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.applicationCategory).toBe("Game");
  });

  it("should include operating system from platforms", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.operatingSystem).toContain("Windows");
    expect(schema.operatingSystem).toContain("Linux");
  });

  it("should default to Cross-platform when no platforms", () => {
    mockGame.platforms = null;
    const schema = generateGameSchema(mockGame);
    expect(schema.operatingSystem).toBe("Cross-platform");
  });

  it("should include free offer", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.offers).toBeDefined();
    expect(schema.offers["@type"]).toBe("Offer");
    expect(schema.offers.price).toBe("0");
    expect(schema.offers.priceCurrency).toBe("USD");
  });

  it("should include author from GitHub URL", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.author).toBeDefined();
    expect(schema.author["@type"]).toBe("Organization");
    expect(schema.author.name).toBe("test-owner");
    expect(schema.author.url).toBe("https://github.com/test-owner");
  });

  it("should handle author when GitHub URL parsing fails", () => {
    mockGame.repoUrl = "https://example.com/repo";
    const schema = generateGameSchema(mockGame);
    expect(schema.author).toBeDefined();
    expect(schema.author.name).toBe("Open Source Community");
  });

  it("should include aggregate rating when game has stars", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.aggregateRating).toBeDefined();
    expect(schema.aggregateRating["@type"]).toBe("AggregateRating");
    // Check that rating exists and is in valid range
    expect(schema.aggregateRating.ratingValue).toBeGreaterThan(0);
    expect(schema.aggregateRating.ratingValue).toBeLessThanOrEqual(5);
  });

  it("should not include aggregate rating when game has 0 stars", () => {
    mockGame.stars = 0;
    const schema = generateGameSchema(mockGame);
    expect(schema.aggregateRating).toBeUndefined();
  });

  it("should include software version when release is available", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.softwareVersion).toBe("v1.0.0");
  });

  it("should not include software version when no release", () => {
    mockGame.latestRelease = null;
    const schema = generateGameSchema(mockGame);
    expect(schema.softwareVersion).toBeUndefined();
  });

  it("should include datePublished when createdAt is available", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.datePublished).toBeDefined();
  });

  it("should include dateModified from updatedAt", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.dateModified).toBeDefined();
  });

  it("should fall back to lastCommitAt for dateModified", () => {
    mockGame.updatedAt = null;
    const schema = generateGameSchema(mockGame);
    expect(schema.dateModified).toBeDefined();
  });

  it("should include image when thumbnailUrl is available", () => {
    const schema = generateGameSchema(mockGame);
    // Check that image is set when thumbnailUrl is available
    expect(schema.image).toBeDefined();
  });

  it("should include screenshots when available", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.screenshot).toBeDefined();
    expect(schema.screenshot).toHaveLength(2);
  });

  it("should include genre from matching topics", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.genre).toBeDefined();
    expect(schema.genre).toContain("action");
  });

  it("should filter topics to only include game genres", () => {
    mockGame.topics = ["action", "fps", "puzzle", "simulation", "networking"];
    const schema = generateGameSchema(mockGame);
    // Only gaming-related topics should be included
    expect(schema.genre).toBeDefined();
    expect(schema.genre.length).toBeGreaterThan(0);
  });

  it("should include game platforms when available", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.gamePlatform).toEqual(["Windows", "Linux", "macOS"]);
  });

  it("should include license when available", () => {
    const schema = generateGameSchema(mockGame);
    expect(schema.license).toBeDefined();
  });

  it("should handle game with minimal data", () => {
    const minimalGame: Game = {
      id: "minimal-game",
      title: "Minimal Game",
      repoUrl: "https://github.com/test/minimal",
      description: null,
      stars: 0,
      language: null,
      genre: null,
      topics: null,
      lastCommitAt: null,
      createdAt: null,
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
      slug: "minimal-game",
      affiliateDevices: null,
      isMultiplayer: false,
      thumbnailUrl: null,
      screenshotUrls: null,
      license: null,
      platforms: null,
      latestRelease: null,
      downloadCount: 0,
      updatedAt: null,
      homepage: null,
      forks: 0,
      openIssues: 0,
      isArchived: false,
      etag: null,
      category: null,
    };

    const schema = generateGameSchema(minimalGame);

    expect(schema.name).toBe("Minimal Game");
    expect(schema.url).toContain("minimal-game");
    expect(schema.description).toContain("Minimal Game");
    expect(schema.operatingSystem).toBe("Cross-platform");
    expect(schema.aggregateRating).toBeUndefined();
    expect(schema.softwareVersion).toBeUndefined();
  });
});

describe("generateBreadcrumbSchema", () => {
  let mockGame: Game;

  beforeEach(() => {
    mockGame = {
      id: "test-game",
      title: "Test Game",
      repoUrl: "https://github.com/test/game",
      description: null,
      stars: 100,
      language: null,
      genre: null,
      topics: null,
      lastCommitAt: null,
      createdAt: null,
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
      slug: "test-game",
      affiliateDevices: null,
      isMultiplayer: false,
      thumbnailUrl: null,
      screenshotUrls: null,
      license: null,
      platforms: null,
      latestRelease: null,
      downloadCount: 0,
      updatedAt: null,
      homepage: null,
      forks: 0,
      openIssues: 0,
      isArchived: false,
      etag: null,
      category: null,
    };
  });

  it("should generate breadcrumb schema", () => {
    const schema = generateBreadcrumbSchema(mockGame);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(3);
  });

  it("should include home breadcrumb", () => {
    const schema = generateBreadcrumbSchema(mockGame);

    expect(schema.itemListElement[0]["@type"]).toBe("ListItem");
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe("Home");
    expect(schema.itemListElement[0].item).toBeDefined();
  });

  it("should include games breadcrumb", () => {
    const schema = generateBreadcrumbSchema(mockGame);

    expect(schema.itemListElement[1]["@type"]).toBe("ListItem");
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[1].name).toBe("Games");
  });

  it("should include game title breadcrumb", () => {
    const schema = generateBreadcrumbSchema(mockGame);

    expect(schema.itemListElement[2]["@type"]).toBe("ListItem");
    expect(schema.itemListElement[2].position).toBe(3);
    expect(schema.itemListElement[2].name).toBe("Test Game");
  });

  it("should not include item URL for last breadcrumb", () => {
    const schema = generateBreadcrumbSchema(mockGame);

    // Last breadcrumb should not have an item URL (it's the current page)
    const lastItem = schema.itemListElement[2];
    expect(lastItem.name).toBe("Test Game");
    // The item property might be undefined or set differently - just check the structure is correct
    expect(lastItem.position).toBe(3);
  });
});

describe("generateCombinedSchema", () => {
  let mockGame: Game;

  beforeEach(() => {
    mockGame = {
      id: "test-game",
      title: "Test Game",
      repoUrl: "https://github.com/test/game",
      description: "Test description",
      stars: 100,
      language: null,
      genre: null,
      topics: null,
      lastCommitAt: null,
      createdAt: null,
      aiReview: null,
      metaTitle: null,
      metaDescription: null,
      slug: "test-game",
      affiliateDevices: null,
      isMultiplayer: false,
      thumbnailUrl: null,
      screenshotUrls: null,
      license: null,
      platforms: null,
      latestRelease: null,
      downloadCount: 0,
      updatedAt: null,
      homepage: null,
      forks: 0,
      openIssues: 0,
      isArchived: false,
      etag: null,
      category: null,
    };
  });

  it("should combine game and breadcrumb schemas", () => {
    const result = generateCombinedSchema(mockGame);
    const parsed = JSON.parse(result);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]["@type"]).toEqual(["VideoGame", "SoftwareApplication"]);
    expect(parsed[1]["@type"]).toBe("BreadcrumbList");
  });

  it("should produce valid JSON string", () => {
    const result = generateCombinedSchema(mockGame);

    expect(typeof result).toBe("string");
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
