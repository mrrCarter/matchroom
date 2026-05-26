"use client";

const STAGES = [
  { key: "ingest", label: "Data Ingest", note: "Loading play-by-play + Statcast" },
  { key: "scout", label: "Scout Agent", note: "Proposing tactical hypotheses" },
  { key: "skeptic", label: "Skeptic Agent", note: "Challenging weak claims" },
  { key: "brief", label: "Verified Brief", note: "Evidence-gated coach card" },
] as const;

/** phase: 0 idle · 1 ingest · 2 scout · 3 skeptic · 4 brief done */
export function AgentRail({ phase }: { phase: number }) {
  return (
    <div className="flex flex-col gap-2">
      {STAGES.map((s, i) => {
        const stageNum = i + 1;
        const active = phase === stageNum;
        const done = phase > stageNum;
        return (
          <div
            key={s.key}
            className={[
              "rounded-xl border px-3 py-2.5 transition-all",
              active
                ? "border-green/40 bg-green/10 shadow-glow"
                : done
                  ? "border-border bg-surface-2/50"
                  : "border-border bg-surface/40",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  active ? "animate-pulse bg-green" : done ? "bg-blue" : "bg-muted/40",
                ].join(" ")}
              />
              <span
                className={[
                  "font-mono text-xs font-semibold",
                  active ? "text-green" : done ? "text-text" : "text-muted/60",
                ].join(" ")}
              >
                {s.label}
              </span>
              {done && <span className="ml-auto text-xs text-blue">✓</span>}
            </div>
            <p
              className={[
                "mt-1 pl-4 text-[11px] leading-snug",
                active ? "text-text/80" : "text-muted/60",
              ].join(" ")}
            >
              {s.note}
            </p>
          </div>
        );
      })}
    </div>
  );
}
