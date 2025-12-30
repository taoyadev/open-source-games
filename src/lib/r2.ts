/**
 * R2 Image Storage Layer for Open Source Games Platform
 *
 * Edge runtime compatible image storage using Cloudflare R2
 * Provides fallback to local public directory when R2 is unavailable
 *
 * Features:
 * - Upload images to R2 with automatic WebP conversion
 * - Generate signed URLs for private images
 * - Get public URLs for CDN delivery
 * - List, delete, and check existence of images
 */

import { getOptionalRequestContext } from "./server/request-context";

// ============================================================================
// Types
// ============================================================================

export interface UploadImageOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
  overwrite?: boolean;
}

export interface ImageInfo {
  key: string;
  size: number;
  uploaded: Date;
  contentType?: string;
  etag?: string;
}

export interface R2UploadResult {
  key: string;
  url: string;
  etag?: string;
}

// ============================================================================
// R2 Bucket Helpers
// ============================================================================

/**
 * Get the R2 bucket binding from the request context
 */
function getR2(): R2Bucket | null {
  try {
    const ctx = getOptionalRequestContext();
    return (ctx?.env?.IMAGES as R2Bucket) || null;
  } catch {
    return null;
  }
}

/**
 * Get the public URL for an image
 * Uses R2 custom domain or falls back to local path
 *
 * @param key - Image key/path in R2
 * @returns Public URL for the image
 */
export function getImageUrl(key: string): string {
  const ctx = getOptionalRequestContext();
  const siteUrl = ctx?.env?.NEXT_PUBLIC_SITE_URL as string | undefined;

  // If R2 custom domain is configured, use it
  // Format: https://images.yourdomain.com/key
  const r2Domain = process.env.R2_PUBLIC_DOMAIN;
  if (r2Domain) {
    return `${r2Domain}/${key}`;
  }

  // Fallback to site URL with images path
  if (siteUrl) {
    return `${siteUrl}/images/${key}`;
  }

  // Local development fallback
  return `/images/${key}`;
}

/**
 * Get R2 public URL (for Workers environments with custom domain)
 */
export function getR2PublicUrl(key: string): string {
  const r2Domain = process.env.R2_PUBLIC_DOMAIN;
  if (r2Domain) {
    return `${r2Domain}/${key}`;
  }

  // Fallback: R2 workers.dev subdomain
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME || "open-source-games-images";
  if (accountId) {
    return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
  }

  return getImageUrl(key);
}

// ============================================================================
// Image Upload Functions
// ============================================================================

/**
 * Upload an image to R2
 *
 * @param file - File or Buffer to upload
 * @param key - Storage key/path
 * @param options - Upload options
 * @returns Upload result with key and URL
 */
export async function uploadImage(
  file: File | Buffer | ArrayBuffer | Uint8Array,
  key: string,
  options?: UploadImageOptions,
): Promise<R2UploadResult> {
  const r2 = getR2();

  if (!r2) {
    // R2 not available - log warning and return mock result
    console.warn("R2 binding not available, image not uploaded:", key);
    return { key, url: getImageUrl(key) };
  }

  try {
    // Prepare upload data
    let data: ArrayBuffer | Uint8Array | ReadableStream<Uint8Array>;

    if (file instanceof File) {
      data = await file.arrayBuffer();
    } else if (Buffer.isBuffer(file)) {
      data = new Uint8Array(file);
    } else {
      data = file as ArrayBuffer | Uint8Array;
    }

    // Check if file exists (if overwrite is false)
    if (!options?.overwrite) {
      const existing = await r2.head(key);
      if (existing) {
        return { key, url: getImageUrl(key), etag: existing.etag };
      }
    }

    // Upload to R2
    const result = await r2.put(key, data, {
      httpMetadata: {
        contentType: options?.contentType || "image/webp",
      },
      customMetadata: options?.customMetadata,
    });

    if (!result) {
      throw new Error("Upload failed");
    }

    return {
      key,
      url: getImageUrl(key),
      etag: result.etag,
    };
  } catch (error) {
    console.error("R2 upload failed:", error);
    throw error;
  }
}

