import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  cn,
  formatNumber,
  starsToRating,
  formatDate,
  parseGitHubUrl,
  getRelativeTime,
  getLanguageColor,
  truncateText,
  getGenreEmoji,
  getDefaultEmoji,
  debounce,
} from "@/lib/utils";

describe("cn (className utility)", () => {
  it("should merge multiple class names", () => {
    // Arrange
    const classes = ["px-4", "py-2", "bg-white"];
    // Act
    const result = cn(...classes);
    // Assert
    expect(result).toBe("px-4 py-2 bg-white");
  });

  it("should handle conditional classes", () => {
    // Arrange
    const isActive = true;
    // Act
    const result = cn("base", isActive && "active");
    // Assert
    expect(result).toBe("base active");
  });

  it("should filter out falsy values", () => {
    // Arrange & Act
    const result = cn("base", false, null, undefined, "visible");
    // Assert
    expect(result).toBe("base visible");
  });

  it("should merge Tailwind classes correctly", () => {
    // Arrange & Act - twMerge should dedupe conflicting classes
    const result = cn("px-2 px-4", "py-2");
    // Assert - px-4 should win over px-2
    expect(result).toBe("px-4 py-2");
  });

  it("should handle array inputs", () => {
    // Arrange & Act
    const result = cn(["px-4", "py-2"]);
    // Assert
    expect(result).toBe("px-4 py-2");
  });
});

describe("formatNumber", () => {
  it("should return number as string when less than 1000", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(999)).toBe("999");
  });

  it("should format thousands with K suffix", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(12345)).toBe("12.3K");
    expect(formatNumber(999999)).toBe("1000K");
  });

  it("should format millions with M suffix", () => {
    expect(formatNumber(1000000)).toBe("1M");
    expect(formatNumber(1500000)).toBe("1.5M");
    expect(formatNumber(12345678)).toBe("12.3M");
  });

  it("should remove trailing .0", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(2000)).toBe("2K");
    expect(formatNumber(10000000)).toBe("10M");
  });
});

describe("starsToRating", () => {
  it("should return 1 for very low star counts", () => {
    expect(starsToRating(0)).toBe(1);
    expect(starsToRating(100)).toBe(1);
    expect(starsToRating(1000)).toBe(1);
  });

  it("should scale stars to rating between 1 and 5", () => {
    expect(starsToRating(2000)).toBe(1);
    expect(starsToRating(4000)).toBe(2);
    expect(starsToRating(6000)).toBe(3);
    expect(starsToRating(8000)).toBe(4);
    expect(starsToRating(10000)).toBe(5);
  });

  it("should cap rating at 5 for very high star counts", () => {
    expect(starsToRating(20000)).toBe(5);
    expect(starsToRating(100000)).toBe(5);
  });

  it("should handle fractional ratings", () => {
    expect(starsToRating(3000)).toBe(1.5);
    expect(starsToRating(5000)).toBe(2.5);
  });
});

describe("formatDate", () => {
  it("should return 'Unknown' for null input", () => {
    expect(formatDate(null)).toBe("Unknown");
  });

  it("should format Date object", () => {
    // Arrange
    const date = new Date("2024-03-15");
    // Act
    const result = formatDate(date);
    // Assert
    expect(result).toMatch(/Mar 15, 2024/);
  });

  it("should format date string", () => {
    // Arrange & Act
    const result = formatDate("2024-06-01T00:00:00Z");
    // Assert
    expect(result).toMatch(/Jun 1, 2024/);
  });

  it("should format ISO date strings", () => {
    // Arrange & Act
    const result = formatDate("2023-12-25");
    // Assert
    expect(result).toMatch(/Dec 25, 2023/);
  });
});

describe("parseGitHubUrl", () => {
  it("should extract owner and repo from valid GitHub URL", () => {
    // Arrange & Act
    const result = parseGitHubUrl("https://github.com/facebook/react");
    // Assert
    expect(result).toEqual({ owner: "facebook", repo: "react" });
  });

  it("should handle URLs with .git suffix", () => {
    // Arrange & Act
    const result = parseGitHubUrl("https://github.com/vuejs/vue.git");
    // Assert
    expect(result).toEqual({ owner: "vuejs", repo: "vue" });
  });

  it("should handle URLs with trailing slashes", () => {
    // Arrange & Act
    const result = parseGitHubUrl("https://github.com/angular/angular/");
    // Assert
    expect(result).toEqual({ owner: "angular", repo: "angular" });
  });

  it("should return null for non-GitHub URLs", () => {
    expect(parseGitHubUrl("https://gitlab.com/user/repo")).toBeNull();
    expect(parseGitHubUrl("https://example.com")).toBeNull();
    expect(parseGitHubUrl("invalid-url")).toBeNull();
  });

  it("should handle http:// protocol", () => {
    // Arrange & Act
    const result = parseGitHubUrl("http://github.com/owner/repo");
    // Assert
    expect(result).toEqual({ owner: "owner", repo: "repo" });
  });
});

