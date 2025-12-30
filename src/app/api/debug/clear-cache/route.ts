import { NextResponse } from "next/server";
import { cacheClear } from "@/lib/cache";

export const runtime = "edge";

export async function POST() {
  try {
    await cacheClear();
    return NextResponse.json({ success: true, message: "Cache cleared" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
