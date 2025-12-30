import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

// Mock process.env
vi.stubGlobal("process", {
  env: {
    NEXT_PUBLIC_GITHUB_URL: "https://github.com/test/open-source-games",
  },
});

// Mock useSyncExternalStore to return controlled values
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useSyncExternalStore: vi.fn(() => false),
  };
});

function renderWithTheme(element: React.ReactElement) {
  return render(<ThemeProvider>{element}</ThemeProvider>);
}

describe("Header", () => {
  beforeEach(() => {
    // Mock document methods for theme
    document.documentElement.classList.remove("dark", "light");
  });

  it("should render logo", () => {
    renderWithTheme(<Header />);
    expect(screen.getByText("OpenGames")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    renderWithTheme(<Header />);

    // Check that navigation exists (links appear in both desktop and mobile)
    expect(screen.getAllByText("Games").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Categories").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trending").length).toBeGreaterThan(0);
    expect(screen.getAllByText("About").length).toBeGreaterThan(0);
  });

  it("should render Submit Game buttons", () => {
    renderWithTheme(<Header />);
    // Submit Game appears in both desktop and mobile views
    expect(screen.getAllByText("Submit Game").length).toBeGreaterThan(0);
  });

  it("should render GitHub link", () => {
    renderWithTheme(<Header />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/test/open-source-games",
    );
  });

  it("should render theme toggle buttons", () => {
    renderWithTheme(<Header />);
    // Theme toggle appears in both desktop and mobile
    const allButtons = screen.getAllByText(/dark mode|light mode/i);
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it("should render mobile menu button", () => {
    renderWithTheme(<Header />);
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("should have correct href for logo link", () => {
    renderWithTheme(<Header />);
    const logoLink = screen.getByText("OpenGames").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("should have correct navigation link hrefs", () => {
    renderWithTheme(<Header />);

    // Check for Games link
    const gamesLinks = screen.getAllByText("Games");
    const gamesLink = gamesLinks[0].closest("a");
    expect(gamesLink).toHaveAttribute("href", "/games");

    // Check for Categories link
    const categoriesLinks = screen.getAllByText("Categories");
    const categoriesLink = categoriesLinks[0].closest("a");
    expect(categoriesLink).toHaveAttribute("href", "/category");

    // Check for Trending link
    const trendingLinks = screen.getAllByText("Trending");
    const trendingLink = trendingLinks[0].closest("a");
    expect(trendingLink).toHaveAttribute("href", "/trending");

    // Check for About link
    const aboutLinks = screen.getAllByText("About");
    const aboutLink = aboutLinks[0].closest("a");
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  it("should have correct href for Submit Game links", () => {
    renderWithTheme(<Header />);

    const submitLinks = screen.getAllByText("Submit Game");
    const submitLink = submitLinks[0].closest("a");
    expect(submitLink).toHaveAttribute("href", "/submit");
  });
});

describe("Header accessibility", () => {
  it("should have proper aria labels on buttons", () => {
    renderWithTheme(<Header />);

    // Check for menu button
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();

    // Check for GitHub link
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toBeInTheDocument();
  });

  it("should have proper heading structure", () => {
    renderWithTheme(<Header />);
    const header = document.querySelector("header");
    expect(header).toBeInTheDocument();
  });
});
