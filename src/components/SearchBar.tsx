"use client";

import { Search, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn, getDefaultEmoji } from "@/lib/utils";
import Link from "next/link";

interface SearchResult {
  slug: string;
  title: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  className,
  placeholder = "Search games...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = debouncedQuery.trim();

      // Clear results if query is too short
      if (trimmed.length < 2) {
        setResults([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&suggest=true`,
          { signal: abortControllerRef.current.signal },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as { data?: SearchResult[] };
        setResults(data.data || []);
        setError(null);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Search error:", err);
        setError("Failed to fetch suggestions");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();

    // Cleanup: abort pending request on unmount or query change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  // Global keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key press (when not typing in an input)
      if (e.key === "/" && !isTypingInInput()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const isTypingInInput = () => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true"
      );
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setSelectedIndex(-1);
      onSearch?.(value);
    },
    [onSearch],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setError(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    onSearch?.("");
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        window.location.href = `/games/${results[selectedIndex].slug}`;
      } else if (e.key === "Escape") {
        // Clear search on Escape
        if (query) {
          clearSearch();
        } else {
          inputRef.current?.blur();
          setIsFocused(false);
        }
      }
    },
    [results, selectedIndex, query, clearSearch],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isFocused &&
    (results.length > 0 ||
      isLoading ||
      error ||
      (query.trim().length >= 2 && debouncedQuery));

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "relative flex items-center overflow-hidden rounded-xl border bg-white transition-all duration-200 dark:bg-zinc-900",
          isFocused
            ? "border-indigo-500 ring-4 ring-indigo-500/20 dark:border-indigo-400 dark:ring-indigo-400/20"
            : "border-zinc-200 dark:border-zinc-700",
        )}
      >
        <Search className="ml-4 h-5 w-5 flex-shrink-0 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent px-3 text-zinc-900 placeholder-zinc-500 outline-none dark:text-white dark:placeholder-zinc-400 sm:h-14 sm:text-lg"
        />
        {/* Keyboard shortcut hint */}
        {!isFocused && !query && (
          <kbd className="mr-3 hidden rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 sm:inline-block">
            /
          </kbd>
        )}
        {isLoading && (
          <Loader2 className="mr-2 h-5 w-5 flex-shrink-0 animate-spin text-zinc-400" />
        )}
        {query && !isLoading && (
          <button
            onClick={clearSearch}
            className="mr-2 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="ml-2 text-sm text-zinc-500">Searching...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => setDebouncedQuery(query)}
                className="mt-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
              >
                Try again
              </button>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {results.map((result, index) => (
                <li key={result.slug}>
                  <Link
                    href={`/games/${result.slug}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      index === selectedIndex
                        ? "bg-indigo-50 dark:bg-indigo-900/30"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    )}
                    onClick={() => setIsFocused(false)}
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xl dark:bg-zinc-800">
                      {getDefaultEmoji(result.title)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-900 dark:text-white">
                        {result.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            debouncedQuery && (
              <div className="py-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No games found for &quot;{debouncedQuery}&quot;
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
