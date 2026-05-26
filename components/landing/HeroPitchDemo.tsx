"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

/**
 * Hero animation for the landing page (spec v1.2 §6).
 * A single high-leverage at-bat plays out: pitches plot inside the strike zone,
 * the Scout proposes a pattern, the Skeptic narrows it, and a verified coach
 * note appears with a defensive-shift cue.
 *
 * Pitch coordinates come from real Statcast data loaded from
 * /data/matchroom-pitch-sequence.json (owned by the data lane). Until that file
 * is present, a representative sequence is shown and labelled as such — no
 * fabricated values are ever presented as real Statcast output.
 */

type PitchResult =
  | "ball"
  | "called_strike"
  | "swing_miss"
  | "foul"
  | "in_play";

interface HeroPitch {
  pitchId: string;
  plateX: number; // feet, horizontal at plate (~[-1.5, 1.5])
  plateZ: number; // feet, vertical at plate (~[1.0, 4.0])
  pitchType: string; // FF, SL, CH, CU, SI...
  velocity: number; // mph
  result: PitchResult;
}

interface PitchSequenceFile {
  pitches: HeroPitch[];
  label?: string;
}

// Representative sequence (schematic, clearly labelled in the UI as illustrative
// until the real Statcast seed lands). Shape matches spec §7 PitchPoint.
const REPRESENTATIVE: HeroPitch[] = [
  { pitchId: "r1", plateX: 0.0, plateZ: 3.1, pitchType: "FF", velocity: 96.4, result: "called_strike" },
  { pitchId: "r2", plateX: -0.55, plateZ: 2.4, pitchType: "FF", velocity: 95.8, result: "foul" },
  { pitchId: "r3", plateX: 0.62, plateZ: 1.7, pitchType: "SL", velocity: 87.1, result: "ball" },
  { pitchId: "r4", plateX: 0.78, plateZ: 1.35, pitchType: "SL", velocity: 86.5, result: "swing_miss" },
];

const RESULT_COLOR: Record<PitchResult, string> = {
  ball: "#66B3FF",
  called_strike: "#FFC857",
  swing_miss: "#5BF2A5",
  foul: "#A9B2C7",
  in_play: "#FF6B6B",
};

const AGENTS = [
  "Data Ingest",
  "Scout Agent",
  "Skeptic Agent",
  "Verified Brief",
] as const;

// Phase → which agent in the rail is "live"
const PHASE_AGENT: Record<number, number> = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 3, 5: 3 };

// Strike-zone coordinate mapping into the SVG viewbox (0..100 each axis).
const SVG = 100;
const X_MIN = -1.5;
const X_MAX = 1.5;
const Z_MIN = 1.0;
const Z_MAX = 4.0;
const toX = (plateX: number) => ((plateX - X_MIN) / (X_MAX - X_MIN)) * SVG;
// SVG y grows downward; higher plateZ = higher in zone = smaller y.
const toY = (plateZ: number) => SVG - ((plateZ - Z_MIN) / (Z_MAX - Z_MIN)) * SVG;

// 3x3 strike-zone box in feet → svg.
const ZONE = {
  left: toX(-0.83),
  right: toX(0.83),
  top: toY(3.4),
  bottom: toY(1.6),
};

