import { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  sizes?: string;
  placeholder?: "blur" | "empty";
}

/**
 * Optimized image component with:
 * - Lazy loading for below-fold images
 * - Priority hints for above-fold images
 * - Proper sizes for responsive images
 * - Blur placeholder for smooth loading
 * - Error handling with fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  fill = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "empty",
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle image errors
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Fallback for error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <span
          className="text-zinc-400"
          role="img"
          aria-label="Image not available"
        >
          🎮
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${isLoading ? "animate-pulse bg-zinc-100 dark:bg-zinc-800" : ""} ${className || ""}`}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        placeholder={placeholder}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

/**
 * Game card image with optimized loading
 */
export function GameCardImage({
  src,
  alt,
}: {
  src: string | null | undefined;
  alt: string;
}) {
  const fallbackSrc = "/images/game-placeholder.svg";

  return (
    <OptimizedImage
      src={src || fallbackSrc}
      alt={alt}
      width={400}
      height={225}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      priority={false}
      className="aspect-video w-full rounded-t-xl object-cover"
    />
  );
}

/**
 * Hero image with highest priority for LCP optimization
 */
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={630}
      sizes="100vw"
      priority={true}
      className="w-full h-auto"
    />
  );
}
