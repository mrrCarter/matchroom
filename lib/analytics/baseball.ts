export type PitchResult = "ball" | "called_strike" | "swing_miss" | "foul" | "in_play";

export interface MlbPlayEvent {
  isPitch?: boolean;
  playId?: string;
  pitchNumber?: number;
  details?: {
    code?: string;
    description?: string;
    isBall?: boolean;
    isStrike?: boolean;
    isInPlay?: boolean;
    type?: {
      code?: string;
      description?: string;
    };
  };
  pitchData?: {
    startSpeed?: number;
    strikeZoneTop?: number;
    strikeZoneBottom?: number;
    zone?: number;
    coordinates?: {
      pX?: number;
      pZ?: number;
    };
  };
  hitData?: {
    launchSpeed?: number;
    launchAngle?: number;
    totalDistance?: number;
    trajectory?: string;
    location?: string;
    coordinates?: {
      coordX?: number;
      coordY?: number;
    };
  };
}

export interface MlbPlay {
  result?: {
    event?: string;
    description?: string;
  };
  about?: {
    atBatIndex?: number;
    inning?: number;
    halfInning?: "top" | "bottom";
  };
  matchup?: {
    batter?: {
      fullName?: string;
    };
    pitcher?: {
      fullName?: string;
    };
  };
  playEvents?: MlbPlayEvent[];
}

export interface NormalizedPitch {
  pitchId: string;
  gamePk: number;
  inning: number;
  halfInning: "top" | "bottom";
  atBatIndex: number;
  pitchNumber: number;
  pitcher?: string;
  batter?: string;
  pitchType?: string;
  description: string;
  plateX: number;
  plateZ: number;
  velocity?: number;
  zone?: number;
  result: PitchResult;
  exitVelocity?: number;
  launchAngle?: number;
}

export interface BaseballSummary {
  trackedPitches: number;
  trackedBattedBalls: number;
  pitchMix: Record<string, number>;
  outsideZonePitches: number;
  swings: number;
  chaseSwings: number;
  whiffs: number;
  hardHitBalls95PlusMph: number;
  battedBallLocations: Record<string, number>;
  trajectories: Record<string, number>;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isTrackedPitch(event: MlbPlayEvent): boolean {
  const coords = event.pitchData?.coordinates;
  return event.isPitch === true && isNumber(coords?.pX) && isNumber(coords?.pZ);
}

export function normalizePitchResult(event: MlbPlayEvent): PitchResult {
  const code = event.details?.code;
  const description = (event.details?.description ?? "").toLowerCase();

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

export function didSwing(event: MlbPlayEvent): boolean {
  const result = normalizePitchResult(event);
  return result === "swing_miss" || result === "foul" || result === "in_play";
}

export function isWhiff(event: MlbPlayEvent): boolean {
  return normalizePitchResult(event) === "swing_miss";
}

export function isOutsideStrikeZone(event: MlbPlayEvent): boolean {
  const coords = event.pitchData?.coordinates;
  const plateX = coords?.pX;
  const plateZ = coords?.pZ;
  const zoneBottom = event.pitchData?.strikeZoneBottom ?? 1.5;
  const zoneTop = event.pitchData?.strikeZoneTop ?? 3.5;

  if (!isNumber(plateX) || !isNumber(plateZ)) {
    return false;
  }

  return Math.abs(plateX) > 0.83 || plateZ < zoneBottom || plateZ > zoneTop;
}

export function extractTrackedPitches(plays: MlbPlay[], gamePk: number, halfInning?: "top" | "bottom"): NormalizedPitch[] {
  const pitches: NormalizedPitch[] = [];

  for (const play of plays) {
    if (halfInning && play.about?.halfInning !== halfInning) {
      continue;
    }

    for (const event of play.playEvents ?? []) {
      if (!isTrackedPitch(event)) {
        continue;
      }

      const coords = event.pitchData?.coordinates;
      pitches.push({
        pitchId: event.playId ?? `${gamePk}-${play.about?.atBatIndex ?? 0}-${event.pitchNumber ?? 0}`,
        gamePk,
        inning: play.about?.inning ?? 0,
        halfInning: play.about?.halfInning ?? "top",
        atBatIndex: play.about?.atBatIndex ?? 0,
        pitchNumber: event.pitchNumber ?? 0,
        pitcher: play.matchup?.pitcher?.fullName,
        batter: play.matchup?.batter?.fullName,
        pitchType: event.details?.type?.code,
        description: event.details?.description ?? play.result?.description ?? "Tracked pitch",
        plateX: coords?.pX ?? 0,
        plateZ: coords?.pZ ?? 0,
        velocity: event.pitchData?.startSpeed,
        zone: event.pitchData?.zone,
        result: normalizePitchResult(event),
        exitVelocity: event.hitData?.launchSpeed,
        launchAngle: event.hitData?.launchAngle
      });
    }
  }

  return pitches;
}

export function summarizePitchEvents(plays: MlbPlay[], halfInning?: "top" | "bottom"): BaseballSummary {
  const summary: BaseballSummary = {
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
    if (halfInning && play.about?.halfInning !== halfInning) {
      continue;
    }

    for (const event of play.playEvents ?? []) {
      if (!isTrackedPitch(event)) {
        continue;
      }

      summary.trackedPitches += 1;

      const pitchType = event.details?.type?.code ?? "UNK";
      summary.pitchMix[pitchType] = (summary.pitchMix[pitchType] ?? 0) + 1;

      const outside = isOutsideStrikeZone(event);
      const swung = didSwing(event);

      if (outside) {
        summary.outsideZonePitches += 1;
      }
      if (swung) {
        summary.swings += 1;
      }
      if (outside && swung) {
        summary.chaseSwings += 1;
      }
      if (isWhiff(event)) {
        summary.whiffs += 1;
      }

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
