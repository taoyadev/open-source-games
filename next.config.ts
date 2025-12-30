import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Memory optimization for development
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 3,
  },

  // Enable static export for Cloudflare Pages
  // @see https://developers.cloudflare.com/pages/framework-guides/nextjs/

  // Image optimization configuration for R2
  images: {
    // Use custom loader for R2 bucket images
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // Allowed remote patterns for external images (GitHub avatars, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
    // Image formats for optimization
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for art direction
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (in seconds)
    minimumCacheTTL: 86400, // 24 hours
  },

  // Performance optimizations
  compress: true, // Enable gzip compression

  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Content Security Policy to prevent XSS attacks
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for Next.js
              "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for styled-components/emotion
              "img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://*.r2.cloudflarestorage.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.r2.cloudflarestorage.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        // Cache static assets with long TTL
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache sitemap with short TTL for freshness
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        // Cache robots.txt
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      // Redirect common variations
      {
        source: "/game/:path*",
        destination: "/games/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
