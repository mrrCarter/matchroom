"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { EvidenceRef } from "@/lib/types/matchroom";

const SAVANT = "https://baseballsavant.mlb.com/sporty-videos?playId=";

export function EvidenceDrawer({
  open,
  title,
  refs,
  onClose,
}: {
  open: boolean;
  title: string;
  refs: EvidenceRef[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-6"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="mx-auto max-w-4xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-green">
                    Evidence · {refs.length} reference{refs.length !== 1 ? "s" : ""}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-text"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {refs.map((r, i) => (
                  <div
                    key={`${r.pitchId}-${i}`}
                    className="rounded-xl border border-border bg-surface-2/50 p-4"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted">
                      <span>
                        {r.halfInning === "top" ? "Top" : "Bot"} {r.inning} · AB{" "}
                        {r.atBatIndex} · P{r.pitchNumber}
                      </span>
                      {r.pitchType && (
                        <span className="text-blue">{r.pitchType}</span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] leading-snug text-text/90">
                      {r.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
                      {r.batter && <span>B: {r.batter}</span>}
                      {r.pitcher && <span>P: {r.pitcher}</span>}
                      {typeof r.plateX === "number" && (
                        <span>
                          loc {r.plateX.toFixed(2)}, {(r.plateZ ?? 0).toFixed(2)} ft
                        </span>
                      )}
                      {typeof r.exitVelocity === "number" && (
                        <span>EV {r.exitVelocity} mph</span>
                      )}
                      {typeof r.launchAngle === "number" && (
                        <span>LA {r.launchAngle}°</span>
                      )}
                    </div>
                    {r.pitchId && (
                      <a
                        href={`${SAVANT}${r.pitchId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block font-mono text-[10px] text-blue hover:underline"
                      >
                        Verify on Baseball Savant ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted/80">
                Data via Statcast / Baseball Savant and the MLB Stats API. Pitch
                IDs are retained for video verification. Research / exploration
                project — no invented values.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
