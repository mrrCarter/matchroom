import { gameMetadata, statcastSummary } from "@/lib/data/seeded";
import type {
  PitcherSeasonStats,
  UpcomingGame,
  UpcomingTeamSnapshot,
} from "@/lib/types/matchroom";

const MLB_API = "https://statsapi.mlb.com/api/v1";
const RED_SOX_TEAM_ID = 111;
const SEARCH_DAYS = 14;

interface MlbScheduleResponse {
  dates?: Array<{
    games?: MlbScheduleGame[];
  }>;
}

interface MlbScheduleGame {
  gamePk?: number;
  gameDate?: string;
  officialDate?: string;
  link?: string;
  season?: string;
  status?: {
    abstractGameState?: string;
    detailedState?: string;
  };
  venue?: {
    name?: string;
  };
  teams?: {
    away?: MlbTeamSide;
    home?: MlbTeamSide;
  };
}

interface MlbTeamSide {
  team?: {
    id?: number;
    name?: string;
    abbreviation?: string;
  };
  leagueRecord?: {
    wins?: number;
    losses?: number;
    pct?: string;
  };
  probablePitcher?: {
    id?: number;
    fullName?: string;
  };
}

interface MlbPitchingStatsResponse {
  stats?: Array<{
    splits?: Array<{
      stat?: Partial<PitcherSeasonStats>;
    }>;
  }>;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`MLB Stats API request failed: ${response.status} ${url}`);
  }

  return (await response.json()) as T;
}

function pickGame(games: MlbScheduleGame[], requestedGamePk?: number): MlbScheduleGame | undefined {
  if (requestedGamePk) {
    const requested = games.find((game) => game.gamePk === requestedGamePk);
    if (requested) return requested;
  }

  const now = Date.now();
  return (
    games.find((game) => {
      const gameTime = game.gameDate ? Date.parse(game.gameDate) : 0;
      return (
        gameTime >= now - 6 * 60 * 60 * 1000 &&
        game.status?.abstractGameState !== "Final"
      );
    }) ?? games[0]
  );
}

function asRecord(side?: MlbTeamSide): UpcomingTeamSnapshot["record"] {
  const wins = side?.leagueRecord?.wins;
  const losses = side?.leagueRecord?.losses;
  const pct = side?.leagueRecord?.pct;
  if (typeof wins !== "number" || typeof losses !== "number" || !pct) {
    return undefined;
  }

  return { wins, losses, pct };
}

async function loadPitcherStats(playerId?: number): Promise<PitcherSeasonStats | undefined> {
  if (!playerId) return undefined;

  const url = `${MLB_API}/people/${playerId}/stats?stats=season&group=pitching&season=2026`;
  try {
    const data = await fetchJson<MlbPitchingStatsResponse>(url);
    const stat = data.stats?.[0]?.splits?.[0]?.stat;
    if (!stat) return undefined;

    return {
      era: stat.era,
      whip: stat.whip,
      inningsPitched: stat.inningsPitched,
      strikeOuts: stat.strikeOuts,
      baseOnBalls: stat.baseOnBalls,
      strikeoutWalkRatio: stat.strikeoutWalkRatio,
      strikeoutsPer9Inn: stat.strikeoutsPer9Inn,
      walksPer9Inn: stat.walksPer9Inn,
      gamesStarted: stat.gamesStarted,
      wins: stat.wins,
      losses: stat.losses,
    };
  } catch {
    return undefined;
  }
}

async function toTeamSnapshot(side?: MlbTeamSide): Promise<UpcomingTeamSnapshot> {
  const probablePitcherId = side?.probablePitcher?.id;
  const stats = await loadPitcherStats(probablePitcherId);

  return {
    id: side?.team?.id ?? 0,
    name: side?.team?.name ?? "Unknown team",
    abbreviation: side?.team?.abbreviation,
    record: asRecord(side),
    probablePitcher:
      typeof probablePitcherId === "number" && side?.probablePitcher?.fullName
        ? {
            id: probablePitcherId,
            fullName: side.probablePitcher.fullName,
            stats,
          }
        : undefined,
  };
}

export async function getUpcomingRedSoxGame(requestedGamePk?: number): Promise<UpcomingGame> {
  const today = new Date();
  const startDate = isoDate(today);
  const endDate = isoDate(addDays(today, SEARCH_DAYS));
  const sourceUrl = `${MLB_API}/schedule?sportId=1&teamId=${RED_SOX_TEAM_ID}&startDate=${startDate}&endDate=${endDate}&hydrate=probablePitcher,team,venue`;

  const schedule = await fetchJson<MlbScheduleResponse>(sourceUrl);
  const games = (schedule.dates ?? []).flatMap((date) => date.games ?? []);
  const game = pickGame(games, requestedGamePk);

  if (!game?.gamePk) {
    throw new Error("No upcoming Red Sox game found in MLB Stats API schedule.");
  }

  const [away, home] = await Promise.all([
    toTeamSnapshot(game.teams?.away),
    toTeamSnapshot(game.teams?.home),
  ]);

  const date = game.officialDate ?? game.gameDate?.slice(0, 10) ?? startDate;
  const venue = game.venue?.name ?? "Venue TBD";
  const matchupLabel = `${away.name} @ ${home.name}`;
  const feedUrl = `https://statsapi.mlb.com${game.link ?? `/api/v1.1/game/${game.gamePk}/feed/live`}`;
  const awayPitcher = away.probablePitcher?.fullName;
  const homePitcher = home.probablePitcher?.fullName;
  const pitcherClause =
    awayPitcher && homePitcher
      ? ` Probable pitchers: ${awayPitcher} vs ${homePitcher}.`
      : "";

  return {
    source: "MLB Stats API",
    sourceUrl,
    feedUrl,
    fetchedAt: new Date().toISOString(),
    gamePk: game.gamePk,
    date,
    gameDateUtc: game.gameDate ?? `${date}T00:00:00Z`,
    status: game.status?.detailedState ?? "Scheduled",
    venue,
    matchupLabel,
    coachQuestion: `How should Boston attack ${away.name} in the next matchup at ${venue}?${pitcherClause}`,
    away,
    home,
    evidenceFallback: {
      gamePk: statcastSummary.evidenceGamePk,
      date: statcastSummary.sample.date,
      sourceUrl: `${MLB_API}/game/${statcastSummary.evidenceGamePk}/playByPlay`,
      trackedPitches: statcastSummary.sample.trackedPitches,
      outsideZonePitches: statcastSummary.zoneDiscipline.outsideZonePitches,
      chaseSwings: statcastSummary.zoneDiscipline.chaseSwings,
      chaseRatePct: statcastSummary.zoneDiscipline.chaseRatePct,
      whiffRatePct: statcastSummary.zoneDiscipline.whiffRatePct,
      hardHitBalls95PlusMph: statcastSummary.contactQuality.hardHitBalls95PlusMph,
      description: `Pitch-level evidence remains the completed ${gameMetadata.seed_evidence_game?.date ?? statcastSummary.sample.date} Red Sox-Braves sample until the upcoming game feed produces completed pitch data.`,
    },
  };
}
