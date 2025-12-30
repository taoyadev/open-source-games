import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

/**
 * Robots.txt configuration
 * Allows all crawlers, points to sitemap, disallows API routes
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
