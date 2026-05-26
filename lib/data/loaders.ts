import { getSeededBrief, gameMetadata, heroReplay, statcastSummary } from "@/lib/data/seeded";
import type { TacticalInsight, UpcomingGame, VerifiedBriefResponse } from "@/lib/types/matchroom";

type DemoBriefOptions = {
  coachQuestion?: string;
  upcomingGame?: UpcomingGame;
};

function pitcherLine(game: UpcomingGame): string {
  const away = game.away.probablePitcher;
  const home = game.home.probablePitcher;
  if (!away || !home) return "";

  const awayStats = away.stats?.era ? ` (${away.stats.era} ERA, ${away.stats.whip ?? "n/a"} WHIP)` : "";
  const homeStats = home.stats?.era ? ` (${home.stats.era} ERA, ${home.stats.whip ?? "n/a"} WHIP)` : "";
  return ` Probable starters: ${away.fullName}${awayStats} vs ${home.fullName}${homeStats}.`;
}

function withUpcomingGameContext(
  brief: VerifiedBriefResponse,
  upcomingGame: UpcomingGame,
): VerifiedBriefResponse {
  const scheduleEvidence: TacticalInsight = {
    id: "live-upcoming-game-context",
    title: "Upcoming game context is live; pitch evidence is seeded",
    claim: `${upcomingGame.matchupLabel} is ${upcomingGame.status} in the MLB Stats API schedule for ${upcomingGame.date} at ${upcomingGame.venue}. Tactical pitch evidence is still drawn from the completed Red Sox-Braves evidence game (${upcomingGame.evidenceFallback.gamePk}).`,
    confidence: "high",
    status: "accepted",
    evidence: [
      {
        pitchId: `schedule-${upcomingGame.gamePk}`,
        gamePk: upcomingGame.gamePk,
        inning: 0,
        halfInning: "top",
        atBatIndex: 0,
        pitchNumber: 0,
        description: `MLB Stats API schedule endpoint reports gamePk ${upcomingGame.gamePk} as ${upcomingGame.status} for ${upcomingGame.gameDateUtc} at ${upcomingGame.venue}.`,
      },
    ],
    skepticNote:
      "Do not present upcoming-game tactics as if they came from completed pitch data for this game. The live schedule and probable-pitcher context are real; the tactical evidence is a prior completed matchup.",
    whyItMatters:
      "The demo can target a live upcoming game without inventing pitch-level evidence before first pitch.",
    recommendedAction:
      "Use the upcoming game as the coaching context and keep every tactical claim tied to the completed evidence sample until the live feed has pitch events.",
  };

  return {
    ...brief,
    mode: "seeded",
    generatedAt: new Date().toISOString(),
    game: {
      ...brief.game,
      gamePk: upcomingGame.gamePk,
      date: upcomingGame.date,
      homeTeam: upcomingGame.home.name,
      awayTeam: upcomingGame.away.name,
      stadium: upcomingGame.venue,
      score: upcomingGame.status,
      dataSource:
        "MLB Stats API live schedule plus seeded pitch-level evidence from MLB Stats API play-by-play.",
    },
    coachQuestion: upcomingGame.coachQuestion,
    executiveSummary: `Live upcoming-game context from MLB Stats API: ${upcomingGame.matchupLabel}, ${upcomingGame.status}, ${upcomingGame.venue}, ${upcomingGame.date}.${pitcherLine(upcomingGame)} The tactical recommendations below are evidence-gated against the completed Red Sox-Braves sample (${upcomingGame.evidenceFallback.trackedPitches} tracked pitches, ${upcomingGame.evidenceFallback.chaseRatePct}% chase rate, ${upcomingGame.evidenceFallback.hardHitBalls95PlusMph} hard-hit balls). ${brief.executiveSummary}`,
    riskFlags: [
      scheduleEvidence,
      ...brief.riskFlags.filter((flag) => flag.id !== scheduleEvidence.id),
    ],
    coachActions: [
      `Target upcoming game: ${upcomingGame.matchupLabel}, ${upcomingGame.venue}, ${upcomingGame.date}, gamePk ${upcomingGame.gamePk}.`,
      `Probable starters: ${upcomingGame.away.probablePitcher?.fullName ?? "TBD"} vs ${upcomingGame.home.probablePitcher?.fullName ?? "TBD"}.`,
      ...brief.coachActions.filter((action) => !action.startsWith("Target game:")),
    ],
    evidenceNotes: [
      `Upcoming game context pulled live from ${upcomingGame.sourceUrl}.`,
      `Pitch-level tactical evidence remains seeded from ${upcomingGame.evidenceFallback.sourceUrl} until the upcoming game has completed pitch data.`,
      ...brief.evidenceNotes,
    ],
  };
}

export async function loadDemoBrief(
  options?: string | DemoBriefOptions,
): Promise<VerifiedBriefResponse> {
  const coachQuestion = typeof options === "string" ? options : options?.coachQuestion;
  const brief = getSeededBrief(coachQuestion);

  if (typeof options !== "string" && options?.upcomingGame) {
    return withUpcomingGameContext(brief, options.upcomingGame);
  }

  return brief;
}

export function loadSeededAssets() {
  return {
    brief: getSeededBrief(),
    gameMetadata,
    heroReplay,
    statcastSummary
  };
}
