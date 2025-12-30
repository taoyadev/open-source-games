/**
 * Custom Image Loader for Cloudflare R2
 *
 * This loader handles image URLs for Next.js Image component when deployed to Cloudflare Pages.
 * It supports both R2 bucket images and external URLs (GitHub avatars, etc.)
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/images#loaders
 */

interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderParams): string {
  // If the source is already an absolute URL, return as-is with optional width param
  if (src.startsWith("http://") || src.startsWith("https://")) {
    // For GitHub raw content, we can use the URL directly
    if (
      src.includes("githubusercontent.com") ||
      src.includes("raw.githubusercontent.com")
    ) {
      return src;
    }
    // For other external URLs, return as-is
    return src;
  }

  // For R2 bucket images, construct the URL
  // In production, this would be your R2 custom domain or public bucket URL
  const r2BaseUrl =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "https://images.open-source-games.pages.dev";

  // Build URL with optional width and quality parameters
  const params = new URLSearchParams();
  if (width) params.set("width", width.toString());
  if (quality) params.set("quality", quality.toString());

  const queryString = params.toString();
  const separator = src.includes("?") ? "&" : "?";

  return `${r2BaseUrl}${src}${queryString ? separator + queryString : ""}`;
}
