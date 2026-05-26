"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AgentRail } from "@/components/demo/AgentRail";
import { StrikeZoneReplay } from "@/components/demo/StrikeZoneReplay";
import { VerifiedBriefPanel } from "@/components/demo/VerifiedBriefPanel";
import { EvidenceDrawer } from "@/components/demo/EvidenceDrawer";
import type {
  EvidenceRef,
  PitchPoint,
  UpcomingGame,
  VerifiedBriefResponse,
} from "@/lib/types/matchroom";

interface DrawerState {
  open: boolean;
  title: string;
  refs: EvidenceRef[];
}

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  return fetch(url, init).then((response) =>
    response.ok ? response.json() : Promise.reject(new Error(`Request failed: ${url}`))
  );
}

async function loadInitialDemoData(
  signal: AbortSignal,
  queryGamePk: string | null
): Promise<{
  brief: VerifiedBriefResponse | null;
  pitches: PitchPoint[];
  upcomingGame: UpcomingGame | null;
}> {
  let brief: VerifiedBriefResponse | null = null;
  let pitches: PitchPoint[] = [];
  let upcomingGame: UpcomingGame | null = null;

  try {
    brief = await fetchJson<VerifiedBriefResponse>("/api/demo-brief", { signal });
  } catch (error) {
    if (isAbortError(error)) {
      return { brief, pitches, upcomingGame };
    }
    brief = await fetchJson<VerifiedBriefResponse>("/data/matchroom-demo-brief.json", {
      signal,
    });
  }

  try {
    const pitchData = await fetchJson<{ pitches?: PitchPoint[] }>(
      "/data/matchroom-pitch-sequence.json",
      { signal }
    );
    pitches = pitchData.pitches ?? [];
  } catch (error) {
    if (!isAbortError(error)) {
      pitches = [];
    }
  }

  const upcomingUrl = queryGamePk
    ? `/api/upcoming-game?gamePk=${encodeURIComponent(queryGamePk)}`
    : "/api/upcoming-game";
  try {
    upcomingGame = await fetchJson<UpcomingGame>(upcomingUrl, {
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (!isAbortError(error)) {
      upcomingGame = null;
    }
  }

  return { brief, pitches, upcomingGame };
}

export default function DemoPage() {
  const [brief, setBrief] = useState<VerifiedBriefResponse | null>(null);
  const [upcomingGame, setUpcomingGame] = useState<UpcomingGame | null>(null);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);
  const [pitches, setPitches] = useState<PitchPoint[]>([]);
  const [phase, setPhase] = useState(0); // 0 idle · 1..4 pipeline
  const [playToken, setPlayToken] = useState(0);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    title: "",
    refs: [],
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoStarted = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(window.location.search);
    void loadInitialDemoData(controller.signal, params.get("gamePk"))
      .then((data) => {
        if (controller.signal.aborted) return;
        setBrief(data.brief);
        if (data.pitches.length > 0) setPitches(data.pitches);
        if (data.upcomingGame) {
          setUpcomingGame(data.upcomingGame);
          setSelectedGamePk(data.upcomingGame.gamePk);
        }
      })
      .catch((error) => {
        if (!isAbortError(error)) return;
      });

    return () => {
      controller.abort();
    };
  }, []);

  const run = useCallback((gameOverride?: UpcomingGame | null) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const gameForRequest =
      gameOverride ??
      (selectedGamePk && upcomingGame?.gamePk === selectedGamePk ? upcomingGame : null);
    setBackendError(null);
    setIsSubmitting(true);
    setPhase(1);
    setPlayToken((n) => n + 1);
    fetch("/api/demo-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachQuestion: gameForRequest?.coachQuestion ?? brief?.coachQuestion,
        gamePk: gameForRequest?.gamePk,
        mode: "live",
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: VerifiedBriefResponse) => setBrief(d))
      .catch(() => {
        setBackendError("API fallback unavailable; showing the loaded seeded brief.");
      })
      .finally(() => setIsSubmitting(false));

    [2, 3, 4].forEach((p, i) => {
      timers.current.push(setTimeout(() => setPhase(p), 900 + i * 1300));
    });
  }, [brief?.coachQuestion, selectedGamePk, upcomingGame]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (autoStarted.current || !brief || pitches.length === 0) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("run") === "1") {
      const queryGamePk = Number(params.get("gamePk"));
      if (Number.isFinite(queryGamePk) && queryGamePk > 0 && !upcomingGame) {
        return;
      }
      autoStarted.current = true;
      run(Number.isFinite(queryGamePk) && queryGamePk > 0 ? upcomingGame : undefined);
    }
  }, [brief, pitches.length, run, upcomingGame]);

  const running = (phase > 0 && phase < 4) || isSubmitting;
  const showBrief = phase >= 4;
  const game = brief?.game;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* mode banner */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-green/15 px-3 py-1 font-mono text-xs uppercase tracking-wide text-green ring-1 ring-green/30">
            {brief?.mode === "live" ? "Live agent mode" : "Seeded demo mode"}
          </span>
          <span className="text-sm text-muted">
            Built from real Statcast data · evidence-gated claims only
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* LEFT — coach question + context */}
          <aside className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-5">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted">
                Match
              </div>
              <div className="mt-1 text-[15px] font-semibold leading-snug">
                {game ? `${game.awayTeam} @ ${game.homeTeam}` : "Braves @ Red Sox"}
              </div>
              <div className="mt-1 text-xs text-muted">
                {game?.stadium ?? "Fenway Park"} · {game?.date ?? "2026-05-26"}
                {game?.gamePk ? ` · gamePk ${game.gamePk}` : ""}
              </div>
            </div>

            {upcomingGame && (
              <div className="glass rounded-2xl p-5">
                <div className="font-mono text-[10px] uppercase tracking-wide text-green">
                  Live upcoming game
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug">
                  {upcomingGame.matchupLabel}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {upcomingGame.status} · {upcomingGame.venue} · gamePk{" "}
                  {upcomingGame.gamePk}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted">
                  Probables: {upcomingGame.away.probablePitcher?.fullName ?? "TBD"} vs{" "}
                  {upcomingGame.home.probablePitcher?.fullName ?? "TBD"}
                </p>
                <p className="mt-3 rounded-lg border border-green/20 bg-green/5 px-3 py-2 text-xs leading-relaxed text-text/85">
                  Proof anchor: {upcomingGame.evidenceFallback.chaseRatePct}% chase
                  rate ({upcomingGame.evidenceFallback.chaseSwings}/
                  {upcomingGame.evidenceFallback.outsideZonePitches} out-zone
                  pitches chased) from {upcomingGame.evidenceFallback.trackedPitches}{" "}
                  tracked pitches.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGamePk(upcomingGame.gamePk);
                    run(upcomingGame);
                  }}
                  disabled={running}
                  className="mt-4 w-full rounded-xl border border-green/30 bg-green/10 px-4 py-2.5 text-sm font-semibold text-green transition-colors enabled:hover:bg-green/15 disabled:opacity-50"
                >
                  Build against upcoming game
                </button>
              </div>
            )}

            <div className="glass rounded-2xl p-5">
              <div className="font-mono text-[10px] uppercase tracking-wide text-blue">
                Coach question
              </div>
              <p className="mt-2 text-sm leading-relaxed text-text/90">
                {brief?.coachQuestion ??
                  "How do we attack the Braves' lineup tomorrow and where should we hide our weak defenders?"}
              </p>
              <button
                type="button"
                onClick={() => run()}
                disabled={running || !brief}
                className="mt-4 w-full rounded-xl bg-green px-4 py-2.5 text-sm font-semibold text-bg transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
              >
                {running
                  ? "Running MatchRoom…"
                  : showBrief
                    ? "Run again"
                    : "Run MatchRoom"}
              </button>
              {backendError && (
                <p className="mt-2 text-xs leading-relaxed text-gold">
                  {backendError}
                </p>
              )}
            </div>

            <p className="px-1 text-[11px] leading-relaxed text-muted/70">
              Data via Statcast / Baseball Savant and the MLB Stats API. Research
              / exploration project — no invented values.
            </p>
          </aside>

          {/* CENTER — strike zone replay */}
          <section className="glass rounded-2xl p-5">
            {pitches.length > 0 ? (
              <StrikeZoneReplay pitches={pitches} playToken={playToken} />
            ) : (
              <p className="text-sm text-muted">Loading pitch sequence…</p>
            )}
          </section>

          {/* RIGHT — agent rail + verified brief */}
          <section className="flex flex-col gap-4">
            <AgentRail phase={phase} />
            <div className="glass rounded-2xl p-5">
              {showBrief && brief ? (
                <VerifiedBriefPanel
                  brief={brief}
                  onShowEvidence={(refs, title) =>
                    setDrawer({ open: true, title, refs })
                  }
                />
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                  <p className="text-sm text-muted">
                    {running
                      ? "Scout proposing, skeptic challenging…"
                      : "Press Run MatchRoom to build the verified brief."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <EvidenceDrawer
        open={drawer.open}
        title={drawer.title}
        refs={drawer.refs}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
      />
    </>
  );
}