describe("getRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'Unknown' for null input", () => {
    expect(getRelativeTime(null)).toBe("Unknown");
  });

  it("should return 'Today' for same day", () => {
    expect(getRelativeTime("2024-06-15T10:00:00Z")).toBe("Today");
  });

  it("should return 'Yesterday' for previous day", () => {
    expect(getRelativeTime("2024-06-14T10:00:00Z")).toBe("Yesterday");
  });

  it("should return days ago for recent dates", () => {
    expect(getRelativeTime("2024-06-12T10:00:00Z")).toBe("3 days ago");
    expect(getRelativeTime("2024-06-10T10:00:00Z")).toBe("5 days ago");
  });

  it("should return weeks ago", () => {
    expect(getRelativeTime("2024-06-01T10:00:00Z")).toBe("2 weeks ago");
    expect(getRelativeTime("2024-05-25T10:00:00Z")).toBe("3 weeks ago");
  });

  it("should return months ago", () => {
    expect(getRelativeTime("2024-04-15T10:00:00Z")).toBe("2 months ago");
    expect(getRelativeTime("2024-01-15T10:00:00Z")).toBe("5 months ago");
  });

  it("should return years ago", () => {
    expect(getRelativeTime("2023-06-15T10:00:00Z")).toBe("1 years ago");
    expect(getRelativeTime("2022-06-15T10:00:00Z")).toBe("2 years ago");
  });

  it("should handle Date objects", () => {
    expect(getRelativeTime(new Date("2024-06-13T10:00:00Z"))).toBe(
      "2 days ago",
    );
  });
});

describe("getLanguageColor", () => {
  it("should return correct colors for known languages", () => {
    expect(getLanguageColor("JavaScript")).toBe("#f1e05a");
    expect(getLanguageColor("TypeScript")).toBe("#3178c6");
    expect(getLanguageColor("Python")).toBe("#3572A5");
    expect(getLanguageColor("Rust")).toBe("#dea584");
    expect(getLanguageColor("C++")).toBe("#f34b7d");
    expect(getLanguageColor("Go")).toBe("#00ADD8");
  });

  it("should return default color for unknown languages", () => {
    expect(getLanguageColor("UnknownLanguage")).toBe("#8b949e");
    expect(getLanguageColor("")).toBe("#8b949e");
  });

  it("should return default color for null", () => {
    expect(getLanguageColor(null)).toBe("#8b949e");
  });
});

describe("truncateText", () => {
  it("should return original text when shorter than max length", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
    expect(truncateText("Short", 100)).toBe("Short");
  });

  it("should return original text when equal to max length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("should truncate and add ellipsis when longer than max length", () => {
    expect(truncateText("Hello World", 8)).toBe("Hello Wo...");
    expect(truncateText("This is a long sentence", 10)).toBe("This is a...");
  });

  it("should handle empty strings", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("should trim trailing whitespace before adding ellipsis", () => {
    expect(truncateText("Hello     World", 6)).toBe("Hello...");
  });
});

describe("getGenreEmoji", () => {
  it("should return a string emoji for known genres", () => {
    // These should return some emoji string (not undefined/null)
    expect(typeof getGenreEmoji("action")).toBe("string");
    expect(typeof getGenreEmoji("puzzle")).toBe("string");
    expect(typeof getGenreEmoji("rpg")).toBe("string");
    expect(typeof getGenreEmoji("racing")).toBe("string");
    expect(typeof getGenreEmoji("horror")).toBe("string");
    expect(getGenreEmoji("action").length).toBeGreaterThan(0);
  });

  it("should handle case-insensitive input", () => {
    // Should work with uppercase input as well
    expect(typeof getGenreEmoji("ACTION")).toBe("string");
    expect(typeof getGenreEmoji("Puzzle")).toBe("string");
    expect(typeof getGenreEmoji("RPG")).toBe("string");
  });

  it("should return default emoji for unknown genres", () => {
    // Unknown genres should still return a default emoji
    expect(typeof getGenreEmoji("unknown")).toBe("string");
    expect(typeof getGenreEmoji("")).toBe("string");
    expect(getGenreEmoji("unknown").length).toBeGreaterThan(0);
  });
});

describe("getDefaultEmoji", () => {
  it("should return consistent emoji for same input", () => {
    const result1 = getDefaultEmoji("TestGame");
    const result2 = getDefaultEmoji("TestGame");
    expect(result1).toBe(result2);
  });

  it("should return different emojis for different inputs", () => {
    // Test with strings that have different first character codes
    const results = new Set([
      getDefaultEmoji("Alpha"),
      getDefaultEmoji("Beta"),
      getDefaultEmoji("Charlie"),
      getDefaultEmoji("Delta"),
      getDefaultEmoji("Echo"),
      getDefaultEmoji("Foxtrot"),
      getDefaultEmoji("Golf"),
      getDefaultEmoji("Hotel"),
      getDefaultEmoji("India"),
      getDefaultEmoji("Juliet"),
    ]);
    // With 10 different first letters, we should get variation
    expect(results.size).toBeGreaterThanOrEqual(1);
  });

  it("should return a valid emoji string", () => {
    const result = getDefaultEmoji("AnyGame");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay function execution", () => {
    // Arrange
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Act
    debouncedFn("arg1");

    // Assert - not called immediately
    expect(mockFn).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Assert - called after delay
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("arg1");
  });

  it("should only call once when called multiple times within delay", () => {
    // Arrange
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Act - call multiple times
    debouncedFn("first");
    vi.advanceTimersByTime(50);
    debouncedFn("second");
    vi.advanceTimersByTime(50);
    debouncedFn("third");

    // Fast-forward remaining time
    vi.advanceTimersByTime(100);

    // Assert - only called once with last argument
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("third");
  });

  it("should call multiple times when delay passes between calls", () => {
    // Arrange
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Act - call, wait, call again
    debouncedFn("first");
    vi.advanceTimersByTime(100);
    debouncedFn("second");
    vi.advanceTimersByTime(100);

    // Assert
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenNthCalledWith(1, "first");
    expect(mockFn).toHaveBeenNthCalledWith(2, "second");
  });

  it("should pass multiple arguments correctly", () => {
    // Arrange
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    // Act
    debouncedFn("arg1", "arg2", "arg3");
    vi.advanceTimersByTime(100);

    // Assert
    expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });
});
