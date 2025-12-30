import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.tsx"],
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/__tests__/**",
        "src/**/*.d.ts",
        "src/app/**/page.tsx",
        "src/app/**/layout.tsx",
        "src/app/api/**/route.ts",
        "src/middleware.ts",
        "src/app/**/error.tsx",
        "src/app/**/not-found.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/template.tsx",
        "src/app/**/icon.tsx",
        "src/app/**/opengraph-image.tsx",
        "src/app/**/apple-icon.tsx",
        "src/app/sitemap.ts",
        "src/app/robots.ts",
      ],
      thresholds: {
        // Realistic thresholds for unit tests only (excluding E2E)
        // Focus on core lib files being well-tested
        lines: 22,
        functions: 24,
        branches: 19,
        statements: 23,
      },
    },
    benchmark: {
      include: ["src/__tests__/bench/**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
