import Image from "next/image";
import { ExternalLink, Server, Gamepad2 } from "lucide-react";
import type { Game } from "@/db/schema";
import type { AffiliateDevice, VPSProvider } from "@/lib/types";
import { getDeviceImageUrl } from "@/lib/r2";

interface AffiliateSectionProps {
  game: Game;
}

// Default hardware recommendations for retro/emulator games
// Images are dynamically loaded from R2 storage
const DEFAULT_DEVICES: AffiliateDevice[] = [
  {
    name: "Anbernic RG35XX",
    url: "https://amzn.to/anbernic-rg35xx",
    price: "$59.99",
    description: "Perfect for 2D retro games",
  },
  {
    name: "Steam Deck",
    url: "https://amzn.to/steam-deck",
    price: "$399",
    description: "Runs AAA open source games",
  },
  {
    name: "Raspberry Pi 5",
    url: "https://amzn.to/raspberry-pi-5",
    price: "$80",
    description: "DIY gaming console",
  },
];

/**
 * Get the image URL for a device
 * Uses the device's image property if available, otherwise generates R2 URL
 */
function getDeviceImageSrc(device: AffiliateDevice): string | undefined {
  if (device.image) {
    return device.image;
  }
  // Try to get image from R2 storage
  const r2Url = getDeviceImageUrl(device.name);
  // If R2 URL returns the default path, we still try it
  // The component will show placeholder if image doesn't exist
  return r2Url;
}

// VPS recommendations for multiplayer games
const VPS_PROVIDERS: VPSProvider[] = [
  {
    name: "Vultr",
    url: "https://www.vultr.com/?ref=your-affiliate-id",
    price: "$2.50/mo",
    description: "Cheapest option for small servers",
  },
  {
    name: "DigitalOcean",
    url: "https://m.do.co/c/your-affiliate-id",
    price: "$6/mo",
    description: "Reliable with great documentation",
  },
];

export function AffiliateSection({ game }: AffiliateSectionProps) {
  const showHardware = shouldShowHardwareRecommendations(game);
  const showVPS = game.isMultiplayer;

  if (!showHardware && !showVPS) {
    return null;
  }

  const devices = game.affiliateDevices || DEFAULT_DEVICES;

  return (
    <div className="space-y-8">
      {/* Hardware recommendations */}
      {showHardware && (
        <section
          className="rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-6 dark:from-zinc-900 dark:to-zinc-800"
          aria-labelledby="hardware-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Gamepad2
              className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
              aria-hidden="true"
            />
            <h3
              id="hardware-heading"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              Best Devices to Play {game.title}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {devices.map((device) => (
              <a
                key={device.name}
                href={device.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
              >
                {/* Device image */}
                <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-700">
                  {getDeviceImageSrc(device) ? (
                    <Image
                      src={getDeviceImageSrc(device)!}
                      alt={device.name}
                      width={200}
                      height={200}
                      className="h-full w-full object-contain p-4"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden",
                        );
                      }}
                    />
                  ) : null}
                  <div className="hidden flex h-full items-center justify-center text-4xl">
                    🎮
                  </div>
                </div>

                <h4 className="font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                  {device.name}
                </h4>

                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {device.description}
                </p>

                <div className="mt-auto pt-3">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {device.price}
                  </span>
                </div>

                <span className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                  View on Amazon
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>

          {/* Affiliate disclosure */}
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            * As an Amazon Associate, we earn from qualifying purchases.
          </p>
        </section>
      )}

      {/* VPS recommendations for multiplayer games */}
      {showVPS && (
        <section
          className="rounded-xl border-l-4 border-blue-500 bg-blue-50 p-6 dark:bg-blue-900/20"
          aria-labelledby="vps-heading"
        >
          <div className="mb-4 flex items-center gap-2">
            <Server
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <h3
              id="vps-heading"
              className="text-xl font-bold text-zinc-900 dark:text-zinc-50"
            >
              Host Your Own {game.title} Server
            </h3>
          </div>

          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Want to play with friends? Deploy a dedicated server in 5 minutes.
          </p>

          <div className="flex flex-wrap gap-4">
            {VPS_PROVIDERS.map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                target="_blank"
                rel="nofollow sponsored noopener"
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold text-white transition-colors ${
                  provider.name === "Vultr"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <span>Deploy on {provider.name}</span>
                <span className="text-sm font-normal opacity-90">
                  ({provider.price})
                </span>
              </a>
            ))}
          </div>

          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {VPS_PROVIDERS.map((p) => p.description).join(" | ")}
          </p>

          {/* Affiliate disclosure */}
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            * We may earn a commission when you sign up through these links.
          </p>
        </section>
      )}
    </div>
  );
}

/**
 * Determine if we should show hardware recommendations
 * Based on game topics (retro, emulator, 2d, pixel, etc.)
 */
function shouldShowHardwareRecommendations(game: Game): boolean {
  const topics = game.topics || [];
  const topicsLower = topics.map((t) => t.toLowerCase());

  const hardwareTopics = [
    "retro",
    "emulator",
    "pixel",
    "2d",
    "platformer",
    "roguelike",
    "arcade",
    "snes",
    "nes",
    "gameboy",
    "gba",
    "genesis",
    "portable",
  ];

  return topicsLower.some((t) => hardwareTopics.includes(t));
}
