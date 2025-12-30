import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circle" | "text";
}

export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-zinc-200 dark:bg-zinc-800",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        variant === "default" && "rounded-md",
        className,
      )}
      {...props}
    />
  );
}

interface GameCardSkeletonProps {
  className?: string;
}

export function GameCardSkeleton({ className }: GameCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {/* Thumbnail skeleton */}
      <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton
            variant="circle"
            className="h-16 w-16 bg-zinc-200 dark:bg-zinc-700"
          />
        </div>
        {/* Language badge skeleton */}
        <div className="absolute right-2 top-2">
          <Skeleton className="h-7 w-16 rounded-full bg-white/90 dark:bg-zinc-900/90" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title skeleton */}
        <Skeleton className="mb-2 h-6 w-3/4" />

        {/* Description skeleton */}
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Genres skeleton */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Stats skeleton */}
        <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

interface StatsCardSkeletonProps {
  className?: string;
}

export function StatsCardSkeleton({ className }: StatsCardSkeletonProps) {
  return (
    <div className={cn("text-center", className)}>
      <Skeleton className="mx-auto mb-2 h-9 w-20" />
      <Skeleton className="mx-auto h-4 w-24" />
    </div>
  );
}

/**
 * Skeleton for RelatedGames section
 * Used as Suspense fallback for async-loaded related games
 */
export function RelatedGamesSkeleton() {
  return (
    <section aria-label="Loading related games">
      <Skeleton className="h-8 w-64" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Thumbnail skeleton */}
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full" />
            </div>
            {/* Info skeleton */}
            <div className="mt-3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              {/* Meta skeleton */}
              <div className="mt-3 flex items-center gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
