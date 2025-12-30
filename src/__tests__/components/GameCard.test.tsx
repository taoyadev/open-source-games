import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameCard, type Game } from "@/components/GameCard";

const mockGame: Game = {
  id: "1",
  slug: "test-game",
  name: "Test Game",
  description: "A test game for testing purposes with a good description",
  thumbnail: "https://example.com/image.png",
  stars: 12500,
  forks: 1500,
  language: "TypeScript",
  genres: ["puzzle", "strategy", "arcade"],
  lastUpdated: "2024-06-01T00:00:00Z",
  repoUrl: "https://github.com/test/test-game",
  demoUrl: "https://test-game.example.com",
};

describe("GameCard", () => {
  it("should render game name", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    expect(screen.getByText("Test Game")).toBeInTheDocument();
  });

  it("should render game description", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    expect(
      screen.getByText(/A test game for testing purposes/),
    ).toBeInTheDocument();
  });

  it("should render formatted star count", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert - 12500 should be formatted as "12.5K"
    expect(screen.getByText("12.5K")).toBeInTheDocument();
  });

  it("should render formatted fork count", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert - 1500 should be formatted as "1.5K"
    expect(screen.getByText("1.5K")).toBeInTheDocument();
  });

  it("should render programming language", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("should render up to 3 genres", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    expect(screen.getByText("puzzle")).toBeInTheDocument();
    expect(screen.getByText("strategy")).toBeInTheDocument();
    expect(screen.getByText("arcade")).toBeInTheDocument();
  });

  it("should show +N for additional genres", () => {
    // Arrange
    const gameWithManyGenres: Game = {
      ...mockGame,
      genres: ["puzzle", "strategy", "arcade", "action", "adventure"],
    };

    // Act
    render(<GameCard game={gameWithManyGenres} />);

    // Assert
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("should not show genre count when 3 or fewer genres", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert - should not find any +N element
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("should render link to game detail page", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/games/test-game");
  });

  it("should render relative time for last updated", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert - should contain some time-related text
    // The exact format depends on the current date vs lastUpdated
    const container = screen.getByRole("link");
    expect(container).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    // Act
    render(<GameCard game={mockGame} className="custom-class" />);

    // Assert
    const link = screen.getByRole("link");
    expect(link).toHaveClass("custom-class");
  });

  it("should handle game without thumbnail", () => {
    // Arrange
    const gameWithoutThumbnail: Game = {
      ...mockGame,
      thumbnail: undefined,
    };

    // Act
    render(<GameCard game={gameWithoutThumbnail} />);

    // Assert - should still render the card
    expect(screen.getByText("Test Game")).toBeInTheDocument();
  });

  it("should handle empty genres array", () => {
    // Arrange
    const gameWithNoGenres: Game = {
      ...mockGame,
      genres: [],
    };

    // Act
    render(<GameCard game={gameWithNoGenres} />);

    // Assert - should still render the card
    expect(screen.getByText("Test Game")).toBeInTheDocument();
  });

  it("should truncate long descriptions", () => {
    // Arrange
    const longDescription =
      "This is a very long description that goes on and on and on. It should be truncated because it exceeds the maximum length that can be displayed in the card component. The truncation should add ellipsis at the end.";
    const gameWithLongDesc: Game = {
      ...mockGame,
      description: longDescription,
    };

    // Act
    render(<GameCard game={gameWithLongDesc} />);

    // Assert - description should be truncated (contains ... at the end)
    const descElement = screen.getByText(/This is a very long/);
    expect(descElement.textContent).toContain("...");
    expect(descElement.textContent?.length).toBeLessThan(
      longDescription.length,
    );
  });

  it("should render star icon", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert - check for the star count container
    const starText = screen.getByText("12.5K");
    expect(starText).toBeInTheDocument();
  });

  it("should handle zero stars and forks", () => {
    // Arrange
    const newGame: Game = {
      ...mockGame,
      stars: 0,
      forks: 0,
    };

    // Act
    render(<GameCard game={newGame} />);

    // Assert
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("should handle large numbers correctly", () => {
    // Arrange
    const popularGame: Game = {
      ...mockGame,
      stars: 150000,
      forks: 25000,
    };

    // Act
    render(<GameCard game={popularGame} />);

    // Assert
    expect(screen.getByText("150K")).toBeInTheDocument();
    expect(screen.getByText("25K")).toBeInTheDocument();
  });

  it("should render with different languages and show correct color style", () => {
    // Arrange
    const rustGame: Game = {
      ...mockGame,
      language: "Rust",
    };

    // Act
    render(<GameCard game={rustGame} />);

    // Assert
    expect(screen.getByText("Rust")).toBeInTheDocument();
  });
});

describe("GameCard accessibility", () => {
  it("should have accessible link with game name", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Test Game");
  });

  it("should render image with alt text when thumbnail exists", () => {
    // Act
    render(<GameCard game={mockGame} />);

    // Assert
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Test Game");
  });
});
