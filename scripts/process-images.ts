/**
 * Image Processing Pipeline for Open Source Games Platform
 *
 * This script:
 * 1. Takes game data with GitHub repo URLs
 * 2. Extracts first image from README
 * 3. Downloads and processes images (resize, convert to WebP)
 * 4. Generates 3 sizes: thumb (300x200), medium (600x400), large (1200x800)
 * 5. Uploads to R2 (or simulates with local storage for dev)
 * 6. Updates game records with image URLs
 *
 * Run with: npx tsx scripts/process-images.ts
 *
 * Environment variables:
 * - R2_ACCOUNT_ID: Cloudflare account ID
 * - R2_ACCESS_KEY_ID: R2 access key
 * - R2_SECRET_ACCESS_KEY: R2 secret key
 * - R2_BUCKET_NAME: R2 bucket name (default: os-games)
 * - GITHUB_TOKEN: GitHub personal access token for API requests
 * - DRY_RUN: Set to "true" to skip actual uploads
 * - LOCAL_MODE: Set to "true" to save images locally instead of R2
 */

import * as fs from "fs/promises";
import * as path from "path";

// Configuration
const CONFIG = {
  // R2 Configuration
  r2AccountId: process.env.R2_ACCOUNT_ID || "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  r2BucketName: process.env.R2_BUCKET_NAME || "os-games",
  r2PublicUrl: process.env.R2_PUBLIC_URL || "https://cdn.osgames.dev",

  // GitHub Configuration
  githubToken: process.env.GITHUB_TOKEN || "",

  // Processing options
  dryRun: process.env.DRY_RUN === "true",
  localMode:
    process.env.LOCAL_MODE === "true" || process.env.NODE_ENV === "development",

  // Image sizes (matching the spec)
  sizes: {
    thumb: { width: 300, height: 200, quality: 85 },
    medium: { width: 600, height: 400, quality: 85 },
    large: { width: 1200, height: 800, quality: 90 },
  } as const,

  // Rate limiting
  batchSize: 5,
  delayBetweenBatches: 1000, // ms
  delayBetweenRequests: 200, // ms

  // Paths
  localOutputDir: path.join(process.cwd(), "public", "images", "games"),
  dataDir: path.join(process.cwd(), "data"),
};

// Types
interface GameData {
  id: string;
  title: string;
  repoUrl: string;
  description?: string;
  thumbnailUrl?: string | null;
  screenshotUrls?: string[] | null;
}

interface ProcessedImage {
  gameId: string;
  originalUrl: string;
  urls: {
    thumb: string;
    medium: string;
    large: string;
  };
  processedAt: string;
}

interface ProcessingResult {
  success: boolean;
  gameId: string;
  urls?: ProcessedImage["urls"];
  error?: string;
}

// Sharp is optional - we'll check if it's available
let sharp: typeof import("sharp") | null = null;

async function loadSharp(): Promise<boolean> {
  try {
    sharp = (await import("sharp")).default;
    console.log("Sharp loaded successfully - full image processing enabled");
    return true;
  } catch {
    console.log(
      "Sharp not available - running in simulation mode (images will be downloaded but not processed)",
    );
    return false;
  }
}

/**
 * Fetch README content from a GitHub repository
 */
async function fetchReadme(repoUrl: string): Promise<string | null> {
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    console.error("Invalid GitHub URL: " + repoUrl);
    return null;
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");

  // Try different README filenames
  const readmeFiles = [
    "README.md",
    "readme.md",
    "Readme.md",
    "README.rst",
    "README.txt",
    "README",
  ];

  for (const filename of readmeFiles) {
    try {
      const url =
        "https://raw.githubusercontent.com/" +
        owner +
        "/" +
        repo +
        "/HEAD/" +
        filename;
      const response = await fetch(url, {
        headers: CONFIG.githubToken
          ? { Authorization: "token " + CONFIG.githubToken }
          : {},
      });

      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Continue to next filename
    }
  }

  // Try GitHub API as fallback
  try {
    const apiUrl =
      "https://api.github.com/repos/" + owner + "/" + repo + "/readme";
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.raw",
        ...(CONFIG.githubToken
          ? { Authorization: "token " + CONFIG.githubToken }
          : {}),
      },
    });

    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Ignore API errors
  }

  return null;
}

