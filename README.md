# OpenGames (Open Source Games Directory)

SEO-first directory for discovering open-source games, powered by **Next.js (App Router)** on **Cloudflare Pages** with **D1 + Drizzle**.

## Features

- **/games**: searchable, filterable directory (language/genre/topic/platform/multiplayer)
- **/games/[slug]**: SEO-optimized game detail pages (Schema.org, OG images, related games)
- **/category/[slug]**: pSEO category pages (100+ predefined categories)
- **/topic/[topic]**: topic/tag landing pages
- **/trending**: trending + recently updated games
- **/api/**: JSON APIs for games/search/stats/categories
- **Icons/OG**: dynamic OpenGraph images + PWA icons served from routes

## Tech Stack

- Next.js 15 (React 19)
- Cloudflare Pages via `@cloudflare/next-on-pages`
- Cloudflare D1 (SQLite) + Drizzle ORM
- Vitest + Testing Library

## Local Development

Install deps:

```bash
npm install
```

Run Next.js dev server:

```bash
npm run dev
```

Open: `http://localhost:3000`

## Cloudflare Pages Preview (recommended)

Build + run the Pages-style preview (edge runtime):

```bash
npm run preview
```

## Database (D1) – Local

Run migrations against local D1:

```bash
npm run db:migrate:local
```

Run migrations against remote D1:

```bash
npm run db:migrate:remote
```

Sync games into D1:

```bash
npm run sync:local
```

## Environment Variables

Cloudflare bindings are configured in `wrangler.toml`.

- Required for syncing/scraping:
  - `GITHUB_TOKEN`
- Optional:
  - `OPENAI_API_KEY` (AI reviews / category content)
  - `NEXT_PUBLIC_SITE_URL`
  - `GOOGLE_SITE_VERIFICATION`
  - `NEXT_PUBLIC_GITHUB_URL`
  - `NEXT_PUBLIC_TWITTER_URL`

For local Pages dev bindings, copy `.dev.vars.example` → `.dev.vars` and fill values.

## Scripts

- `npm run scrape` / `npm run sync:local` / `npm run sync:remote`
- `npm run generate:reviews`
- `npm run generate:categories`
- `npm run lint`
- `npm run test:run`
- `npm run build`