export function HeroPitchDemo() {
  const [phase, setPhase] = useState(0);
  const [pitches, setPitches] = useState<HeroPitch[]>(REPRESENTATIVE);
  const [isReal, setIsReal] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Load the real Statcast seed if the data lane has shipped it.
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetchWithTimeout("/data/matchroom-pitch-sequence.json", {
      signal: controller.signal,
      timeoutMs: 6000,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: PitchSequenceFile) => {
        if (cancelled || !data?.pitches?.length) return;
        setPitches(data.pitches.slice(0, 6));
        setIsReal(true);
      })
      .catch(() => {
        /* keep representative sequence */
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Phase timeline. Self-loops. All timers cleaned up on unmount.
  useEffect(() => {
    const schedule = (steps: Array<[number, number]>) => {
      steps.forEach(([p, delay]) => {
        timers.current.push(setTimeout(() => setPhase(p), delay));
      });
    };
    const run = () => {
      // ingest → pitches → scout → skeptic → verified → hold → restart
      schedule([
        [0, 0],
        [1, 1100],
        [2, 3200],
        [3, 4900],
        [4, 6600],
        [5, 8600],
      ]);
      timers.current.push(setTimeout(run, 11000));
    };
    run();
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pitches]);

  const visiblePitches = phase >= 1 ? pitches : [];
  const liveAgent = PHASE_AGENT[phase] ?? 0;

  return (
    <div className="glass relative w-full overflow-hidden rounded-2xl p-4 shadow-glow-blue">
      {/* status strip */}
      <div className="mb-3 flex items-center justify-between text-[11px] font-mono text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
          MLB · Red Sox vs Braves · Fenway · 2026-05-26
        </span>
        <span className={isReal ? "text-green" : "text-gold"}>
          {isReal ? "Statcast" : "illustrative"}
        </span>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-3">
        {/* Strike zone */}
        <div className="relative">
          <svg
            viewBox="0 0 100 100"
            className="aspect-square w-full rounded-xl bg-surface-2/60 ring-1 ring-border"
            role="img"
            aria-label="Strike zone with pitch locations"
          >
            {/* 3x3 strike zone grid */}
            <rect
              x={ZONE.left}
              y={ZONE.top}
              width={ZONE.right - ZONE.left}
              height={ZONE.bottom - ZONE.top}
              fill="rgba(102,179,255,0.04)"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="0.6"
            />
            {[1, 2].map((i) => {
              const gx = ZONE.left + ((ZONE.right - ZONE.left) / 3) * i;
              const gy = ZONE.top + ((ZONE.bottom - ZONE.top) / 3) * i;
              return (
                <g key={i} stroke="rgba(255,255,255,0.1)" strokeWidth="0.4">
                  <line x1={gx} y1={ZONE.top} x2={gx} y2={ZONE.bottom} />
                  <line x1={ZONE.left} y1={gy} x2={ZONE.right} y2={gy} />
                </g>
              );
            })}

            {/* home plate hint */}
            <path
              d="M 38 96 L 62 96 L 62 92 L 50 88 L 38 92 Z"
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="0.4"
            />

            {/* pitches plot in one at a time */}
            <AnimatePresence>
              {visiblePitches.map((p, i) => (
                <motion.g
                  key={p.pitchId}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.45, type: "spring", stiffness: 260, damping: 18 }}
                >
                  <circle
                    cx={toX(p.plateX)}
                    cy={toY(p.plateZ)}
                    r="3.4"
                    fill={RESULT_COLOR[p.result]}
                    fillOpacity={0.85}
                    stroke="#060816"
                    strokeWidth="0.8"
                  />
                  <text
                    x={toX(p.plateX)}
                    y={toY(p.plateZ) - 5}
                    fontSize="4.2"
                    textAnchor="middle"
                    fill="#F5F7FB"
                    className="font-mono"
                  >
                    {p.pitchType} {p.velocity.toFixed(1)}
                  </text>
                </motion.g>
              ))}
            </AnimatePresence>
          </svg>
        </div>

        {/* Agent rail */}
        <div className="flex flex-col gap-2">
          {AGENTS.map((agent, i) => {
            const active = i === liveAgent;
            const done = i < liveAgent;
            return (
              <div
                key={agent}
                className={[
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-mono transition-all",
                  active
                    ? "border-green/40 bg-green/10 text-green"
                    : done
                      ? "border-border bg-surface-2/50 text-muted"
                      : "border-border bg-surface/40 text-muted/60",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    active ? "animate-pulse bg-green" : done ? "bg-blue" : "bg-muted/40",
                  ].join(" ")}
                />
                {agent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase cards */}
      <div className="relative mt-3 min-h-[78px]">
        <AnimatePresence mode="wait">
          {phase >= 2 && (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl border border-border bg-surface-2/60 p-3"
            >
              <PhaseCard phase={phase} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: number }) {
  if (phase === 2) {
    return (
      <Card label="Scout hypothesis" color="text-blue">
        Pattern candidate: batter chases breaking balls off the plate low-and-away
        in 2-strike counts.
      </Card>
    );
  }
  if (phase === 3) {
    return (
      <Card label="Skeptic check" color="text-gold">
        Sample size acceptable. Claim narrowed: holds only when the at-bat opened
        with a fastball above 95. Otherwise chase rate drops to league average.
      </Card>
    );
  }
  return (
    <Card label="Verified coach note" color="text-green">
      Establish the fastball above 95 early, then attack below the zone with
      breaking stuff in 2-strike counts. Shade 3B toward the line on pull-side
      weak contact.
    </Card>
  );
}

function Card({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className={`mb-1 text-[11px] font-mono font-semibold uppercase tracking-wide ${color}`}>
        {label}
      </div>
      <p className="text-[13px] leading-snug text-text/90">{children}</p>
    </>
  );
}
