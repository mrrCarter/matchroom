"use client";

import type {
  EvidenceRef,
  TacticalInsight,
  VerifiedBriefResponse,
} from "@/lib/types/matchroom";

const CONF: Record<string, string> = {
  high: "text-green ring-green/30 bg-green/10",
  medium: "text-gold ring-gold/30 bg-gold/10",
  low: "text-muted ring-border bg-surface-2/60",
};

const SECTIONS: { key: keyof VerifiedBriefResponse; label: string }[] = [
  { key: "pitchingPlan", label: "Pitching plan" },
  { key: "attackingPlan", label: "Attacking plan" },
  { key: "defensiveAlignment", label: "Defensive alignment" },
  { key: "riskFlags", label: "Risk flags" },
];

export function VerifiedBriefPanel({
  brief,
  onShowEvidence,
}: {
  brief: VerifiedBriefResponse;
  onShowEvidence: (refs: EvidenceRef[], title: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {brief.executiveSummary && (
        <div className="rounded-xl border border-border bg-surface-2/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wide text-green">
            Executive summary
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-text/90">
            {brief.executiveSummary}
          </p>
        </div>
      )}

      {SECTIONS.map(({ key, label }) => {
        const items = brief[key] as TacticalInsight[] | undefined;
        if (!items || items.length === 0) return null;
        return (
          <div key={key}>
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-muted">
              {label}
            </h3>
            <div className="flex flex-col gap-2.5">
              {items.map((ins) => (
                <article
                  key={ins.id}
                  className="rounded-xl border border-border bg-surface/50 p-3.5"
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ring-1 ${CONF[ins.confidence] ?? CONF.low}`}
                    >
                      {ins.confidence} · {ins.status}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-semibold leading-snug">
                    {ins.title}
                  </h4>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {ins.claim}
                  </p>
                  {ins.skepticNote && (
                    <div className="mt-2 rounded-lg border-l-2 border-gold/60 bg-gold/5 px-2.5 py-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wide text-gold">
                        Skeptic
                      </span>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-text/80">
                        {ins.skepticNote}
                      </p>
                    </div>
                  )}
                  {ins.recommendedAction && (
                    <p className="mt-2 text-[11px] text-blue">
                      → {ins.recommendedAction}
                    </p>
                  )}
                  {ins.evidence && ins.evidence.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onShowEvidence(ins.evidence, ins.title)}
                      className="mt-2 font-mono text-[10px] text-muted underline-offset-2 hover:text-text hover:underline"
                    >
                      Show evidence ({ins.evidence.length})
                    </button>
                  )}
                </article>
              ))}
            </div>
          </div>
        );
      })}

      {brief.coachActions && brief.coachActions.length > 0 && (
        <div className="rounded-xl border border-green/30 bg-green/5 p-4">
          <div className="font-mono text-[10px] uppercase tracking-wide text-green">
            Coach actions
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {brief.coachActions.map((a, i) => (
              <li key={i} className="flex gap-2 text-[12px] text-text/90">
                <span className="text-green">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
