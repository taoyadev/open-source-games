import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";

// Mock process.env
vi.stubGlobal("process", {
  env: {
    NEXT_PUBLIC_GITHUB_URL: "https://github.com/test/open-source-games",
    NEXT_PUBLIC_TWITTER_URL: "https://twitter.com/testuser",
  },
});

describe("Footer", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  it("should render logo", () => {
    render(<Footer />);
    expect(screen.getByText("OpenGames")).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Discover and explore the best open source games/),
    ).toBeInTheDocument();
  });

  it("should render current year in copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
    expect(
      screen.getByText(/OpenGames\. All rights reserved/),
    ).toBeInTheDocument();
  });

  it("should render 'Made with' message", () => {
    render(<Footer />);
    expect(screen.getByText(/Made with/)).toBeInTheDocument();
  });

  it("should render discover section links", () => {
    render(<Footer />);

    expect(screen.getByText("All Games")).toBeInTheDocument();
    expect(screen.getByText("Browse by Genre")).toBeInTheDocument();
    expect(screen.getByText("Browse by Language")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });

  it("should render resources section links", () => {
    render(<Footer />);

    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Submit a Game")).toBeInTheDocument();
    expect(screen.getByText("API")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
  });

  it("should render legal section links", () => {
    render(<Footer />);

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Affiliate Disclosure")).toBeInTheDocument();
    expect(screen.getByText("DMCA")).toBeInTheDocument();
  });

  it("should render affiliate disclosure", () => {
    render(<Footer />);
    expect(screen.getByText(/Affiliate Disclosure:/)).toBeInTheDocument();
  });

  it("should render GitHub link", () => {
    render(<Footer />);
    const githubLink = screen.getByLabelText("GitHub");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/test/open-source-games",
    );
  });

  it("should render Twitter link", () => {
    render(<Footer />);
    const twitterLink = screen.getByLabelText("Twitter");
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/testuser");
  });

  it("should have correct href for discover links", () => {
    render(<Footer />);

    const allGamesLink = screen.getByText("All Games").closest("a");
    expect(allGamesLink).toHaveAttribute("href", "/games");

    const genreLink = screen.getByText("Browse by Genre").closest("a");
    expect(genreLink).toHaveAttribute("href", "/genres");

    const languageLink = screen.getByText("Browse by Language").closest("a");
    expect(languageLink).toHaveAttribute("href", "/languages");

    const trendingLink = screen.getByText("Trending").closest("a");
    expect(trendingLink).toHaveAttribute("href", "/trending");
  });

  it("should have correct href for resources links", () => {
    render(<Footer />);

    const aboutLink = screen.getByText("About").closest("a");
    expect(aboutLink).toHaveAttribute("href", "/about");

    const submitLink = screen.getByText("Submit a Game").closest("a");
    expect(submitLink).toHaveAttribute("href", "/submit");

    const apiLink = screen.getByText("API").closest("a");
    expect(apiLink).toHaveAttribute("href", "/api");

    const blogLink = screen.getByText("Blog").closest("a");
    expect(blogLink).toHaveAttribute("href", "/blog");
  });

  it("should have correct href for legal links", () => {
    render(<Footer />);

    const privacyLink = screen.getByText("Privacy Policy").closest("a");
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByText("Terms of Service").closest("a");
    expect(termsLink).toHaveAttribute("href", "/terms");

    const affiliateLink = screen.getByText("Affiliate Disclosure").closest("a");
    expect(affiliateLink).toHaveAttribute("href", "/affiliate");

    const dmcaLink = screen.getByText("DMCA").closest("a");
    expect(dmcaLink).toHaveAttribute("href", "/dmca");
  });
});
