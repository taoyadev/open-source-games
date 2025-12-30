"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  structuredData?: boolean;
}

/**
 * Breadcrumb navigation component with Schema.org BreadcrumbList support
 * Provides visual navigation trail and SEO-structured data
 */
export function Breadcrumb({
  items,
  className,
  structuredData = true,
}: BreadcrumbProps) {
  // Generate Schema.org BreadcrumbList structured data
  const generateStructuredData = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://osgames.dev";

    const itemListElement = items.map((item, index) => {
      const listItem: {
        "@type": string;
        position: number;
        name: string;
        item?: string;
      } = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };

      if (item.href) {
        // Convert relative URLs to absolute
        listItem.item =
          item.href.startsWith("http") || item.href.startsWith("//")
            ? item.href
            : `${siteUrl}${item.href}`;
      }

      return listItem;
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  };

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData()),
          }}
        />
      )}

      <nav
        className={cn("flex items-center space-x-1 text-sm", className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {/* Home link - always first unless explicitly overridden */}
          {!items.some((i) => i.name === "Home") && (
            <li className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
          )}

          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              {item.href && !item.current ? (
                <Link
                  href={item.href}
                  className="ml-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={cn(
                    "ml-1",
                    item.current
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400",
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Generate breadcrumb items for a game page
 */
export function getGameBreadcrumbItems(
  gameTitle: string,
  category?: string,
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "Games", href: "/games" },
    { name: gameTitle, current: true },
  ];

  if (category) {
    items.splice(1, 0, { name: category, href: `/category/${category}` });
  }

  return items;
}

/**
 * Generate breadcrumb items for a category page
 */
export function getCategoryBreadcrumbItems(
  categoryTitle: string,
  categorySlug: string,
): BreadcrumbItem[] {
  return [
    { name: "Categories", href: "/category" },
    { name: categoryTitle, href: `/category/${categorySlug}`, current: true },
  ];
}
