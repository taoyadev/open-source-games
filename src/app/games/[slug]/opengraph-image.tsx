import { ImageResponse } from "next/og";
import { createDatabase } from "@/db";
import { getGameBySlugFromDb } from "@/lib/db-queries";
import { getGameBySlug } from "@/lib/data";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import { formatNumber, starsToRating, getLanguageColor } from "@/lib/utils";

export const runtime = "edge";
export const alt = "Open Source Game | OpenGames";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface OGImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: OGImageProps) {
  const { slug } = await params;

  const ctx = getOptionalRequestContext();
  const game = ctx?.env?.DB
    ? await getGameBySlugFromDb(createDatabase(ctx.env.DB), slug)
    : await getGameBySlug(slug);

  if (!game) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#18181b",
          color: "#fff",
          fontSize: 48,
          fontWeight: "bold",
        }}
      >
        Game Not Found
      </div>,
      { ...size },
    );
  }

  const rating = starsToRating(game.stars);
  const languageColor = getLanguageColor(game.language);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#18181b",
        padding: 60,
      }}
    >
      {/* Top section with branding */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            backgroundColor: "#3b82f6",
            borderRadius: 12,
            marginRight: 16,
            fontSize: 24,
          }}
        >
          🎮
        </div>
        <span
          style={{
            color: "#a1a1aa",
            fontSize: 24,
            fontWeight: 500,
          }}
        >
          Open Source Games
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 48,
        }}
      >
        {/* Left: Game info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: "#fafafa",
              fontSize: 64,
              fontWeight: "bold",
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            {game.title}
          </h1>

          {/* Description */}
          <p
            style={{
              color: "#a1a1aa",
              fontSize: 28,
              lineHeight: 1.4,
              marginBottom: 32,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {game.description || "Open source game available for free"}
          </p>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: "auto",
            }}
          >
            {/* Stars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#422006",
                borderRadius: 9999,
                padding: "8px 20px",
              }}
            >
              <span style={{ marginRight: 8, fontSize: 24 }}>⭐</span>
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {formatNumber(game.stars)}
              </span>
            </div>

            {/* Language */}
            {game.language && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#27272a",
                  borderRadius: 9999,
                  padding: "8px 20px",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 9999,
                    backgroundColor: languageColor,
                    marginRight: 10,
                  }}
                />
                <span
                  style={{
                    color: "#e4e4e7",
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  {game.language}
                </span>
              </div>
            )}

            {/* License */}
            {game.license && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#14532d",
                  borderRadius: 9999,
                  padding: "8px 20px",
                }}
              >
                <span
                  style={{
                    color: "#4ade80",
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  {game.license}
                </span>
              </div>
            )}

            {/* Multiplayer */}
            {game.isMultiplayer && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#1e3a5f",
                  borderRadius: 9999,
                  padding: "8px 20px",
                }}
              >
                <span
                  style={{
                    color: "#60a5fa",
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  Multiplayer
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Rating visualization */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 200,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 160,
              height: 160,
              borderRadius: 9999,
              backgroundColor: "transparent",
              backgroundImage:
                "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 56,
                fontWeight: "bold",
              }}
            >
              {rating.toFixed(1)}
            </span>
          </div>
          <span
            style={{
              color: "#a1a1aa",
              fontSize: 20,
              marginTop: 16,
            }}
          >
            Community Rating
          </span>
        </div>
      </div>

      {/* Bottom: Platforms */}
      {game.platforms && game.platforms.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {game.platforms.slice(0, 5).map((platform) => (
            <div
              key={platform}
              style={{
                display: "flex",
                backgroundColor: "#27272a",
                borderRadius: 8,
                padding: "6px 16px",
              }}
            >
              <span
                style={{
                  color: "#a1a1aa",
                  fontSize: 18,
                }}
              >
                {platform}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>,
    {
      ...size,
    },
  );
}
