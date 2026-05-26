"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

interface EvidenceRef {
  pitchId?: string;
  description?: string;
}
interface Insight {
  id: string;
  title: string;
  claim: string;
  confidence: "low" | "medium" | "high";
  status: "accepted" | "revised" | "rejected";
  evidence?: EvidenceRef[];
  skepticNote?: string;
}
interface Brief {
  mode?: string;
  game?: { homeTeam?: string; awayTeam?: string; stadium?: string; date?: string };
  coachQuestion?: string;
  executiveSummary?: string;
  attackingPlan?: Insight[];
  pitchingPlan?: Insight[];
  defensiveAlignment?: Insight[];
}

const CONF: Record<string, string> = {
  high: "text-green ring-green/30 bg-green/10",
  medium: "text-gold ring-gold/30 bg-gold/10",
  low: "text-muted ring-border bg-surface-2/60",
};

export function BriefPreview() {
  const [brief, setBrief] = useState<Brief | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetchWithTimeout("/api/demo-brief", {
      signal: controller.signal,
      timeoutMs: 6000,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() =>
        fetchWithTimeout("/data/matchroom-demo-brief.json", {
          signal: controller.signal,
          timeoutMs: 6000,
        }).then((r) => r.json()),
      )
      .then((d: Brief) => {
        if (!cancelled) setBrief(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const insights = [
    ...(brief?.attackingPlan ?? []),
    ...(brief?.pitchingPlan ?? []),
  ].slice(0, 2);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A real brief, not a wall of charts
          </h2>
          <p className="mt-3 text-muted">
            Every claim below is generated from real Statcast evidence and has
            already survived the skeptic. This is the seeded output of the live
            pipeline.
          </p>
        </div>
        <Link
          href="/demo"
          className="shrink-0 rounded-xl border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-blue/40 hover:text-blue"
        >
          Open the full demo →
        </Link>
      </div>

      <div className="mt-10 glass rounded-3xl p-6 sm:p-8">
        {/* header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4 text-sm">
          <span className="rounded-full bg-green/15 px-3 py-1 font-mono text-xs uppercase tracking-wide text-green ring-1 ring-green/30">
            {brief?.mode === "live" ? "Live agent mode" : "Seeded · real data"}
          </span>
          <span className="text-muted">
            {brief?.game
              ? `${brief.game.awayTeam} @ ${brief.game.homeTeam} · ${brief.game.stadium ?? ""} · ${brief.game.date ?? ""}`
              : "Red Sox vs Braves · Fenway Park"}
          </span>
        </div>

        {/* coach question + summary */}
        {brief?.coachQuestion && (
          <p className="mt-5 text-sm font-medium text-blue">
            “{brief.coachQuestion}”
          </p>
        )}
        {brief?.executiveSummary && (
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-text/90">
            {brief.executiveSummary}
          </p>
        )}

        {/* insight cards */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {insights.length === 0 && (
            <p className="text-sm text-muted">
              Loading the verified brief…
            </p>
          )}
          {insights.map((ins) => (
            <article
              key={ins.id}
              className="rounded-2xl border border-border bg-surface-2/50 p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ring-1 ${CONF[ins.confidence] ?? CONF.low}`}
                >
                  {ins.confidence} · {ins.status}
                </span>
                {ins.evidence && ins.evidence.length > 0 && (
                  <span className="font-mono text-[10px] text-muted">
                    {ins.evidence.length} evidence ref
                    {ins.evidence.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h3 className="text-[15px] font-semibold leading-snug">
                {ins.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {ins.claim}
              </p>
              {ins.skepticNote && (
                <div className="mt-3 rounded-lg border-l-2 border-gold/60 bg-gold/5 px-3 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-gold">
                    Skeptic
                  </span>
                  <p className="mt-1 text-[12px] leading-relaxed text-text/80">
                    {ins.skepticNote}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
