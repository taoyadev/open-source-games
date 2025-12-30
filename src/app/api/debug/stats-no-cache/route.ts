import { NextResponse } from "next/server";
import { getStatsFromDb } from "@/lib/db-queries";
import { getOptionalRequestContextAsync } from "@/lib/server/request-context";

export const runtime = "edge";

export async function GET() {
  try {
    const ctx = await getOptionalRequestContextAsync();
    const d1 = ctx?.env?.DB;

    if (!d1) {
      return NextResponse.json(
        { error: "D1 binding not available" },
        { status: 500 },
      );
    }

    const stats = await getStatsFromDb(d1);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
        stack: (error as Error).stack?.slice(0, 500),
      },
      { status: 500 },
    );
  }
}
