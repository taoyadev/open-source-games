/**
 * Category Card component for the category index page
 */

import Link from "next/link";
import type { Category } from "@/lib/categories";
import {
  Gamepad2,
  Code,
  Cog,
  Users,
  User,
  Globe,
  Smartphone,
  Baby,
  Monitor,
  Wrench,
  Layers,
  Cpu,
  Activity,
  Sword,
  Crosshair,
  Flag,
  Puzzle,
  Footprints,
  Skull,
  Plane,
  Car,
  Box,
  Spade,
  Compass,
  Trophy,
  Music,
  GraduationCap,
  Terminal,
  HardDrive,
} from "lucide-react";

// Icon mapping for Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gamepad: Gamepad2,
  "gamepad-2": Gamepad2,
  code: Code,
  cog: Cog,
  users: Users,
  user: User,
  globe: Globe,
  smartphone: Smartphone,
  baby: Baby,
  monitor: Monitor,
  wrench: Wrench,
  layers: Layers,
  cpu: Cpu,
  activity: Activity,
  sword: Sword,
  crosshair: Crosshair,
  flag: Flag,
  puzzle: Puzzle,
  footprints: Footprints,
  skull: Skull,
  plane: Plane,
  car: Car,
  box: Box,
  spade: Spade,
  compass: Compass,
  trophy: Trophy,
  music: Music,
  "graduation-cap": GraduationCap,
  terminal: Terminal,
  "hard-drive": HardDrive,
};

interface CategoryCardProps {
  category: Category;
  gameCount?: number;
}

export function CategoryCard({ category, gameCount }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Gamepad2;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400">
          <IconComponent className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {category.title.replace(/ in \d{4}$/, "")}
        </h3>
      </div>

      <p className="mb-3 line-clamp-2 flex-grow text-sm text-zinc-600 dark:text-zinc-400">
        {category.description}
      </p>

      {gameCount !== undefined && (
        <div className="text-xs text-zinc-500 dark:text-zinc-500">
          {gameCount} {gameCount === 1 ? "game" : "games"}
        </div>
      )}

      <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
        Explore
        <svg
          className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

export default CategoryCard;
