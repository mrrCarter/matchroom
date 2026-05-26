"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";
import type { PitcherSeasonStats, UpcomingGame, UpcomingTeamSnapshot } from "@/lib/types/matchroom";

function formatDate(value?: string): string {
  if (!value) return "Time TBD";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

function recordLabel(team: UpcomingTeamSnapshot): string {
  return team.record ? `${team.record.wins}-${team.record.losses} (${team.record.pct})` : "Record TBD";
}

function statLine(stats?: PitcherSeasonStats): string {
  if (!stats) return "Season stats loading";
  const pieces = [
    stats.era ? `${stats.era} ERA` : undefined,
    stats.whip ? `${stats.whip} WHIP` : undefined,
    typeof stats.strikeOuts === "number" ? `${stats.strikeOuts} K` : undefined,
    typeof stats.baseOnBalls === "number" ? `${stats.baseOnBalls} BB` : undefined,
  ].filter(Boolean);

  return pieces.length ? pieces.join(" · ") : "Season stats unavailable";
}

function proofLine(game: UpcomingGame): string {
  const proof = game.evidenceFallback;
  return `${proof.chaseRatePct}% chase rate (${proof.chaseSwings}/${proof.outsideZonePitches} out-of-zone pitches chased), ${proof.whiffRatePct}% whiff rate, ${proof.hardHitBalls95PlusMph} hard-hit balls from ${proof.trackedPitches} tracked pitches.`;
}

function PitcherBlock({ team }: { team: UpcomingTeamSnapshot }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
            {team.abbreviation ?? team.name}
          </p>
          <h3 className="mt-1 text-sm font-semibold">{team.name}</h3>
        </div>
        <span className="shrink-0 rounded-md bg-surface px-2 py-1 font-mono text-[10px] text-muted ring-1 ring-border">
          {recordLabel(team)}
        </span>
      </div>
      <p className="mt-4 text-[13px] font-medium text-text/90">
        {team.probablePitcher?.fullName ?? "Probable pitcher TBD"}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {statLine(team.probablePitcher?.stats)}
      </p>
    </div>
  );
}

export function UpcomingGameCard() {
  const [game, setGame] = useState<UpcomingGame | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetchWithTimeout("/api/upcoming-game", {
      cache: "no-store",
      signal: controller.signal,
      timeoutMs: 8000,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: UpcomingGame) => {
        if (!cancelled) setGame(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (failed) {
    return null;
  }

  const href = game
    ? `/demo?run=1&gamePk=${game.gamePk}&question=${encodeURIComponent(game.coachQuestion)}`
    : "/demo?run=1";

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass grid gap-6 rounded-3xl p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-blue ring-1 ring-blue/25">
            Live MLB schedule
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {game ? game.matchupLabel : "Finding Boston's next game"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {game
              ? `${game.status} · ${game.venue} · ${formatDate(game.gameDateUtc)}`
              : "Pulling the current Red Sox schedule from the MLB Stats API."}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text/80">
            {game
              ? `MatchRoom targets gamePk ${game.gamePk} and keeps the tactical evidence honest: ${proofLine(game)} Evidence stays tied to gamePk ${game.evidenceFallback.gamePk} until the upcoming feed has completed pitch data.`
              : "No placeholder matchup is shown here. If the API is slow, the seeded brief still works."}
          </p>
          <Link
            href={href}
            className="mt-6 inline-flex rounded-xl bg-green px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Build brief for this game
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {game ? (
            <>
              <PitcherBlock team={game.away} />
              <PitcherBlock team={game.home} />
            </>
          ) : (
            <>
              <div className="h-36 rounded-2xl border border-border bg-surface-2/40" />
              <div className="h-36 rounded-2xl border border-border bg-surface-2/40" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