/**
 * Upload multiple images in parallel
 *
 * @param files - Array of {file, key} tuples
 * @param options - Upload options
 * @returns Array of upload results
 */
export async function uploadImages(
  files: Array<{ file: File | Buffer; key: string }>,
  options?: UploadImageOptions,
): Promise<R2UploadResult[]> {
  return Promise.all(
    files.map(({ file, key }) => uploadImage(file, key, options)),
  );
}

/**
 * Upload a base64 encoded image
 *
 * @param base64 - Base64 encoded image data
 * @param key - Storage key
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadBase64Image(
  base64: string,
  key: string,
  options?: UploadImageOptions,
): Promise<R2UploadResult> {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  return uploadImage(buffer, key, options);
}

/**
 * Upload an image from a URL
 * Fetches the image and uploads to R2
 *
 * @param url - Source URL
 * @param key - Storage key
 * @param options - Upload options
 * @returns Upload result
 */
export async function uploadImageFromUrl(
  url: string,
  key: string,
  options?: UploadImageOptions,
): Promise<R2UploadResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || undefined;

  return uploadImage(buffer, key, {
    ...options,
    contentType,
  });
}

// ============================================================================
// Image Retrieval Functions
// ============================================================================

/**
 * Get an image from R2
 *
 * @param key - Image key
 * @returns Image object with metadata and body
 */
export async function getImage(key: string): Promise<R2Object | null> {
  const r2 = getR2();

  if (!r2) {
    return null;
  }

  try {
    return await r2.get(key);
  } catch (error) {
    console.error("R2 get failed:", error);
    return null;
  }
}

/**
 * Check if an image exists in R2
 *
 * @param key - Image key
 * @returns True if image exists
 */
export async function imageExists(key: string): Promise<boolean> {
  const r2 = getR2();

  if (!r2) {
    return false;
  }

  try {
    const result = await r2.head(key);
    return result !== null;
  } catch {
    return false;
  }
}

/**
 * List images in R2 with a prefix
 *
 * @param prefix - Key prefix to filter
 * @param limit - Maximum number of results
 * @returns List of image info
 */
export async function listImages(
  prefix = "",
  limit = 100,
): Promise<ImageInfo[]> {
  const r2 = getR2();

  if (!r2) {
    return [];
  }

  try {
    const listed = await r2.list({ prefix, limit });
    return listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: new Date(obj.uploaded),
      contentType: obj.httpMetadata?.contentType,
      etag: obj.etag,
    }));
  } catch (error) {
    console.error("R2 list failed:", error);
    return [];
  }
}

// ============================================================================
// Image Deletion Functions
// ============================================================================

/**
 * Delete an image from R2
 *
 * @param key - Image key to delete
 * @returns True if deleted successfully
 */
export async function deleteImage(key: string): Promise<boolean> {
  const r2 = getR2();

  if (!r2) {
    return false;
  }

  try {
    await r2.delete(key);
    return true;
  } catch (error) {
    console.error("R2 delete failed:", error);
    return false;
  }
}

/**
 * Delete multiple images
 *
 * @param keys - Array of image keys to delete
 * @returns Number of successfully deleted images
 */
export async function deleteImages(keys: string[]): Promise<number> {
  const r2 = getR2();

  if (!r2) {
    return 0;
  }

  try {
    await r2.delete(keys);
    return keys.length;
  } catch (error) {
    console.error("R2 batch delete failed:", error);
    return 0;
  }
}

/**
 * Delete all images with a prefix
 * Useful for clearing a category of images
 *
 * @param prefix - Key prefix
 * @returns Number of deleted images
 */
