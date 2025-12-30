/**
 * Cloudflare Environment Bindings Type Definitions
 *
 * Extends the CloudflareEnv interface with our specific bindings
 * @see https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-nextjs-site/#typescript-type-declarations
 */

// Extend the global CloudflareEnv interface from @cloudflare/next-on-pages
declare global {
  interface CloudflareEnv {
    /** D1 Database binding for games and categories */
    DB: D1Database;

    /** KV namespace for caching (required for production) */
    CACHE: KVNamespace;

    /** R2 bucket for game images (required for production) */
    IMAGES: R2Bucket;

    /** Optional: GitHub token for API requests */
    GITHUB_TOKEN?: string;

    /** Optional: OpenAI API key for AI review generation */
    OPENAI_API_KEY?: string;

    /** Site URL for absolute links (from NEXT_PUBLIC_SITE_URL) */
    NEXT_PUBLIC_SITE_URL?: string;

    /** GitHub repository URL */
    NEXT_PUBLIC_GITHUB_URL?: string;

    /** Twitter/Social media URL */
    NEXT_PUBLIC_TWITTER_URL?: string;

    /** Admin API key for protected endpoints */
    ADMIN_API_KEY?: string;

    /** R2 public domain for custom CDN URLs */
    R2_PUBLIC_DOMAIN?: string;

    /** R2 account ID for public URLs */
    R2_ACCOUNT_ID?: string;

    /** R2 bucket name */
    R2_BUCKET_NAME?: string;
  }

  namespace NodeJS {
    interface ProcessEnv {
      /** Site URL for absolute links */
      NEXT_PUBLIC_SITE_URL?: string;

      /** GitHub repository URL */
      NEXT_PUBLIC_GITHUB_URL?: string;

      /** Twitter/Social media URL */
      NEXT_PUBLIC_TWITTER_URL?: string;

      /** Admin API key for protected endpoints */
      ADMIN_API_KEY?: string;

      /** R2 public domain for custom CDN URLs */
      R2_PUBLIC_DOMAIN?: string;

      /** R2 account ID for public URLs */
      R2_ACCOUNT_ID?: string;

      /** R2 bucket name */
      R2_BUCKET_NAME?: string;
    }
  }
}

export {};
