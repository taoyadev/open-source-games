"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Star,
  Clock,
  Code2,
  Gamepad2,
} from "lucide-react";
import { cn, getGenreEmoji } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  genres: string[];
  languages: string[];
  minStars: number;
  activity: string;
  sortBy: string;
}

const genres: FilterOption[] = [
  { value: "action", label: "Action", count: 124 },
  { value: "adventure", label: "Adventure", count: 89 },
  { value: "puzzle", label: "Puzzle", count: 67 },
  { value: "strategy", label: "Strategy", count: 156 },
  { value: "rpg", label: "RPG", count: 98 },
  { value: "simulation", label: "Simulation", count: 45 },
  { value: "platformer", label: "Platformer", count: 78 },
  { value: "shooter", label: "Shooter", count: 56 },
  { value: "racing", label: "Racing", count: 34 },
  { value: "sandbox", label: "Sandbox", count: 42 },
];

const languages: FilterOption[] = [
  { value: "C++", label: "C++", count: 234 },
  { value: "Python", label: "Python", count: 189 },
  { value: "JavaScript", label: "JavaScript", count: 156 },
  { value: "Rust", label: "Rust", count: 78 },
  { value: "Go", label: "Go", count: 45 },
  { value: "C#", label: "C#", count: 112 },
  { value: "Java", label: "Java", count: 89 },
  { value: "GDScript", label: "GDScript", count: 67 },
  { value: "Lua", label: "Lua", count: 56 },
  { value: "TypeScript", label: "TypeScript", count: 34 },
];

const starRanges: FilterOption[] = [
  { value: "0", label: "Any" },
  { value: "100", label: "100+" },
  { value: "500", label: "500+" },
  { value: "1000", label: "1K+" },
  { value: "5000", label: "5K+" },
  { value: "10000", label: "10K+" },
];

const activityOptions: FilterOption[] = [
  { value: "any", label: "Any time" },
  { value: "week", label: "Last week" },
  { value: "month", label: "Last month" },
  { value: "year", label: "Last year" },
];

const sortOptions: FilterOption[] = [
  { value: "stars", label: "Most Stars" },
  { value: "recent", label: "Recently Updated" },
  { value: "name", label: "Name (A-Z)" },
  { value: "forks", label: "Most Forks" },
];

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-200 py-4 dark:border-zinc-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "mt-3 max-h-96" : "max-h-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FilterSidebar({
  onFilterChange,
  className,
}: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    languages: [],
    minStars: 0,
    activity: "any",
    sortBy: "stars",
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const toggleArrayFilter = (key: "genres" | "languages", value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated });
  };

  const clearFilters = () => {
    const cleared: FilterState = {
      genres: [],
      languages: [],
      minStars: 0,
      activity: "any",
      sortBy: "stars",
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters =
    filters.genres.length > 0 ||
    filters.languages.length > 0 ||
    filters.minStars > 0 ||
    filters.activity !== "any";

  return (
    <aside
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
          <SlidersHorizontal className="h-5 w-5" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="border-b border-zinc-200 pb-4 dark:border-zinc-700">
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilters({ sortBy: e.target.value })}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Genres */}
      <CollapsibleSection
        title="Genres"
        icon={<Gamepad2 className="h-4 w-4" />}
      >
        <div className="space-y-2">
          {genres.map((genre) => (
            <label
              key={genre.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={filters.genres.includes(genre.value)}
                onChange={() => toggleArrayFilter("genres", genre.value)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                {getGenreEmoji(genre.value)} {genre.label}
              </span>
              <span className="text-xs text-zinc-400">{genre.count}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Languages */}
      <CollapsibleSection
        title="Languages"
        icon={<Code2 className="h-4 w-4" />}
      >
        <div className="space-y-2">
          {languages.map((lang) => (
            <label
              key={lang.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={filters.languages.includes(lang.value)}
                onChange={() => toggleArrayFilter("languages", lang.value)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                {lang.label}
              </span>
              <span className="text-xs text-zinc-400">{lang.count}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Minimum Stars */}
      <CollapsibleSection
        title="Minimum Stars"
        icon={<Star className="h-4 w-4" />}
      >
        <div className="grid grid-cols-3 gap-2">
          {starRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => updateFilters({ minStars: parseInt(range.value) })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                filters.minStars === parseInt(range.value)
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Last Updated */}
      <CollapsibleSection
        title="Last Updated"
        icon={<Clock className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="space-y-2">
          {activityOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="activity"
                checked={filters.activity === option.value}
                onChange={() => updateFilters({ activity: option.value })}
                className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
          <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
            Active filters:
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {filters.genres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200"
              >
                {genre}
                <button
                  onClick={() => toggleArrayFilter("genres", genre)}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200"
              >
                {lang}
                <button
                  onClick={() => toggleArrayFilter("languages", lang)}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.minStars > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
                {filters.minStars}+ stars
                <button
                  onClick={() => updateFilters({ minStars: 0 })}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.activity !== "any" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200">
                {
                  activityOptions.find((o) => o.value === filters.activity)
                    ?.label
                }
                <button
                  onClick={() => updateFilters({ activity: "any" })}
                  className="hover:text-indigo-900 dark:hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
