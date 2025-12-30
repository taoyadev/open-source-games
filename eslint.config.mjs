import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    ".open-next/**",
    "coverage/**",
    // CommonJS scripts (Node.js scripts that use require)
    "scripts/fix-worker.js",
  ]),
  {
    rules: {
      // Disable react-hooks/set-state-in-effect for theme provider
      // The theme needs to be applied synchronously during initial render to prevent flash
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
