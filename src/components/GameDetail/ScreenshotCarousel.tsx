"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import type { Game } from "@/db/schema";

interface ScreenshotCarouselProps {
  game: Game;
}

export function ScreenshotCarousel({ game }: ScreenshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const screenshots = game.screenshotUrls || [];
  const allImages = game.thumbnailUrl
    ? [game.thumbnailUrl, ...screenshots]
    : screenshots;

  if (allImages.length === 0) {
    // Fallback placeholder
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        <div className="flex h-full items-center justify-center">
          <span className="text-6xl" role="img" aria-label={game.title}>
            {getGameEmoji(game.topics || [])}
          </span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main carousel */}
      <div className="relative">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={allImages[currentIndex]}
            alt={`${game.title} screenshot ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
            priority={currentIndex === 0}
          />

          {/* Lightbox button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute right-3 top-3 rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Next screenshot"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to screenshot ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {allImages.map((src, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                index === currentIndex
                  ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`View screenshot ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <Image
                src={src}
                alt={`${game.title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Screenshot lightbox"
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          <div
            className="relative h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[currentIndex]}
              alt={`${game.title} screenshot ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-8 w-8" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-8 w-8" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function getGameEmoji(topics: string[]): string {
  const topicSet = new Set(topics.map((t) => t.toLowerCase()));

  if (topicSet.has("rpg") || topicSet.has("adventure")) return "🗡️";
  if (topicSet.has("fps") || topicSet.has("shooter")) return "🔫";
  if (topicSet.has("racing")) return "🏎️";
  if (topicSet.has("puzzle")) return "🧩";
  if (topicSet.has("strategy") || topicSet.has("rts")) return "♟️";
  if (topicSet.has("platformer")) return "🍄";
  if (topicSet.has("space")) return "🚀";
  if (topicSet.has("simulation")) return "🎮";
  if (topicSet.has("sports")) return "⚽";
  if (topicSet.has("roguelike")) return "💀";
  if (topicSet.has("voxel") || topicSet.has("sandbox")) return "🧱";

  return "🎮";
}
