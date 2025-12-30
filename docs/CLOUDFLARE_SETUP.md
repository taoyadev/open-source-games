# Cloudflare Services Setup Guide

This guide explains how to set up and use Cloudflare KV (caching) and R2 (image storage) for the Open Source Games platform.

## Prerequisites

- Cloudflare account with Pages project
- Wrangler CLI installed: `npm install -g wrangler`
- Project cloned and dependencies installed

## 1. KV Namespace Setup (Caching)

### Create KV Namespace

```bash
# Production namespace
wrangler kv:namespace create CACHE

# Preview/Development namespace
wrangler kv:namespace create CACHE --preview
```

### Update wrangler.toml

Copy the namespace IDs from the output and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "CACHE"
id = "your-preview-kv-namespace-id"
preview_id = true
```

## 2. R2 Bucket Setup (Image Storage)

### Enable R2

First, enable R2 in your Cloudflare account:

1. Go to Cloudflare Dashboard > R2
2. Accept the terms of service

### Create R2 Bucket

```bash
wrangler r2 bucket create open-source-games-images
```

### Optional: Set Up Custom Domain

1. Go to Cloudflare Dashboard > R2 > open-source-games-images
2. Click "Settings" > "Public Access"
3. Add a custom domain (e.g., `images.yourdomain.com`)

Update `wrangler.toml`:

```toml
[vars]
R2_PUBLIC_DOMAIN = "https://images.yourdomain.com"
```

## 3. Environment Variables

### Set Secrets

```bash
# Set admin API key for protected endpoints
wrangler pages secret put ADMIN_API_KEY
```

### Set Public Variables

Update `wrangler.toml`:

```toml
[vars]
NEXT_PUBLIC_SITE_URL = "https://your-domain.pages.dev"
R2_PUBLIC_DOMAIN = "https://images.yourdomain.com" # optional
```

## 4. Upload Device Images

### Using Wrangler CLI

```bash
# Upload a single device image
wrangler r2 object put open-source-games-images/devices/anbernic-rg35xx.webp --file=public/images/devices/anbernic-rg35xx.webp

# Upload all device images
wrangler r2 object put open-source-games-images/devices/steam-deck.webp --file=public/images/devices/steam-deck.webp
wrangler r2 object put open-source-games-images/devices/raspberry-pi-5.webp --file=public/images/devices/raspberry-pi-5.webp
```

### Using Admin API

```bash
# Upload image via API
curl -X POST https://your-domain.pages.dev/api/admin/images/upload \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -F "file=@public/images/devices/anbernic-rg35xx.webp" \
  -F "type=device" \
  -F "deviceName=Anbernic RG35XX"
```

## 5. Cache Management

### Via Admin API

```bash
# Invalidate specific pattern
curl -X POST https://your-domain.pages.dev/api/admin/cache \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"pattern": "games:trending"}'

# Clear all cache
curl -X DELETE https://your-domain.pages.dev/api/admin/cache \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"

# Get cache key info
curl https://your-domain.pages.dev/api/admin/cache?action=keys \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

## 6. Cache TTL Guidelines

| Data Type              | TTL      | Function                   |
| ---------------------- | -------- | -------------------------- |
| Popular/Trending Games | 7 days   | `getCachedTrendingGames()` |
| Category Stats         | 24 hours | `getCachedCategoryStats()` |
| Platform Stats         | 24 hours | `getCachedPlatformStats()` |
| Game Details           | 6 hours  | `getCachedGame()`          |
| Search Results         | 1 hour   | `getCachedSearchResults()` |

## 7. Usage Examples

### In API Routes

```typescript
import { getCachedGame, CacheKeys } from "@/lib/cache";

// Get cached game by slug
export async function GET(request: Request) {
  const db = getDb();
  const game = await getCachedGame("minecraft-clone", async () => {
    return await getGameBySlugFromDb(db, "minecraft-clone");
  });
  return Response.json(game);
}
```

### In Database Queries

```typescript
import { getGameBySlugCached } from "@/lib/db-queries";

// Uses 6-hour cache automatically
const game = await getGameBySlugCached(db, "minecraft-clone");
```

## 8. R2 Image URL Helper

```typescript
import { getDeviceImageUrl, uploadDeviceImage } from "@/lib/r2";

// Get device image URL (handles R2 or local fallback)
const url = getDeviceImageUrl("Steam Deck");

// Upload device image
await uploadDeviceImage(file, "Steam Deck");
```

## 9. Troubleshooting

### KV Not Working

- Verify binding exists in `wrangler.toml`
- Check namespace ID is correct
- Use `wrangler kv:key list --namespace-id=YOUR_ID` to verify

### R2 Not Working

- Verify bucket exists: `wrangler r2 bucket list`
- Check `IMAGES` binding in `wrangler.toml`
- For custom domains, ensure DNS is configured

### Images Not Loading

1. Check image exists in R2: `wrangler r2 object list open-source-games-images --prefix=devices/`
2. Verify `R2_PUBLIC_DOMAIN` is set (if using custom domain)
3. Check browser console for 404 errors

## 10. Development Setup

For local development without Cloudflare bindings:

- KV automatically falls back to in-memory cache
- R2 uploads log warnings but don't fail
- Images fall back to local `/images/` directory

To test with real Cloudflare services locally:

```bash
# Start local development with bindings
wrangler pages dev .vercel/output/static \
  --compatibility-date=2024-01-01 \
  --compatibility-flag=nodejs_compat \
  --binding=CACHE=your-kv-id \
  --binding=IMAGES=open-source-games-images
```
