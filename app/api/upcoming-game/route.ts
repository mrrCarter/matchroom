import { NextRequest, NextResponse } from "next/server";
import { getUpcomingRedSoxGame } from "@/lib/data/mlb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const gamePkParam = request.nextUrl.searchParams.get("gamePk");
  const gamePk = gamePkParam ? Number(gamePkParam) : undefined;

  if (gamePkParam && !Number.isFinite(gamePk)) {
    return NextResponse.json(
      { ok: false, error: "gamePk must be a number." },
      { status: 400 },
    );
  }

  try {
    const game = await getUpcomingRedSoxGame(gamePk);
    return NextResponse.json(game, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to load upcoming MLB game.",
      },
      { status: 502 },
    );
  }
}
