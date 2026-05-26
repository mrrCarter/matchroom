import demoBriefJson from "@/public/data/matchroom-demo-brief.json";
import gameMetadataJson from "@/public/data/matchroom-game-metadata.json";
import heroReplayJson from "@/public/data/matchroom-pitch-sequence.json";
import statcastSummaryJson from "@/public/data/matchroom-statcast-summary.json";
import type { HeroAtBat, StatcastSummary, VerifiedBriefResponse } from "@/lib/types/matchroom";

export const seededBrief = demoBriefJson as VerifiedBriefResponse;
export const gameMetadata = gameMetadataJson;
export const heroReplay = heroReplayJson as HeroAtBat;
export const statcastSummary = statcastSummaryJson as StatcastSummary;

export function getSeededBrief(coachQuestion?: string): VerifiedBriefResponse {
  if (!coachQuestion?.trim()) {
    return seededBrief;
  }

  return {
    ...seededBrief,
    coachQuestion: coachQuestion.trim(),
    mode: "seeded"
  };
}