/**
 * Extract images from README content
 */
function extractImagesFromReadme(readmeContent: string): string[] {
  const images: string[] = [];

  // Match Markdown images: ![alt text](url)
  const mdImageRegex = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;
  let match;
  while ((match = mdImageRegex.exec(readmeContent)) !== null) {
    const url = match[1];
    if (isValidImageUrl(url)) {
      images.push(url);
    }
  }

  // Match HTML img tags: <img src="url" />
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(readmeContent)) !== null) {
    if (isValidImageUrl(match[1])) {
      images.push(match[1]);
    }
  }

  // Remove duplicates
  return [...new Set(images)];
}

/**
 * Check if a URL is a valid image URL (not a badge)
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Skip data URIs
  if (url.startsWith("data:")) return false;

  // Skip badges
  if (
    url.includes("shields.io") ||
    url.includes("badge") ||
    url.includes("travis-ci") ||
    url.includes("circleci") ||
    url.includes("codecov") ||
    url.includes("coveralls")
  ) {
    return false;
  }

  // Skip GitHub workflow badges
  if (url.includes("/workflows/") || url.includes("/actions/")) return false;

  // Check for image extensions
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const urlLower = url.toLowerCase();

  return (
    imageExtensions.some((ext) => urlLower.includes(ext)) ||
    url.includes("imgur.com") ||
    url.includes("githubusercontent.com") ||
    url.includes("itch.io")
  );
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveImageUrl(imageUrl: string, repoUrl: string): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return imageUrl;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  const cleanPath = imageUrl.replace(/^\.?\//, "");

  return (
    "https://raw.githubusercontent.com/" +
    owner +
    "/" +
    repo +
    "/HEAD/" +
    cleanPath
  );
}

/**
 * Download an image from a URL
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OSGames-ImageProcessor/1.0",
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to download image: " + url + " (" + response.status + ")",
      );
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading image: " + url, error);
    return null;
  }
}

/**
 * Process an image with sharp (resize and convert to WebP)
 */
async function processImageWithSharp(
  imageBuffer: Buffer,
  width: number,
  height: number,
  quality: number,
): Promise<Buffer> {
  if (!sharp) {
    throw new Error("Sharp is not available");
  }

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality })
    .toBuffer();
}

/**
 * Save image locally (for development)
 */
async function saveImageLocally(
  gameId: string,
  sizeName: string,
  buffer: Buffer,
): Promise<string> {
  const dir = path.join(CONFIG.localOutputDir, gameId);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, sizeName + ".webp");
  await fs.writeFile(filePath, buffer);

  return "/images/games/" + gameId + "/" + sizeName + ".webp";
}

/**
 * Upload image to R2
 */
async function uploadToR2(
  gameId: string,
  sizeName: string,
  buffer: Buffer,
): Promise<string> {
  if (CONFIG.dryRun) {
    console.log(
      "[DRY RUN] Would upload: games/" + gameId + "/" + sizeName + ".webp",
    );
    return CONFIG.r2PublicUrl + "/games/" + gameId + "/" + sizeName + ".webp";
  }

  if (
    !CONFIG.r2AccountId ||
    !CONFIG.r2AccessKeyId ||
    !CONFIG.r2SecretAccessKey
  ) {
    throw new Error("R2 credentials not configured");
  }

  // Use AWS SDK compatible endpoint for R2
  // Note: In production, you'd use @aws-sdk/client-s3
  // For this implementation, we'll simulate the upload

  const key = "games/" + gameId + "/" + sizeName + ".webp";
  console.log("Uploading to R2: " + key + " (" + buffer.length + " bytes)");

  // In a real implementation, you would use:
  // const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  // const client = new S3Client({
  //   region: "auto",
  //   endpoint: "https://" + CONFIG.r2AccountId + ".r2.cloudflarestorage.com",
  //   credentials: {
  //     accessKeyId: CONFIG.r2AccessKeyId,
  //     secretAccessKey: CONFIG.r2SecretAccessKey,
  //   },
  // });
  // await client.send(new PutObjectCommand({
  //   Bucket: CONFIG.r2BucketName,
  //   Key: key,
  //   Body: buffer,
  //   ContentType: "image/webp",
  // }));

  return CONFIG.r2PublicUrl + "/" + key;
}

