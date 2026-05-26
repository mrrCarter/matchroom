#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const CANONICAL_DATE = "2026-05-26";
const EVIDENCE_DATE = "2026-05-17";
const RED_SOX_ID = 111;
const BRAVES_ID = 144;
const PUBLIC_DATA_DIR = path.resolve("public", "data");

const MLB_API = "https://statsapi.mlb.com/api/v1";
const CANONICAL_SCHEDULE_URL = `${MLB_API}/schedule?sportId=1&date=${CANONICAL_DATE}&teamId=${RED_SOX_ID}`;
const EVIDENCE_SCHEDULE_URL = `${MLB_API}/schedule?sportId=1&date=${EVIDENCE_DATE}&teamId=${RED_SOX_ID}`;

function round(value, digits = 3) {
  return Number(Number(value).toFixed(digits));
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(url, { signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} ${response.statusText}: ${url}`);
  }
  return response.json();
}

function firstGame(schedule, predicate) {
  for (const date of schedule.dates ?? []) {
    for (const game of date.games ?? []) {
      if (predicate(game)) {
        return game;
      }
    }
  }
  return undefined;
}

function isTrackedPitch(event) {
  const coords = event?.pitchData?.coordinates;
  return event?.isPitch === true && Number.isFinite(coords?.pX) && Number.isFinite(coords?.pZ);
}

function normalizePitchResult(event) {
  const code = event.details?.code;
  const description = String(event.details?.description ?? "").toLowerCase();

  if (event.details?.isInPlay || code === "D" || code === "X" || description.includes("in play")) {
    return "in_play";
  }
  if (code === "C" || description.includes("called strike")) {
    return "called_strike";
  }
  if (code === "S" || code === "T" || description.includes("swinging strike") || description.includes("foul tip")) {
    return "swing_miss";
  }
  if (code === "F" || description.includes("foul")) {
    return "foul";
  }
  return "ball";
}

function didSwing(event) {
  return ["swing_miss", "foul", "in_play"].includes(normalizePitchResult(event));
}

function isWhiff(event) {
  return normalizePitchResult(event) === "swing_miss";
}

function isOutsideZone(event) {
  const coords = event.pitchData?.coordinates ?? {};
  const zoneBottom = event.pitchData?.strikeZoneBottom ?? 1.5;
  const zoneTop = event.pitchData?.strikeZoneTop ?? 3.5;
  return Math.abs(coords.pX) > 0.83 || coords.pZ < zoneBottom || coords.pZ > zoneTop;
}

function pitchEvents(play) {
  return (play.playEvents ?? []).filter(isTrackedPitch);
}

function summarizeBravesPlateAppearances(plays) {
  const summary = {
    trackedPitches: 0,
    trackedBattedBalls: 0,
    pitchMix: {},
    outsideZonePitches: 0,
    swings: 0,
    chaseSwings: 0,
    whiffs: 0,
    hardHitBalls95PlusMph: 0,
    battedBallLocations: {},
    trajectories: {}
  };

  for (const play of plays) {
    if (play.about?.halfInning !== "bottom") {
      continue;
    }

    for (const event of pitchEvents(play)) {
      summary.trackedPitches += 1;

      const pitchType = event.details?.type?.code ?? "UNK";
      summary.pitchMix[pitchType] = (summary.pitchMix[pitchType] ?? 0) + 1;

      const outside = isOutsideZone(event);
      const swung = didSwing(event);

      if (outside) summary.outsideZonePitches += 1;
      if (swung) summary.swings += 1;
      if (outside && swung) summary.chaseSwings += 1;
      if (isWhiff(event)) summary.whiffs += 1;

      if (event.hitData) {
        summary.trackedBattedBalls += 1;
        if ((event.hitData.launchSpeed ?? 0) >= 95) {
          summary.hardHitBalls95PlusMph += 1;
        }

        const location = event.hitData.location ?? "unknown";
        const trajectory = event.hitData.trajectory ?? "unknown";
        summary.battedBallLocations[location] = (summary.battedBallLocations[location] ?? 0) + 1;
        summary.trajectories[trajectory] = (summary.trajectories[trajectory] ?? 0) + 1;
      }
    }
  }

  return summary;
}

function findPlayByAtBat(plays, atBatIndex) {
  const play = plays.find((item) => item.about?.atBatIndex === atBatIndex);
  if (!play) {
    throw new Error(`Expected atBatIndex ${atBatIndex} was not found in play-by-play.`);
  }
  return play;
}

function findPitchByPlayId(plays, playId) {
  for (const play of plays) {
    for (const event of pitchEvents(play)) {
      if (event.playId === playId) {
        return { play, event };
      }
    }
  }
  throw new Error(`Expected pitch playId ${playId} was not found in play-by-play.`);
}

function evidenceRef(plays, gamePk, playId, description) {
  const { play, event } = findPitchByPlayId(plays, playId);
  const coords = event.pitchData.coordinates;

  return {
    pitchId: event.playId,
    gamePk,
    inning: play.about.inning,
    halfInning: play.about.halfInning,
    atBatIndex: play.about.atBatIndex,
    pitchNumber: event.pitchNumber,
    pitcher: play.matchup.pitcher.fullName,
    batter: play.matchup.batter.fullName,
    pitchType: event.details.type.code,
    description,
    plateX: round(coords.pX),
    plateZ: round(coords.pZ),
    ...(event.hitData?.launchSpeed !== undefined ? { exitVelocity: event.hitData.launchSpeed } : {}),
    ...(event.hitData?.launchAngle !== undefined ? { launchAngle: event.hitData.launchAngle } : {})
  };
}

function buildHeroAtBat(play, gamePk) {
  const pitches = pitchEvents(play).map((event, index) => {
    const coords = event.pitchData.coordinates;
    const velocity = event.pitchData.startSpeed;
    const pitchType = event.details?.type?.code ?? "UNK";
    return {
      pitchId: event.playId,
      t: round(index * 0.8, 1),
      plateX: round(coords.pX),
      plateZ: round(coords.pZ),
      pitchType,
      velocity,
      result: normalizePitchResult(event),
      label: `${pitchType} ${velocity.toFixed(1)}`
    };
  });

  const battedBallEvent = pitchEvents(play).find((event) => event.hitData);
  const hitData = battedBallEvent?.hitData;

  return {
    gamePk,
    label: `${play.matchup.batter.fullName} vs ${play.matchup.pitcher.fullName}, ${play.about.inning}${ordinal(play.about.inning)} inning, ${EVIDENCE_DATE}`,
    computedFrom: "statcast",
    sourceUrl: `${MLB_API}/game/${gamePk}/playByPlay`,
    videoUrlTemplate: "https://baseballsavant.mlb.com/sporty-videos?playId={pitchId}",
    pitches,
    ...(hitData
      ? {
          battedBall: {
            x: hitData.coordinates?.coordX,
            y: hitData.coordinates?.coordY,
            exitVelocity: hitData.launchSpeed,
            launchAngle: hitData.launchAngle,
            result: String(play.result?.description ?? play.result?.event ?? "ball in play").toLowerCase()
          }
        }
      : {})
  };
}

function ordinal(value) {
  if (value === 1) return "st";
  if (value === 2) return "nd";
  if (value === 3) return "rd";
  return "th";
}

function scoreLine(game) {
  const away = game.teams.away;
  const home = game.teams.home;
  if (typeof away.score !== "number" || typeof home.score !== "number") {
    return undefined;
  }
  return `${home.team.abbreviation ?? home.team.name} ${home.score}, ${away.team.abbreviation ?? away.team.name} ${away.score}`;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const canonicalSchedule = await fetchJson(CANONICAL_SCHEDULE_URL);
  const evidenceSchedule = await fetchJson(EVIDENCE_SCHEDULE_URL);

  const canonicalGame = firstGame(
    canonicalSchedule,
    (game) => game.teams?.home?.team?.id === RED_SOX_ID && game.teams?.away?.team?.id === BRAVES_ID
  );
  if (!canonicalGame) {
    throw new Error("Could not resolve canonical Red Sox vs Braves game from MLB schedule.");
  }

  const evidenceGame = firstGame(
    evidenceSchedule,
    (game) =>
      game.teams?.home?.team?.id === BRAVES_ID &&
      game.teams?.away?.team?.id === RED_SOX_ID &&
      game.status?.abstractGameState === "Final"
  );
  if (!evidenceGame) {
    throw new Error("Could not resolve completed Red Sox at Braves evidence game from MLB schedule.");
  }

  const evidencePlayByPlayUrl = `${MLB_API}/game/${evidenceGame.gamePk}/playByPlay`;
  const playByPlay = await fetchJson(evidencePlayByPlayUrl);
  const plays = playByPlay.allPlays ?? [];
  const summary = summarizeBravesPlateAppearances(plays);

  const heroPlay = findPlayByAtBat(plays, 5);
  const heroReplay = buildHeroAtBat(heroPlay, evidenceGame.gamePk);

  const gameMetadata = {
    league: "MLB",
    season: Number(canonicalGame.season),
    gamePk: canonicalGame.gamePk,
    date: canonicalGame.officialDate,
    gameDateUtc: canonicalGame.gameDate,
    status: canonicalGame.status?.detailedState,
    home_team: canonicalGame.teams.home.team.name,
    away_team: canonicalGame.teams.away.team.name,
    stadium: canonicalGame.venue?.name,
    data_source: "Statcast via Baseball Savant + MLB Stats API",
    source_url: CANONICAL_SCHEDULE_URL,
    seed_evidence_game: {
      gamePk: evidenceGame.gamePk,
      date: evidenceGame.officialDate,
      away_team: evidenceGame.teams.away.team.name,
      home_team: evidenceGame.teams.home.team.name,
      score: scoreLine(evidenceGame),
      stadium: evidenceGame.venue?.name,
      source_url: evidencePlayByPlayUrl
    }
  };

  const statcastSummary = {
    canonicalGamePk: canonicalGame.gamePk,
    evidenceGamePk: evidenceGame.gamePk,
    generatedAt,
    sourceEndpoints: [
      CANONICAL_SCHEDULE_URL,
      EVIDENCE_SCHEDULE_URL,
      evidencePlayByPlayUrl,
      "https://baseballsavant.mlb.com/sporty-videos?playId={pitchId}"
    ],
    sample: {
      team: "Atlanta Braves",
      opponent: "Boston Red Sox",
      date: evidenceGame.officialDate,
      halfInnings: "bottom",
      trackedPitches: summary.trackedPitches,
      trackedBattedBalls: summary.trackedBattedBalls
    },
    pitchMix: summary.pitchMix,
    zoneDiscipline: {
      outsideZonePitches: summary.outsideZonePitches,
      swings: summary.swings,
      chaseSwings: summary.chaseSwings,
      chaseRatePct: round((summary.chaseSwings / summary.outsideZonePitches) * 100, 1),
      whiffs: summary.whiffs,
      whiffRatePct: round((summary.whiffs / summary.swings) * 100, 1)
    },
    contactQuality: {
      hardHitBalls95PlusMph: summary.hardHitBalls95PlusMph,
      battedBallLocations: summary.battedBallLocations,
      trajectories: summary.trajectories
    }
  };

  const rileyHomeRun = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "ef3bc1c2-0f99-33a8-a1c6-0ecf9f0a0172",
    "Austin Riley homered to left center on an 87.7 mph cutter in zone 5; exit velocity 104.0 mph, launch angle 31 degrees, distance 431 ft."
  );
  const rileyDouble = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "cf772f36-f0c2-31e4-934a-872533bd96fb",
    "Austin Riley doubled to left on an 88.2 mph changeup below the zone; exit velocity 101.0 mph, launch angle 12 degrees."
  );
  const mateoDouble = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "ea3dc7ac-491e-31e5-967b-189102311656",
    "Jorge Mateo doubled on a sharp line drive to left field; exit velocity 103.7 mph, launch angle 13 degrees."
  );
  const baldwinSacFly = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "72193820-d40b-39b9-b665-6f2541de65dc",
    "Drake Baldwin hit a 105.6 mph sacrifice fly to center field on a sinker."
  );
  const olsonTopBandFastball = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "4b1fbd8e-070a-3967-a121-ed8da8b4b379",
    "Matt Olson fouled a 94.0 mph four-seam fastball above the zone at plate_z 3.834."
  );
  const olsonFinishCutter = evidenceRef(
    plays,
    evidenceGame.gamePk,
    "966f2465-e9db-3236-8c8c-02e726c73f20",
    "Matt Olson struck out swinging on an 89.7 mph cutter in zone 5."
  );

  const demoBrief = {
    mode: "seeded",
    generatedAt,
    game: {
      league: "MLB",
      season: Number(canonicalGame.season),
      gamePk: canonicalGame.gamePk,
      date: canonicalGame.officialDate,
      homeTeam: canonicalGame.teams.home.team.name,
      awayTeam: canonicalGame.teams.away.team.name,
      stadium: canonicalGame.venue?.name,
      dataSource:
        "MLB Stats API schedule plus pitch-level evidence from MLB Stats API play-by-play; Baseball Savant play IDs are retained for video verification."
    },
    coachQuestion: "How do we attack the Braves' lineup tomorrow?",
    executiveSummary: `The ${CANONICAL_DATE} Red Sox-Braves game is ${canonicalGame.status?.detailedState?.toLowerCase()} for Fenway, so this seeded brief uses the completed Red Sox-Braves matchup from ${EVIDENCE_DATE}. In that sample, Atlanta hitters saw ${summary.trackedPitches} tracked pitches, put ${summary.trackedBattedBalls} balls in play, produced ${summary.hardHitBalls95PlusMph} balls at 95+ mph, and chased ${statcastSummary.zoneDiscipline.chaseRatePct}% of pitches outside the strike zone when they swung. The safest recommendation is narrow: change eye levels, avoid middle cutters to Austin Riley, and protect left-center hard contact.`,
    attackingPlan: [
      {
        id: "attack-riley-middle-cutter",
        title: "Do not give Riley a center-cut cutter after contact is timed",
        claim:
          "Austin Riley produced a 104.0 mph, 431 ft home run on a 1-2 cutter in zone 5, then later doubled at 101.0 mph on a low changeup. In this sample, he covered both the middle cutter and the low finish pitch.",
        confidence: "medium",
        status: "revised",
        evidence: [rileyHomeRun, rileyDouble],
        skepticNote: "This is one game, not a season-wide Riley weakness map. Keep the claim to pitch selection in the sampled matchup.",
        whyItMatters: "Riley changed the game on a pitch that looked like a chase or weak-contact setup but caught too much hittable space.",
        recommendedAction:
          "Open Riley with either elevated velocity above his barrel path or breaking movement away from zone 5. Do not repeat cutter-to-cutter sequencing once he has fouled off the sinker."
      }
    ],
    defensiveAlignment: [
      {
        id: "defend-left-center-contact",
        title: "Protect left and center field before over-shifting the infield",
        claim: `Atlanta put ${summary.trackedBattedBalls} tracked balls in play in the ${EVIDENCE_DATE} sample. Locations 7 and 8 accounted for ${(summary.battedBallLocations["7"] ?? 0) + (summary.battedBallLocations["8"] ?? 0)} of them, and ${summary.hardHitBalls95PlusMph} batted balls were hit 95+ mph.`,
        confidence: "medium",
        status: "accepted",
        evidence: [mateoDouble, baldwinSacFly],
        skepticNote: "The fielding-location distribution is from one completed Braves home game. Treat it as demo evidence, not a permanent spray profile.",
        whyItMatters: "The demo needs a visible defensive recommendation that is evidence-gated and narrow enough to defend.",
        recommendedAction:
          "Start LF and CF one step deeper and shade the left-center gap against the hard-contact bats; keep the second baseman honest because five tracked balls were fielded in location 4."
      }
    ],
    pitchingPlan: [
      {
        id: "pitch-olson-eye-level",
        title: "Change Olson's eye level before the finish pitch",
        claim:
          "Ryan Watson struck out Matt Olson after two fastballs up or near the top band and finished with an 89.7 mph cutter for a swinging strike.",
        confidence: "medium",
        status: "accepted",
        evidence: [olsonTopBandFastball, olsonFinishCutter],
        skepticNote: "Do not generalize this into Olson always chasing. The supported claim is the successful eye-level sequence in this at-bat.",
        whyItMatters: "It gives the coach a repeatable sequence with exact pitch evidence instead of a vague 'mix speeds' note.",
        recommendedAction: "Use four-seamers to move Olson's sight line up, then finish with a cutter only after the top-band pitch has been shown."
      }
    ],
    riskFlags: [
      {
        id: "risk-current-game-not-final",
        title: "Canonical Fenway game has not produced pitch data yet",
        claim: `The ${CANONICAL_DATE} Red Sox-Braves game is ${canonicalGame.status?.detailedState} in MLB Stats API, so completed-game pitch evidence is not available for that game at seed time.`,
        confidence: "high",
        status: "accepted",
        evidence: [
          {
            pitchId: `schedule-${canonicalGame.gamePk}`,
            gamePk: canonicalGame.gamePk,
            inning: 0,
            halfInning: "top",
            atBatIndex: 0,
            pitchNumber: 0,
            description: `MLB Stats API schedule endpoint reports gamePk ${canonicalGame.gamePk} as ${canonicalGame.status?.detailedState} for ${canonicalGame.gameDate} at ${canonicalGame.venue?.name}.`
          }
        ],
        skepticNote: "The demo must label this as seeded from a recent completed matchup until the Fenway game has live feed data.",
        whyItMatters: "It prevents the product from implying nonexistent pitch data for a game that has not started.",
        recommendedAction: `Show the Fenway game as the target context and the ${EVIDENCE_DATE} Braves matchup as the evidence source.`
      }
    ],
    coachActions: [
      `Target game: Braves at Red Sox, Fenway Park, ${CANONICAL_DATE}, gamePk ${canonicalGame.gamePk}.`,
      `Evidence seed: Red Sox at Braves, ${EVIDENCE_DATE}, gamePk ${evidenceGame.gamePk}, final ${scoreLine(evidenceGame)}.`,
      "Against Austin Riley, avoid zone-5 cutters after he has seen sinker velocity in the at-bat.",
      "Against Matt Olson, change eye level with four-seamers before using the cutter as a finish pitch.",
      "Start the outfield with left-center protection; do not oversell this as a season-long spray tendency."
    ],
    evidenceNotes: [
      `All pitch IDs in evidence come from MLB Stats API play-by-play for gamePk ${evidenceGame.gamePk}.`,
      "Baseball Savant video URLs can be formed with https://baseballsavant.mlb.com/sporty-videos?playId={pitchId}.",
      `The ${CANONICAL_DATE} canonical game is ${canonicalGame.status?.detailedState?.toLowerCase()}, so the seeded fallback intentionally uses the completed Red Sox-Braves game from ${EVIDENCE_DATE}.`,
      "Data via Statcast / Baseball Savant and the MLB Stats API. This demo is a research / exploration project built for a sports-tech hackathon."
    ]
  };

  await mkdir(PUBLIC_DATA_DIR, { recursive: true });
  await writeJson("matchroom-game-metadata.json", gameMetadata);
  await writeJson("matchroom-pitch-sequence.json", heroReplay);
  await writeJson("matchroom-statcast-summary.json", statcastSummary);
  await writeJson("matchroom-demo-brief.json", demoBrief);

  console.log(`Wrote seeded MLB demo data from real MLB endpoints into ${PUBLIC_DATA_DIR}`);
}

async function writeJson(fileName, value) {
  await writeFile(path.join(PUBLIC_DATA_DIR, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
