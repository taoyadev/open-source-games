import { getCloudflareContext } from "@opennextjs/cloudflare";

// The Symbol used by OpenNext to store Cloudflare context in global scope
// This must match the one used in @opennextjs/cloudflare
const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

// Type for Cloudflare bindings - allows known bindings plus any string env vars
type CloudflareBindings = {
  DB?: D1Database;
  CACHE?: KVNamespace;
  IMAGES?: R2Bucket;
  [key: string]: unknown;
};

type CloudflareContext = {
  env: CloudflareBindings;
  ctx?: ExecutionContext;
  cf?: unknown;
};

/**
 * Get Cloudflare context with multiple fallback strategies
 * Tries different methods to access the bindings in various scenarios
 */
export function getOptionalRequestContext(): CloudflareContext | null {
  try {
    // Try sync mode first (fastest for normal requests)
    return getCloudflareContext() as CloudflareContext;
  } catch {
    // If sync mode fails, try direct global access
    const direct = (
      globalThis as unknown as Record<typeof CLOUDFLARE_CONTEXT_SYMBOL, unknown>
    )[CLOUDFLARE_CONTEXT_SYMBOL];
    if (direct) {
      return direct as CloudflareContext;
    }
    return null;
  }
}

/**
 * Get Cloudflare context in async mode
 * Use this for pages that need to access bindings but might be built statically
 */
export async function getOptionalRequestContextAsync(): Promise<CloudflareContext | null> {
  try {
    // Try async mode first
    return (await getCloudflareContext({ async: true })) as CloudflareContext;
  } catch {
    // Fall back to sync mode
    const sync = getOptionalRequestContext();
    if (sync) {
      return sync;
    }
    // Last resort: try direct global access
    const direct = (
      globalThis as unknown as Record<typeof CLOUDFLARE_CONTEXT_SYMBOL, unknown>
    )[CLOUDFLARE_CONTEXT_SYMBOL];
    if (direct) {
      return direct as CloudflareContext;
    }
    return null;
  }
}
