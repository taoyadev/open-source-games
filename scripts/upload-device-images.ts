/**
 * Upload Device Images Script
 *
 * This script uploads default device images to R2 storage.
 * Run with: npx tsx scripts/upload-device-images.ts [--remote] [--local]
 *
 * Prerequisites:
 * - R2 bucket created: wrangler r2 bucket create open-source-games-images
 * - Device images placed in public/images/devices/ directory
 *
 * Options:
 * --remote: Use remote R2 bucket (production)
 * --local: Use local R2 bucket (development)
 * --dry-run: Print what would be uploaded without actually uploading
 */

import { uploadImage, ImageKeys } from "../src/lib/r2";

interface DeviceImage {
  name: string;
  filename: string;
}

// Default devices that need images uploaded
const DEVICES: DeviceImage[] = [
  { name: "Anbernic RG35XX", filename: "anbernic-rg35xx.webp" },
  { name: "Steam Deck", filename: "steam-deck.webp" },
  { name: "Raspberry Pi 5", filename: "raspberry-pi-5.webp" },
];

async function main() {
  const args = process.argv.slice(2);
  const isRemote = args.includes("--remote");
  const isLocal = args.includes("--local");
  const isDryRun = args.includes("--dry-run");

  console.log("Device Image Upload Script");
  console.log("===========================");
  console.log(
    `Mode: ${isRemote ? "Remote (Production)" : "Local (Development)"}`,
  );
  console.log(`Dry Run: ${isDryRun ? "Yes" : "No"}`);
  console.log();

  // Note: In a real implementation, you would need to:
  // 1. Configure Wrangler to access R2 from Node.js context
  // 2. Use @cloudflare/workers-types to get proper R2 client
  // 3. Or use the wrangler R2 commands directly

  console.log("This script is a template for R2 uploads.");
  console.log();
  console.log("For production, use these wrangler commands:");
  console.log();
  console.log("1. Upload single file:");
  console.log(
    "   wrangler r2 object put open-source-games-images/devices/anbernic-rg35xx.webp --file=public/images/devices/anbernic-rg35xx.webp",
  );
  console.log();
  console.log("2. Upload all device images:");
  for (const device of DEVICES) {
    const key = ImageKeys.device(device.name);
    console.log(
      `   wrangler r2 object put open-source-games-images/${key} --file=public/images/devices/${device.filename}`,
    );
  }
  console.log();
  console.log("3. List uploaded images:");
  console.log(
    "   wrangler r2 object list open-source-games-images --prefix=devices/",
  );
  console.log();

  if (isDryRun) {
    console.log("Dry run complete. No files were uploaded.");
    return;
  }

  // TODO: Implement actual upload logic using wrangler CLI or R2 API
  // This would require setting up a proper Node.js R2 client
  // or spawning wrangler processes to upload files

  console.log("To implement actual uploads, you can:");
  console.log("1. Use wrangler CLI commands directly");
  console.log("2. Use the Admin API at /api/admin/images/upload");
  console.log("3. Set up a proper R2 client with AWS S3 compatibility");
}

main().catch(console.error);
