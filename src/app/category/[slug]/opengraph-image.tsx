import { ImageResponse } from "next/og";
import { createDatabase } from "@/db";
import { getGames } from "@/lib/db-queries";
import { getCategoryBySlug, type Category } from "@/lib/categories";
import { getOptionalRequestContext } from "@/lib/server/request-context";
import type { GameFilters } from "@/lib/api-utils";

export const runtime = "edge";
export const alt = "OpenGames Category";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface CategoryOGProps {
  params: Promise<{ slug: string }>;
}

function categoryToGameFilters(category: Category): GameFilters {
  const topics = [
    ...(category.filter.topics ?? []),
    ...(category.filter.engine ? [category.filter.engine] : []),
    ...(category.filter.alternativeTo ? [category.filter.alternativeTo] : []),
  ].filter(Boolean);

  return {
    languages: category.filter.language
      ? [category.filter.language]
      : undefined,
    topics: topics.length > 0 ? topics : undefined,
    platforms: category.filter.platforms,
    isMultiplayer: category.filter.isMultiplayer,
    minStars: category.filter.minStars,
  };
}

export default async function CategoryOpenGraphImage({
  params,
}: CategoryOGProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          color: "#fff",
          fontSize: 48,
          fontWeight: 800,
        }}
      >
        Category Not Found
      </div>,
      { ...size },
    );
  }

  let totalGames: number | null = null;
  try {
    const ctx = getOptionalRequestContext();
    if (ctx?.env?.DB) {
      const db = createDatabase(ctx.env.DB);
      const pagination = { page: 1, pageSize: 1, offset: 0 };
      const filters = categoryToGameFilters(category);
      const result = await getGames(db, filters, pagination, {
        field: "stars",
        order: "desc",
      });
      totalGames = result.total;
    }
  } catch {
    totalGames = null;
  }

  const subtitle =
    totalGames !== null ? `${totalGames} games` : "Open source games";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(1000px 600px at 15% 20%, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0) 60%), radial-gradient(900px 600px at 85% 30%, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0) 60%), #09090b",
        padding: 64,
        justifyContent: "space-between",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "transparent",
            backgroundImage:
              "linear-gradient(135deg, #111827 0%, #0b1220 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.15)",
            fontSize: 28,
          }}
        >
          🎮
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.4 }}>
            OpenGames
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.75)" }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 60,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.1,
          }}
        >
          {category.title.replace(/ in \\d{4}$/, "")}
        </div>
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.82)" }}>
          {category.metaDescription}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderRadius: 9999,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          fontSize: 18,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        /category/{category.slug}
      </div>
    </div>,
    { ...size },
  );
}
