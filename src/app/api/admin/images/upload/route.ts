/**
 * Admin API: Upload Images to R2
 *
 * POST /api/admin/images/upload
 *
 * Uploads device or game images to R2 storage.
 * Requires authentication in production.
 *
 * Request body (multipart/form-data):
 * - file: Image file to upload
 * - type: Image type ("device", "game-thumbnail", "game-screenshot")
 * - deviceName: Device name (for type="device")
 * - gameId: Game ID (for type="game-*")
 * - index: Screenshot index (for type="game-screenshot")
 *
 * Response:
 * - success: true/false
 * - data: { key, url }
 * - error: error message
 */

export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { uploadImage, ImageKeys } from "@/lib/r2";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed content types
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * Verify authentication
 * SECURITY: Always requires ADMIN_API_KEY, even in development mode
 */
function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.ADMIN_API_KEY;

  // Always require API key - no bypass for development mode
  if (!apiKey) {
    console.error("ADMIN_API_KEY environment variable is not set");
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const providedKey = authHeader.slice(7); // Remove "Bearer " prefix
  if (providedKey.length !== apiKey.length) {
    return false;
  }

  // Constant-time string comparison
  let result = 0;
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ providedKey.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a storage key based on the upload type
 */
function generateKey(params: {
  type: string;
  deviceName?: string;
  gameId?: string;
  index?: string;
}): string {
  const { type, deviceName, gameId, index } = params;

  switch (type) {
    case "device":
      if (!deviceName) {
        throw new Error("deviceName is required for device uploads");
      }
      return ImageKeys.device(deviceName);

    case "game-thumbnail":
      if (!gameId) {
        throw new Error("gameId is required for game-thumbnail uploads");
      }
      return ImageKeys.gameThumbnail(gameId);

    case "game-screenshot":
      if (!gameId) {
        throw new Error("gameId is required for game-screenshot uploads");
      }
      const screenshotIndex = index ? parseInt(index, 10) : 0;
      return ImageKeys.gameScreenshot(gameId, screenshotIndex);

    default:
      throw new Error(`Unknown upload type: ${type}`);
  }
}

/**
 * POST handler for image uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const deviceName = formData.get("deviceName") as string | null;
    const gameId = formData.get("gameId") as string | null;
    const index = formData.get("index") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "No type provided" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
        { status: 400 },
      );
    }

    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Generate storage key
    const key = generateKey({
      type,
      deviceName: deviceName || undefined,
      gameId: gameId || undefined,
      index: index || undefined,
    });

    // Upload to R2
    const result = await uploadImage(file, key, {
      contentType: file.type,
      overwrite: true,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        key: result.key,
        url: result.url,
        etag: result.etag,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

/**
 * GET handler - list available images
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Get R2 bucket
    const ctx = await getOptionalRequestContextAsync();
    const r2 = ctx?.env?.IMAGES as R2Bucket | undefined;

    if (!r2) {
      return NextResponse.json({
        success: true,
        data: {
          images: [],
          note: "R2 binding not available",
        },
      });
    }

    // List images with prefix based on type
    const prefix =
      type === "device" ? "devices/" : type === "game" ? "games/" : "";
    const listed = await r2.list({ prefix, limit: 100 });

    const images = listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: new Date(obj.uploaded).toISOString(),
      url: getImageUrlForKey(obj.key),
    }));

    return NextResponse.json({
      success: true,
      data: { images },
    });
  } catch (error) {
    console.error("Image list error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list images",
      },
      { status: 500 },
    );
  }
}

/**
 * Get public URL for an image key
 */
function getImageUrlForKey(key: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL as string | undefined;
  const r2Domain = process.env.R2_PUBLIC_DOMAIN;

  if (r2Domain) {
    return `${r2Domain}/${key}`;
  }

  if (siteUrl) {
    return `${siteUrl}/images/${key}`;
  }

  return `/images/${key}`;
}

/**
 * DELETE handler - delete an image
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "No key provided" },
        { status: 400 },
      );
    }

    // Get R2 bucket
    const ctx = await getOptionalRequestContextAsync();
    const r2 = ctx?.env?.IMAGES as R2Bucket | undefined;

    if (!r2) {
      return NextResponse.json({
        success: false,
        error: "R2 binding not available",
      });
    }

    await r2.delete(key);

    return NextResponse.json({
      success: true,
      data: { key },
    });
  } catch (error) {
    console.error("Image delete error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete image",
      },
      { status: 500 },
    );
  }
}
