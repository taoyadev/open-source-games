import { useMemo } from "react";

interface ResourceHint {
  href: string;
  type: "dns-prefetch" | "preconnect" | "prefetch" | "prerender" | "preload";
  as?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
}

interface ResourceHintsProps {
  hints?: ResourceHint[];
}

/**
 * Resource preloading and connection hints for performance optimization
 *
 * Usage:
 * - Add to layout for global hints
 * - Add dns-prefetch for external domains
 * - Add preconnect for critical domains
 * - Add prefetch for likely next pages
 * - Add prerender for critical next pages (Chrome only)
 */
export function ResourceHints({ hints = defaultHints }: ResourceHintsProps) {
  const hintElements = useMemo(() => {
    return hints.map((hint, index) => {
      const rel = hint.type;
      const key = `${rel}-${index}`;

      return (
        <link
          key={key}
          rel={rel}
          href={hint.href}
          as={hint.as}
          {...(hint.crossOrigin ? { crossOrigin: hint.crossOrigin } : {})}
        />
      );
    });
  }, [hints]);

  return <>{hintElements}</>;
}

/**
 * Default resource hints for OpenGames
 */
const defaultHints: ResourceHint[] = [
  // DNS prefetch for external domains
  { type: "dns-prefetch", href: "https://avatars.githubusercontent.com" },
  { type: "dns-prefetch", href: "https://raw.githubusercontent.com" },
  { type: "dns-prefetch", href: "https://github.com" },

  // Preconnect for critical domains
  {
    type: "preconnect",
    href: "https://avatars.githubusercontent.com",
    crossOrigin: "anonymous",
  },

  // Prefetch for likely next pages
  { type: "prefetch", href: "/games" },
  { type: "prefetch", href: "/category" },
];

/**
 * Image preload hints for LCP optimization
 * Generate these dynamically for hero images
 */
export function ImagePreload({
  src,
  fetchPriority = "auto",
  imageSizes = "100vw",
}: {
  src: string;
  fetchPriority?: "auto" | "high" | "low";
  imageSizes?: string;
}) {
  return (
    <link
      rel="preload"
      as="image"
      href={src}
      fetchPriority={fetchPriority}
      imageSizes={imageSizes}
    />
  );
}

/**
 * Font preload hints for text rendering optimization
 */
export function FontPreload({
  href,
  crossOrigin = "anonymous",
}: {
  href: string;
  crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
}) {
  return <link rel="preload" as="font" href={href} crossOrigin={crossOrigin} />;
}