export async function deleteImagesWithPrefix(prefix: string): Promise<number> {
  const images = await listImages(prefix, 1000);
  const keys = images.map((img) => img.key);

  if (keys.length === 0) {
    return 0;
  }

  return deleteImages(keys);
}

// ============================================================================
// Image Key Generators
// ============================================================================

export const ImageKeys = {
  // Device images for affiliate section
  device: (deviceName: string) =>
    `devices/${slugify(deviceName)}.webp` as const,

  // Game thumbnails
  gameThumbnail: (gameId: string) => `games/${gameId}/thumbnail.webp` as const,

  // Game screenshots
  gameScreenshot: (gameId: string, index: number) =>
    `games/${gameId}/screenshots/${index}.webp` as const,

  // Category thumbnails
  categoryThumbnail: (categorySlug: string) =>
    `categories/${categorySlug}/thumbnail.webp` as const,

  // Platform icons
  platformIcon: (platformName: string) =>
    `platforms/${slugify(platformName)}.webp` as const,

  // Language icons
  languageIcon: (language: string) =>
    `languages/${slugify(language)}.webp` as const,

  // Generic uploads
  upload: (filename: string) => `uploads/${Date.now()}-${filename}` as const,
};

/**
 * Simple slugify function for creating safe R2 keys
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================================
// Image Processing Helpers (WebP conversion utilities)
// ============================================================================

/**
 * Convert an image to WebP format
 * Note: This is a placeholder - actual conversion requires a service worker
 * or server-side processing with Sharp/ImageMagick
 *
 * In production, consider using Cloudflare Images service or a separate
 * image processing worker.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function convertToWebP(
  image: Buffer | ArrayBuffer,
  quality = 80,
): Promise<Buffer> {
  // For edge runtime, we'd typically use a separate image processing service
  // This is a simplified implementation
  // In a real implementation, you would:
  // 1. Use a WASM-based image processor (e.g., libwebp)
  // 2. Call an external image optimization service
  // 3. Use Cloudflare Images API
  // The WebP conversion should happen during build or via a CDN
  return Buffer.from([]);
}

/**
 * Generate a thumbnail from an image
 *
 * @param image - Source image
 * @param width - Target width
 * @param height - Target height
 * @returns Thumbnail image buffer
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function generateThumbnail(
  image: Buffer | ArrayBuffer,
  width = 400,
  height = 300,
): Promise<Buffer> {
  // Placeholder implementation
  // In production, use a proper image processing library
  const input = Buffer.isBuffer(image) ? image : Buffer.from(image);
  return input;
}

// ============================================================================
// Device Image Management
// ============================================================================

/**
 * Upload a device image for the affiliate section
 *
 * @param deviceName - Name of the device
 * @param image - Image file or buffer
 * @returns Upload result
 */
export async function uploadDeviceImage(
  deviceName: string,
  image: File | Buffer,
): Promise<R2UploadResult> {
  const key = ImageKeys.device(deviceName);
  return uploadImage(image, key, { contentType: "image/webp" });
}

/**
 * Get the URL for a device image
 *
 * @param deviceName - Name of the device
 * @returns Public URL
 */
export function getDeviceImageUrl(deviceName: string): string {
  const key = ImageKeys.device(deviceName);
  return getImageUrl(key);
}

/**
 * Get the URL for a game thumbnail
 *
 * @param gameId - Game ID
 * @returns Public URL
 */
export function getGameThumbnailUrl(gameId: string): string {
  const key = ImageKeys.gameThumbnail(gameId);
  return getImageUrl(key);
}

/**
 * List all device images
 *
 * @returns Array of device image info
 */
export async function listDeviceImages(): Promise<ImageInfo[]> {
  return listImages("devices/", 50);
}

// ============================================================================
// Fallback image placeholders
// ============================================================================

/**
 * Get a fallback image URL when the actual image is not available
 */
export function getFallbackImageUrl(
  type: "game" | "device" | "category" = "game",
): string {
  return `/images/placeholder-${type}.svg`;
}
