import { NextResponse } from "next/server";
import { loadDemoBrief } from "@/lib/data/loaders";
import { getUpcomingRedSoxGame } from "@/lib/data/mlb";

export const dynamic = "force-dynamic";

type DemoBriefRequest = {
  coachQuestion?: unknown;
  gamePk?: unknown;
  mode?: unknown;
};

function getCoachQuestion(body: DemoBriefRequest): string | undefined {
  return typeof body.coachQuestion === "string" ? body.coachQuestion : undefined;
}

function getGamePk(body: DemoBriefRequest): number | undefined {
  if (typeof body.gamePk === "number" && Number.isFinite(body.gamePk)) {
    return body.gamePk;
  }

  if (typeof body.gamePk === "string") {
    const parsed = Number(body.gamePk);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export async function GET() {
  const brief = await loadDemoBrief();

  return NextResponse.json(brief, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
    }
  });
}

export async function POST(request: Request) {
  let body: DemoBriefRequest = {};

  try {
    body = (await request.json()) as DemoBriefRequest;
  } catch {
    body = {};
  }

  if (process.env.NODE_ENV === "development" && body.mode === "live" && !process.env.OPENAI_API_KEY) {
    console.info("MatchRoom demo-brief live mode requested without OPENAI_API_KEY; returning seeded brief.");
  }

  const gamePk = getGamePk(body);
  const upcomingGame = gamePk ? await getUpcomingRedSoxGame(gamePk) : undefined;
  const brief = await loadDemoBrief({
    coachQuestion: getCoachQuestion(body),
    upcomingGame,
  });

  return NextResponse.json(brief);
}
