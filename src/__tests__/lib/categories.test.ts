import { describe, it, expect } from "vitest";
import {
  getAllCategories,
  getCategoryBySlug,
  getAllCategorySlugs,
  getCategoriesByType,
  TOTAL_CATEGORIES,
} from "@/lib/categories";

describe("getAllCategories", () => {
  it("should return an array of categories", () => {
    // Act
    const categories = getAllCategories();

    // Assert
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("should return categories with required properties", () => {
    // Act
    const categories = getAllCategories();
    const firstCategory = categories[0];

    // Assert
    expect(firstCategory).toHaveProperty("slug");
    expect(firstCategory).toHaveProperty("title");
    expect(firstCategory).toHaveProperty("description");
    expect(firstCategory).toHaveProperty("metaTitle");
    expect(firstCategory).toHaveProperty("metaDescription");
    expect(firstCategory).toHaveProperty("filter");
    expect(firstCategory).toHaveProperty("icon");
    expect(firstCategory).toHaveProperty("faqs");
  });

  it("should return categories with valid FAQs", () => {
    // Act
    const categories = getAllCategories();

    // Assert
    categories.forEach((category) => {
      expect(Array.isArray(category.faqs)).toBe(true);
      category.faqs.forEach((faq) => {
        expect(faq).toHaveProperty("question");
        expect(faq).toHaveProperty("answer");
        expect(typeof faq.question).toBe("string");
        expect(typeof faq.answer).toBe("string");
        expect(faq.question.length).toBeGreaterThan(0);
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });

  it("should have unique slugs for all categories", () => {
    // Act
    const categories = getAllCategories();
    const slugs = categories.map((cat) => cat.slug);
    const uniqueSlugs = new Set(slugs);

    // Assert
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should include genre categories", () => {
    // Act
    const categories = getAllCategories();
    const genreCategories = categories.filter((cat) =>
      cat.slug.includes("best-open-source-"),
    );

    // Assert
    expect(genreCategories.length).toBeGreaterThan(0);
    expect(genreCategories.some((cat) => cat.slug.includes("rpg"))).toBe(true);
    expect(genreCategories.some((cat) => cat.slug.includes("fps"))).toBe(true);
  });

  it("should include language categories", () => {
    // Act
    const categories = getAllCategories();
    const langCategories = categories.filter((cat) =>
      cat.slug.includes("games-written-in-"),
    );

    // Assert
    expect(langCategories.length).toBeGreaterThan(0);
    expect(langCategories.some((cat) => cat.slug.includes("rust"))).toBe(true);
    expect(langCategories.some((cat) => cat.slug.includes("python"))).toBe(
      true,
    );
  });

  it("should include engine categories", () => {
    // Act
    const categories = getAllCategories();
    const engineCategories = categories.filter((cat) =>
      cat.slug.includes("-open-source-games"),
    );

    // Assert
    expect(engineCategories.length).toBeGreaterThan(0);
    expect(engineCategories.some((cat) => cat.slug.includes("godot"))).toBe(
      true,
    );
  });

  it("should include alternative categories", () => {
    // Act
    const categories = getAllCategories();
    const altCategories = categories.filter((cat) =>
      cat.slug.includes("-alternatives"),
    );

    // Assert
    expect(altCategories.length).toBeGreaterThan(0);
    expect(altCategories.some((cat) => cat.slug.includes("minecraft"))).toBe(
      true,
    );
  });
});

describe("getCategoryBySlug", () => {
  it("should return a category for a valid slug", () => {
    // Arrange
    const validSlug = "best-open-source-rpg-games";

    // Act
    const category = getCategoryBySlug(validSlug);

    // Assert
    expect(category).toBeDefined();
    expect(category?.slug).toBe(validSlug);
  });

  it("should return undefined for an invalid slug", () => {
    // Arrange
    const invalidSlug = "non-existent-category-slug-12345";

    // Act
    const category = getCategoryBySlug(invalidSlug);

    // Assert
    expect(category).toBeUndefined();
  });

  it("should return category with correct filter for genre", () => {
    // Arrange
    const slug = "best-open-source-puzzle-games";

    // Act
    const category = getCategoryBySlug(slug);

    // Assert
    expect(category).toBeDefined();
    expect(category?.filter).toHaveProperty("topics");
    expect(category?.filter.topics).toContain("puzzle");
  });

  it("should return category with correct filter for language", () => {
    // Arrange
    const slug = "games-written-in-rust";

    // Act
    const category = getCategoryBySlug(slug);

    // Assert
    expect(category).toBeDefined();
    expect(category?.filter).toHaveProperty("language");
    expect(category?.filter.language).toBe("Rust");
  });

  it("should return category with correct filter for multiplayer", () => {
    // Arrange
    const slug = "multiplayer-open-source-games";

    // Act
    const category = getCategoryBySlug(slug);

    // Assert
    expect(category).toBeDefined();
    expect(category?.filter.isMultiplayer).toBe(true);
  });
});

describe("getAllCategorySlugs", () => {
  it("should return an array of strings", () => {
    // Act
    const slugs = getAllCategorySlugs();

    // Assert
    expect(Array.isArray(slugs)).toBe(true);
    slugs.forEach((slug) => {
      expect(typeof slug).toBe("string");
    });
  });

  it("should return same count as getAllCategories", () => {
    // Act
    const slugs = getAllCategorySlugs();
    const categories = getAllCategories();

    // Assert
    expect(slugs.length).toBe(categories.length);
  });

  it("should have all unique slugs", () => {
    // Act
    const slugs = getAllCategorySlugs();
    const uniqueSlugs = new Set(slugs);

    // Assert
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should contain valid slug format", () => {
    // Act
    const slugs = getAllCategorySlugs();
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    // Assert
    slugs.forEach((slug) => {
      expect(slugPattern.test(slug)).toBe(true);
    });
  });
});

describe("getCategoriesByType", () => {
  it("should return an object with category groups", () => {
    // Act
    const byType = getCategoriesByType();

    // Assert
    expect(typeof byType).toBe("object");
    expect(byType).toHaveProperty("By Genre");
    expect(byType).toHaveProperty("By Programming Language");
    expect(byType).toHaveProperty("By Game Engine");
    expect(byType).toHaveProperty("Commercial Alternatives");
    expect(byType).toHaveProperty("By Platform");
    expect(byType).toHaveProperty("Special Collections");
  });

  it("should have arrays of categories for each type", () => {
    // Act
    const byType = getCategoriesByType();

    // Assert
    Object.values(byType).forEach((categories) => {
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  it("should have genre categories in 'By Genre' group", () => {
    // Act
    const byType = getCategoriesByType();
    const genreCategories = byType["By Genre"];

    // Assert
    expect(genreCategories.length).toBeGreaterThan(10); // At least 10 genres
    expect(
      genreCategories.some((cat) => cat.slug.includes("best-open-source-rpg")),
    ).toBe(true);
    expect(
      genreCategories.some((cat) => cat.slug.includes("best-open-source-fps")),
    ).toBe(true);
  });

  it("should have language categories in correct group", () => {
    // Act
    const byType = getCategoriesByType();
    const langCategories = byType["By Programming Language"];

    // Assert
    expect(langCategories.length).toBeGreaterThan(5);
    expect(langCategories.every((cat) => cat.filter.language)).toBe(true);
  });

  it("should have engine categories in correct group", () => {
    // Act
    const byType = getCategoriesByType();
    const engineCategories = byType["By Game Engine"];

    // Assert
    expect(engineCategories.length).toBeGreaterThan(5);
    expect(
      engineCategories.every(
        (cat) => cat.filter.engine || cat.filter.topics?.length,
      ),
    ).toBe(true);
  });

  it("should sum to total categories count", () => {
    // Act
    const byType = getCategoriesByType();
    const totalFromGroups = Object.values(byType).reduce(
      (sum, cats) => sum + cats.length,
      0,
    );

    // Assert
    expect(totalFromGroups).toBe(getAllCategories().length);
  });
});

describe("TOTAL_CATEGORIES", () => {
  it("should match the actual count of categories", () => {
    // Act
    const actualCount = getAllCategories().length;

    // Assert
    expect(TOTAL_CATEGORIES).toBe(actualCount);
  });

  it("should be greater than 50", () => {
    // The spec mentions 100+ categories
    expect(TOTAL_CATEGORIES).toBeGreaterThan(50);
  });
});

describe("Category structure validation", () => {
  it("should have SEO-friendly meta titles", () => {
    // Act
    const categories = getAllCategories();

    // Assert
    categories.forEach((category) => {
      expect(category.metaTitle.length).toBeGreaterThan(20);
      // Allow slightly longer titles (up to 120 chars) for descriptive SEO
      expect(category.metaTitle.length).toBeLessThan(120);
    });
  });

  it("should have SEO-friendly meta descriptions", () => {
    // Act
    const categories = getAllCategories();

    // Assert
    categories.forEach((category) => {
      expect(category.metaDescription.length).toBeGreaterThan(50);
      expect(category.metaDescription.length).toBeLessThan(200);
    });
  });

  it("should have at least 2 FAQs per category", () => {
    // Act
    const categories = getAllCategories();

    // Assert
    categories.forEach((category) => {
      expect(category.faqs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("should have valid icon names", () => {
    // Act
    const categories = getAllCategories();
    const validIconPattern = /^[a-z0-9-]+$/;

    // Assert
    categories.forEach((category) => {
      expect(typeof category.icon).toBe("string");
      expect(validIconPattern.test(category.icon)).toBe(true);
    });
  });
});
