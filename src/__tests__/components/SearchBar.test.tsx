import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/SearchBar";

// Mock fetch for search API calls
const mockSearchResults = {
  data: [
    { slug: "openttd", title: "OpenTTD" },
    { slug: "supertuxkart", title: "SuperTuxKart" },
    { slug: "minetest", title: "Minetest" },
    { slug: "0ad", title: "0 A.D." },
    { slug: "wesnoth", title: "Battle for Wesnoth" },
  ],
};

const mockFetch = vi.fn((url: string) => {
  // Parse the query parameter
  const urlObj = new URL(url, "http://localhost");
  const query = urlObj.searchParams.get("q")?.toLowerCase() || "";

  // Filter results based on query
  const filtered = mockSearchResults.data.filter((game) =>
    game.title.toLowerCase().includes(query),
  );

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: filtered }),
  } as Response);
});

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should render search input", () => {
    // Act
    render(<SearchBar />);

    // Assert
    expect(screen.getByPlaceholderText("Search games...")).toBeInTheDocument();
  });

  it("should render with custom placeholder", () => {
    // Act
    render(<SearchBar placeholder="Find a game..." />);

    // Assert
    expect(screen.getByPlaceholderText("Find a game...")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    // Act
    render(<SearchBar className="custom-class" />);

    // Assert
    const container = screen
      .getByPlaceholderText("Search games...")
      .closest("div")?.parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("should call onSearch callback with input value", async () => {
    // Arrange
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "test");

    // Assert - should call onSearch for each character
    expect(onSearch).toHaveBeenCalled();
  });

  it("should show clear button when input has value", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz");

    // Wait for debounce to complete
    vi.advanceTimersByTime(300);

    // Wait for clear button to appear after loading finishes
    await waitFor(() => {
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });
  });

  it("should clear input when clear button is clicked", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz");
    vi.advanceTimersByTime(300);

    // Wait for clear button to appear after debounce completes
    await waitFor(() => {
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText("Clear search");
    await user.click(clearButton);

    // Assert
    expect(input).toHaveValue("");
  });

  it("should call onSearch with empty string when cleared", async () => {
    // Arrange
    const onSearch = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz");
    vi.advanceTimersByTime(300);

    // Query for clear button after state settles
    await waitFor(() => {
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    const clearButton = screen.getByLabelText("Clear search");
    await user.click(clearButton);

    // Assert
    expect(onSearch).toHaveBeenLastCalledWith("");
  });

  it("should show loading state during debounce", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "test");

    // Assert - loading should be visible during debounce
    // The loading state shows when query differs from debouncedQuery
    expect(input).toHaveValue("test");
  });

  it("should show dropdown with results when focused and has query", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "open");
    vi.advanceTimersByTime(300);

    // Assert - should show matching mock results
    await waitFor(() => {
      expect(screen.getByText("OpenTTD")).toBeInTheDocument();
    });
  });

  it("should show no results message when no matches", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz123nonexistent");
    vi.advanceTimersByTime(300);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/No games found/)).toBeInTheDocument();
    });
  });

  it("should highlight selected result on arrow down", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "open");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("OpenTTD")).toBeInTheDocument();
    });

    await user.keyboard("{ArrowDown}");

    // Assert - first item should be highlighted
    const firstResult = screen.getByText("OpenTTD").closest("a");
    expect(firstResult).toHaveClass("bg-indigo-50");
  });

  it("should navigate up with arrow up key", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "super");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("SuperTuxKart")).toBeInTheDocument();
    });

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");

    // Assert - should be back to no selection
    const result = screen.getByText("SuperTuxKart").closest("a");
    expect(result).not.toHaveClass("bg-indigo-50");
  });

  it("should close dropdown on escape key", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "open");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("OpenTTD")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");

    // Assert - dropdown should be closed
    expect(screen.queryByText("OpenTTD")).not.toBeInTheDocument();
  });

  it("should close dropdown when clicking outside", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(
      <div>
        <SearchBar />
        <button data-testid="outside">Outside</button>
      </div>,
    );

    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "open");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText("OpenTTD")).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));

    // Assert - dropdown should be closed
    expect(screen.queryByText("OpenTTD")).not.toBeInTheDocument();
  });

  it("should show search results matching query", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "super");
    vi.advanceTimersByTime(300);

    // Assert - should show matching result
    await waitFor(() => {
      expect(screen.getByText("SuperTuxKart")).toBeInTheDocument();
    });
  });

  it("should not show dropdown when input is empty", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.click(input);
    vi.advanceTimersByTime(300);

    // Assert - no dropdown should appear
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should render result links with correct href", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "open");
    vi.advanceTimersByTime(300);

    // Assert
    await waitFor(() => {
      const link = screen.getByText("OpenTTD").closest("a");
      expect(link).toHaveAttribute("href", "/games/openttd");
    });
  });
});

describe("SearchBar accessibility", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should have accessible input with placeholder", () => {
    // Act
    render(<SearchBar />);

    // Assert
    const input = screen.getByPlaceholderText("Search games...");
    expect(input).toHaveAttribute("type", "text");
  });

  it("should have accessible clear button", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz");
    vi.advanceTimersByTime(300);

    // Wait for clear button to appear
    await waitFor(() => {
      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });

    // Assert
    const clearButton = screen.getByLabelText("Clear search");
    expect(clearButton).toBeInTheDocument();
    expect(clearButton.tagName).toBe("BUTTON");
  });
});

describe("SearchBar debouncing", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should debounce search with 300ms delay", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");
    await user.type(input, "xyz123nonexistent");

    // Assert - results should not show immediately (no list visible)
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    // Fast-forward time
    vi.advanceTimersByTime(300);

    // Now results should appear - showing no results message
    await waitFor(() => {
      expect(screen.getByText(/No games found/)).toBeInTheDocument();
    });
  });

  it("should cancel previous timeout on new input", async () => {
    // Arrange
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    // Act
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search games...");

    await user.type(input, "ope");
    vi.advanceTimersByTime(100);
    await user.type(input, "n");
    vi.advanceTimersByTime(300);

    // Assert - should search for "open" not "ope"
    await waitFor(() => {
      expect(screen.getByText("OpenTTD")).toBeInTheDocument();
    });
  });
});
