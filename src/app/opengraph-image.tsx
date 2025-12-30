import { ImageResponse } from "next/og";

export const alt = "OpenGames - Discover Open Source Games";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(1200px 600px at 20% 20%, #7c3aed 0%, rgba(124,58,237,0) 60%), radial-gradient(900px 600px at 80% 30%, #db2777 0%, rgba(219,39,119,0) 60%)",
        padding: 64,
        justifyContent: "space-between",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: "transparent",
            backgroundImage:
              "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" x2="10" y1="12" y2="12" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="15" x2="15.01" y1="13" y2="13" />
            <line x1="18" x2="18.01" y1="11" y2="11" />
            <rect width="20" height="12" x="2" y="6" rx="2" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.6 }}>
            OpenGames
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.75)" }}>
            Discover open source games
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.2,
          }}
        >
          Find games. Learn from code. Play for free.
        </div>
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.8)" }}>
          Browse by genre, language, engine, platform, and more.
        </div>
      </div>

      <div style={{ display: "flex", gap: 14 }}>
        {["/games", "/category", "/trending"].map((path) => (
          <div
            key={path}
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
            {path}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