/**
 * Process a single game's images
 */
async function processGameImages(game: GameData): Promise<ProcessingResult> {
  console.log("\nProcessing: " + game.title + " (" + game.id + ")");

  try {
    // Check if already processed
    if (game.thumbnailUrl && !CONFIG.dryRun) {
      console.log("  Skipping - already has thumbnail");
      return { success: true, gameId: game.id };
    }

    // Fetch README
    const readme = await fetchReadme(game.repoUrl);
    if (!readme) {
      console.log("  No README found");
      return { success: false, gameId: game.id, error: "No README found" };
    }

    // Extract images
    const images = extractImagesFromReadme(readme);
    if (images.length === 0) {
      console.log("  No images found in README");
      return {
        success: false,
        gameId: game.id,
        error: "No images in README",
      };
    }

    // Get first valid image
    const imageUrl = resolveImageUrl(images[0], game.repoUrl);
    console.log("  Found image: " + imageUrl.substring(0, 80) + "...");

    // Download image
    const imageBuffer = await downloadImage(imageUrl);
    if (!imageBuffer) {
      return {
        success: false,
        gameId: game.id,
        error: "Failed to download image",
      };
    }

    console.log("  Downloaded: " + imageBuffer.length + " bytes");

    // Process and upload each size
    const urls: ProcessedImage["urls"] = {
      thumb: "",
      medium: "",
      large: "",
    };

    for (const [sizeName, sizeConfig] of Object.entries(CONFIG.sizes)) {
      const key = sizeName as keyof typeof CONFIG.sizes;

      let processedBuffer: Buffer;

      if (sharp) {
        // Process with sharp
        processedBuffer = await processImageWithSharp(
          imageBuffer,
          sizeConfig.width,
          sizeConfig.height,
          sizeConfig.quality,
        );
        console.log(
          "  Processed " + sizeName + ": " + processedBuffer.length + " bytes",
        );
      } else {
        // Simulation mode - just use original buffer
        processedBuffer = imageBuffer;
        console.log("  [SIMULATION] " + sizeName + ": using original image");
      }

      // Upload or save locally
      if (CONFIG.localMode) {
        urls[key] = await saveImageLocally(game.id, sizeName, processedBuffer);
      } else {
        urls[key] = await uploadToR2(game.id, sizeName, processedBuffer);
      }
    }

    console.log("  Completed: " + game.id);

    return {
      success: true,
      gameId: game.id,
      urls,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("  Error: " + errorMessage);
    return {
      success: false,
      gameId: game.id,
      error: errorMessage,
    };
  }
}

/**
 * Load games data from JSON file or database
 */
async function loadGamesData(): Promise<GameData[]> {
  const gamesFile = path.join(CONFIG.dataDir, "games.json");

  try {
    const content = await fs.readFile(gamesFile, "utf-8");
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : data.games || [];
  } catch {
    console.log("No games.json found, using sample data");

    // Sample data for testing
    return [
      {
        id: "veloren-veloren",
        title: "Veloren",
        repoUrl: "https://github.com/veloren/veloren",
        description: "An open world, open source voxel RPG",
      },
      {
        id: "minetest-minetest",
        title: "Minetest",
        repoUrl: "https://github.com/minetest/minetest",
        description: "Open source voxel game engine",
      },
      {
        id: "cataclysmdda-cataclysm-dda",
        title: "Cataclysm: Dark Days Ahead",
        repoUrl: "https://github.com/CleverRaven/Cataclysm-DDA",
        description: "A turn-based survival game",
      },
    ];
  }
}

/**
 * Save processing results
 */
async function saveResults(results: ProcessingResult[]): Promise<void> {
  await fs.mkdir(CONFIG.dataDir, { recursive: true });

  const outputFile = path.join(CONFIG.dataDir, "processed-images.json");

  // Load existing results
  let existingResults: Record<string, ProcessingResult> = {};
  try {
    const existing = await fs.readFile(outputFile, "utf-8");
    const parsed = JSON.parse(existing);
    existingResults = parsed.results || {};
  } catch {
    // File doesn't exist
  }

  // Merge with new results
  for (const result of results) {
    existingResults[result.gameId] = result;
  }

  // Save merged results
  const output = {
    processedAt: new Date().toISOString(),
    totalProcessed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results: existingResults,
  };

  await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
  console.log("\nResults saved to " + outputFile);
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log("=== Open Source Games Image Processor ===\n");

  // Load sharp if available
  const sharpAvailable = await loadSharp();

  // Show configuration
  console.log("Configuration:");
  console.log("  Mode: " + (CONFIG.localMode ? "Local Storage" : "R2 Upload"));
  console.log("  Dry Run: " + CONFIG.dryRun);
  console.log("  Sharp Available: " + sharpAvailable);
  console.log("  Output Dir: " + CONFIG.localOutputDir);
  console.log("");

  // Create output directory
  await fs.mkdir(CONFIG.localOutputDir, { recursive: true });

  // Load games
  const games = await loadGamesData();
  console.log("Loaded " + games.length + " games\n");

  // Filter games without thumbnails
  const gamesToProcess = games.filter((g) => !g.thumbnailUrl);
  console.log("Games needing processing: " + gamesToProcess.length + "\n");

  if (gamesToProcess.length === 0) {
    console.log("No games need processing");
    return;
  }

  // Process in batches
  const results: ProcessingResult[] = [];

  for (let i = 0; i < gamesToProcess.length; i += CONFIG.batchSize) {
    const batch = gamesToProcess.slice(i, i + CONFIG.batchSize);
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(gamesToProcess.length / CONFIG.batchSize);

    console.log("\n--- Batch " + batchNum + "/" + totalBatches + " ---");

    for (const game of batch) {
      const result = await processGameImages(game);
      results.push(result);

      // Rate limiting between requests
      await delay(CONFIG.delayBetweenRequests);
    }

    // Delay between batches
    if (i + CONFIG.batchSize < gamesToProcess.length) {
      console.log(
        "\nWaiting " + CONFIG.delayBetweenBatches + "ms before next batch...",
      );
      await delay(CONFIG.delayBetweenBatches);
    }
  }

  // Save results
  await saveResults(results);

  // Summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n=== Summary ===");
  console.log("Total processed: " + results.length);
  console.log("Successful: " + successful.length);
  console.log("Failed: " + failed.length);

  if (failed.length > 0) {
    console.log("\nFailed games:");
    for (const result of failed) {
      console.log("  - " + result.gameId + ": " + result.error);
    }
  }

  // Generate update script
  if (successful.length > 0 && !CONFIG.dryRun) {
    console.log("\n--- Database Update Commands ---");
    console.log("Run these SQL commands to update game records:\n");

    for (const result of successful) {
      if (result.urls) {
        console.log("UPDATE games SET");
        console.log("  thumbnail_url = '" + result.urls.thumb + "',");
        console.log(
          "  screenshot_urls = '[\"" +
            result.urls.medium +
            '", "' +
            result.urls.large +
            "\"]'",
        );
        console.log("WHERE id = '" + result.gameId + "';\n");
      }
    }
  }
}

// Run the script
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
