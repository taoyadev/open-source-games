import { ImageResponse } from "next/og";
import React from "react";

export const runtime = "edge";

export async function GET() {
  const svg = React.createElement(
    "svg",
    {
      width: 20,
      height: 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "white",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    React.createElement("line", { x1: 6, x2: 10, y1: 12, y2: 12 }),
    React.createElement("line", { x1: 8, x2: 8, y1: 10, y2: 14 }),
    React.createElement("line", { x1: 15, x2: 15.01, y1: 13, y2: 13 }),
    React.createElement("line", { x1: 18, x2: 18.01, y1: 11, y2: 11 }),
    React.createElement("rect", { width: 20, height: 12, x: 2, y: 6, rx: 2 }),
  );

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
          borderRadius: 6,
        },
      },
      svg,
    ),
    { width: 32, height: 32 },
  );
}
