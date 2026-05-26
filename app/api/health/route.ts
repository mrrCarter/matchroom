import { NextRequest, NextResponse } from "next/server";
import { getUpcomingRedSoxGame } from "@/lib/data/mlb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deep = request.nextUrl.searchParams.get("deep") === "1";
  const startedAt = Date.now();
  const payload: {
    ok: boolean;
    app: string;
    checkedAt: string;
    uptimeSeconds: number;
    version: string;
    checks: {
      server: "ok";
      mlb?: "ok" | "degraded";
    };
    upcomingGame?: {
      gamePk: number;
      matchupLabel: string;
      status: string;
    };
    errors?: string[];
    latencyMs?: number;
  } = {
    ok: true,
    app: "matchroom",
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local-dev",
    checks: {
      server: "ok",
    },
  };

  if (deep) {
    try {
      const game = await getUpcomingRedSoxGame();
      payload.checks.mlb = "ok";
      payload.upcomingGame = {
        gamePk: game.gamePk,
        matchupLabel: game.matchupLabel,
        status: game.status,
      };
    } catch (error) {
      payload.ok = false;
      payload.checks.mlb = "degraded";
      payload.errors = [
        error instanceof Error ? error.message : "MLB health check failed.",
      ];
    }
  }

  payload.latencyMs = Date.now() - startedAt;

  return NextResponse.json(payload, {
    status: payload.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
