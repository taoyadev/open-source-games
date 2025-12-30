import { NextResponse } from "next/server";
import {
  getOptionalRequestContext,
  getOptionalRequestContextAsync,
} from "@/lib/server/request-context";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  // Try sync getCloudflareContext
  try {
    const ctx1 = getCloudflareContext();
    debug["getCloudflareContext()"] = "success";
    debug["ctx1.env.DB"] = !!ctx1?.env?.DB;
    debug["ctx1.env.CACHE"] = !!ctx1?.env?.CACHE;
  } catch (e) {
    debug["getCloudflareContext()"] = (e as Error).message.slice(0, 100);
  }

  // Try getOptionalRequestContext
  try {
    const ctx2 = getOptionalRequestContext();
    debug["getOptionalRequestContext()"] = ctx2 ? "success" : "null";
    debug["ctx2.env.DB"] = !!ctx2?.env?.DB;
    debug["ctx2.env.CACHE"] = !!ctx2?.env?.CACHE;
  } catch (e) {
    debug["getOptionalRequestContext()"] = (e as Error).message.slice(0, 100);
  }

  // Try async getOptionalRequestContextAsync
  try {
    const ctx3 = await getOptionalRequestContextAsync();
    debug["getOptionalRequestContextAsync()"] = ctx3 ? "success" : "null";
    debug["ctx3.env.DB"] = !!ctx3?.env?.DB;
    debug["ctx3.env.CACHE"] = !!ctx3?.env?.CACHE;
  } catch (e) {
    debug["getOptionalRequestContextAsync()"] = (e as Error).message.slice(
      0,
      100,
    );
  }

  // Try direct Symbol access
  try {
    const symbol = Symbol.for("__cloudflare-context__");
    const direct = (globalThis as unknown as Record<typeof symbol, unknown>)[
      symbol
    ];
    debug["direct Symbol access"] = direct ? "found" : "null";
    debug["direct.env.DB"] = !!(direct as { env?: { DB?: unknown } })?.env?.DB;
  } catch (e) {
    debug["direct Symbol access"] = (e as Error).message.slice(0, 100);
  }

  return NextResponse.json(debug);
}
