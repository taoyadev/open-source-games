"use client";

import Link from "next/link";
import { Gamepad2, Github, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme, useThemeReady } from "@/components/ThemeProvider";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, isDark } = useTheme();
  const themeReady = useThemeReady();

  // Don't render theme-dependent content until ready to prevent flash
  const showTheme = themeReady;

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const nextThemeLabel =
    theme === "light"
      ? "Dark Mode"
      : theme === "dark"
        ? "System"
        : "Light Mode";

  const navLinks = [
    { href: "/games", label: "Games" },
    { href: "/category", label: "Categories" },
    { href: "/trending", label: "Trending" },
    { href: "/about", label: "About" },
  ];

  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    "https://github.com/bobeff/open-source-games";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-zinc-900 dark:text-white">
            OpenGames
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label={`Switch to ${nextThemeLabel}`}
            title={`Current: ${theme}. Click to switch to ${nextThemeLabel}`}
          >
            {showTheme ? (
              isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              <div className="h-5 w-5 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700" />
            )}
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <Link
            href="/submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Submit Game
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-zinc-600 md:hidden dark:text-zinc-400"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:hidden",
          mobileMenuOpen ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {showTheme ? (isDark ? "Light Mode" : "Dark Mode") : "..."}
            </button>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Submit Game
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
