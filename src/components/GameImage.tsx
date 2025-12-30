"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  getImageUrl,
  getImageSizes,
  getFallbackEmoji,
  getFallbackEmojiByName,
  type ImageSize,
} from "@/lib/images";

export interface GameImageProps {
  /** Game's unique ID for fetching processed images */
  gameId: string;
  /** Game title for alt text */
  title: string;
  /** Primary genre for fallback emoji */
  genre?: string | null;
  /** Direct thumbnail URL (overrides gameId-based URL) */
  thumbnailUrl?: string | null;
  /** Preferred image size */
  size?: ImageSize;
  /** Fill parent container */
  fill?: boolean;
  /** Fixed width (when not using fill) */
  width?: number;
  /** Fixed height (when not using fill) */
  height?: number;
  /** Image priority for LCP optimization */
  priority?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
  /** Show loading skeleton */
  showSkeleton?: boolean;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * Responsive game image component with lazy loading and fallback support
 *
 * Features:
 * - Automatic WebP format from R2/CDN
 * - Responsive srcset for different screen sizes
 * - Fallback to emoji based on genre/name
 * - Loading skeleton animation
 * - Error handling with automatic fallback
 */
export function GameImage({
  gameId,
  title,
  genre,
  thumbnailUrl,
  size = "medium",
  fill = false,
  width,
  height,
  priority = false,
  className,
  containerClassName,
  showSkeleton = true,
  onLoad,
  onError,
}: GameImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine the image source
  const imageSrc = thumbnailUrl || getImageUrl(gameId, size);
  const hasValidImage = !!thumbnailUrl || !!gameId;

  // Get fallback emoji
  const fallbackEmoji = genre
    ? getFallbackEmoji(genre)
    : getFallbackEmojiByName(title);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setImageError(true);
    onError?.();
  }, [onError]);

  // Render fallback emoji
  if (!hasValidImage || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
          fill ? "absolute inset-0" : "",
          containerClassName,
        )}
        style={!fill ? { width, height } : undefined}
        role="img"
        aria-label={`${title} placeholder`}
      >
        <span className="text-6xl select-none" aria-hidden="true">
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  // Image container classes
  const containerClasses = cn(
    "relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
    containerClassName,
  );

  // Image classes
  const imageClasses = cn(
    "object-cover transition-opacity duration-300",
    isLoading ? "opacity-0" : "opacity-100",
    className,
  );

  if (fill) {
    return (
      <div className={containerClasses}>
        {/* Loading skeleton */}
        {showSkeleton && isLoading && (
          <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
        )}

        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes={getImageSizes()}
          className={imageClasses}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  // Fixed dimensions
  const imgWidth = width || 600;
  const imgHeight = height || 400;

  return (
    <div
      className={containerClasses}
      style={{ width: imgWidth, height: imgHeight }}
    >
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
      )}

      <Image
        src={imageSrc}
        alt={title}
        width={imgWidth}
        height={imgHeight}
        sizes={getImageSizes()}
        className={imageClasses}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

/**
 * Thumbnail variant for game cards
 */
export function GameThumbnail({
  gameId,
  title,
  genre,
  thumbnailUrl,
  className,
  priority = false,
}: Pick<
  GameImageProps,
  "gameId" | "title" | "genre" | "thumbnailUrl" | "className" | "priority"
>) {
  return (
    <GameImage
      gameId={gameId}
      title={title}
      genre={genre}
      thumbnailUrl={thumbnailUrl}
      size="thumb"
      fill
      priority={priority}
      containerClassName={cn("aspect-video w-full", className)}
    />
  );
}

/**
 * Large image variant for game detail pages
 */
export function GameHeroImage({
  gameId,
  title,
  genre,
  thumbnailUrl,
  className,
}: Pick<
  GameImageProps,
  "gameId" | "title" | "genre" | "thumbnailUrl" | "className"
>) {
  return (
    <GameImage
      gameId={gameId}
      title={title}
      genre={genre}
      thumbnailUrl={thumbnailUrl}
      size="large"
      fill
      priority
      containerClassName={cn(
        "aspect-video w-full rounded-lg overflow-hidden",
        className,
      )}
    />
  );
}

/**
 * Screenshot gallery image
 */
export function GameScreenshot({
  src,
  alt,
  className,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 rounded-lg",
          className,
        )}
      >
        <span className="text-zinc-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800 cursor-pointer group",
        className,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-zinc-300 dark:bg-zinc-700" />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          "group-hover:scale-105",
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setImageError(true)}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </div>
  );
}

export default GameImage;
