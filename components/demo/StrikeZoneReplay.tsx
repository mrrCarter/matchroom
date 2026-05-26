"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PitchPoint } from "@/lib/types/matchroom";

const SVG = 100;
const X_MIN = -1.5;
const X_MAX = 1.5;
const Z_MIN = 1.0;
const Z_MAX = 4.0;
const toX = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * SVG;
const toY = (z: number) => SVG - ((z - Z_MIN) / (Z_MAX - Z_MIN)) * SVG;

const ZONE = { left: toX(-0.83), right: toX(0.83), top: toY(3.4), bottom: toY(1.6) };

const RESULT_COLOR: Record<PitchPoint["result"], string> = {
  ball: "#66B3FF",
  called_strike: "#FFC857",
  swing_miss: "#5BF2A5",
  foul: "#A9B2C7",
  in_play: "#FF6B6B",
};
const RESULT_LABEL: Record<PitchPoint["result"], string> = {
  ball: "Ball",
  called_strike: "Called strike",
  swing_miss: "Swing & miss",
  foul: "Foul",
  in_play: "In play",
};

/** playToken: increment to (re)play the sequence. */
export function StrikeZoneReplay({
  pitches,
  playToken,
}: {
  pitches: PitchPoint[];
  playToken: number;
}) {
  const [shown, setShown] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [selfReplay, setSelfReplay] = useState(0);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setShown(0);
    pitches.forEach((_, i) => {
      timers.current.push(setTimeout(() => setShown(i + 1), 450 * (i + 1)));
    });
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pitches, playToken, selfReplay]);

  const visible = pitches.slice(0, shown);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
          Strike zone · catcher view
        </span>
        <button
          type="button"
          onClick={() => setSelfReplay((n) => n + 1)}
          className="rounded-md border border-border px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:text-text"
        >
          ↻ Replay
        </button>
      </div>

      <svg
        viewBox="0 0 100 100"
        className="aspect-square w-full rounded-xl bg-surface-2/60 ring-1 ring-border"
        role="img"
        aria-label="Strike zone with plotted pitches"
      >
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
        <path
          d="M 38 96 L 62 96 L 62 92 L 50 88 L 38 92 Z"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="0.4"
        />
        {visible.map((p, i) => (
          <motion.g
            key={p.pitchId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
          >
            <circle
              cx={toX(p.plateX)}
              cy={toY(p.plateZ)}
              r="3.6"
              fill={RESULT_COLOR[p.result]}
              fillOpacity={0.85}
              stroke="#060816"
              strokeWidth="0.9"
            />
            <text
              x={toX(p.plateX)}
              y={toY(p.plateZ) + 1.4}
              fontSize="3.4"
              textAnchor="middle"
              fill="#060816"
              className="font-mono font-bold"
            >
              {i + 1}
            </text>
          </motion.g>
        ))}
      </svg>

      {/* sequence list */}
      <ol className="flex flex-col gap-1">
        {pitches.map((p, i) => (
          <li
            key={p.pitchId}
            className={[
              "flex items-center gap-2 rounded-md px-2 py-1 font-mono text-[11px] transition-opacity",
              i < shown ? "opacity-100" : "opacity-30",
            ].join(" ")}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: RESULT_COLOR[p.result] }}
            />
            <span className="w-4 text-muted">{i + 1}</span>
            <span className="text-text">
              {p.pitchType} {p.velocity.toFixed(1)} mph
            </span>
            <span className="ml-auto text-muted">{RESULT_LABEL[p.result]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
