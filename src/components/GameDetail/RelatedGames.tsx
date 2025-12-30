import Image from "next/image";
import { Star } from "lucide-react";
import type { Game } from "@/db/schema";
import { formatNumber, getLanguageColor } from "@/lib/utils";

interface RelatedGamesProps {
  games: Game[];
  currentGameTitle: string;
}

export function RelatedGames({ games, currentGameTitle }: RelatedGamesProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-games-heading">
      <h2
        id="related-games-heading"
        className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        Similar to {currentGameTitle}
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <a
            key={game.id}
            href={`/games/${game.slug}`}
            className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              {game.thumbnailUrl ? (
                <Image
                  src={game.thumbnailUrl}
                  alt={game.title}
                  width={300}
                  height={169}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-3xl" role="img" aria-hidden="true">
                    {getGameEmoji(game.topics || [])}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-3">
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                {game.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {game.description}
              </p>

              {/* Meta */}
              <div className="mt-3 flex items-center gap-3 text-sm">
                {/* Stars */}
                <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <Star
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                  <span>{formatNumber(game.stars)}</span>
                </div>

                {/* Language */}
                {game.language && (
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: getLanguageColor(game.language),
                      }}
                      aria-hidden="true"
                    />
                    <span>{game.language}</span>
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
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
