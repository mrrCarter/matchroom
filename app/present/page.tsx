import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getUpcomingRedSoxGame } from "@/lib/data/mlb";
import type { UpcomingGame } from "@/lib/types/matchroom";

export const dynamic = "force-dynamic";

const SCRIPT_SEGMENTS = [
  {
    time: "0-10s",
    label: "Problem",
    copy:
      "Sports teams have more data than ever, but the hard part is knowing which claims are real, timely, and safe to act on.",
  },
  {
    time: "10-25s",
    label: "Product",
    copy:
      "MatchRoom is a verified AI coaching room. A Scout proposes insights, a Skeptic attacks weak claims, and only evidence-backed recommendations reach the final coach brief.",
  },
  {
    time: "25-45s",
    label: "Demo",
    copy:
      "The app pulls a live MLB upcoming game, builds a matchup-specific brief, and links each tactical claim back to proof so the coach can inspect the evidence.",
  },
  {
    time: "45-60s",
    label: "Scale",
    copy:
      "Baseball is the wedge, but the engine is sports-agnostic: any team or decision room can use the same verified-agent pattern to move fast without inventing numbers.",
  },
];

function formatGameTime(value?: string): string {
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

function recordLabel(team: UpcomingGame["home"]): string {
  return team.record
    ? `${team.record.wins}-${team.record.losses} (${team.record.pct})`
    : "Record TBD";
}

async function loadUpcomingGame(): Promise<UpcomingGame | null> {
  try {
    return await getUpcomingRedSoxGame();
  } catch {
    return null;
  }
}

export default async function PresentPage() {
  const game = await loadUpcomingGame();
  const demoHref = game
    ? `/demo?run=1&gamePk=${game.gamePk}&question=${encodeURIComponent(
        game.coachQuestion,
      )}`
    : "/demo?run=1";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-green/15 px-3 py-1 font-mono text-xs uppercase tracking-wide text-green ring-1 ring-green/30">
              60-second presentation mode
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              MatchRoom turns raw sports data into coach-ready decisions with
              receipts.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              Use this page as the talk track: problem, product, live baseball
              wedge, and why the same verified-agent system scales beyond one
              sport.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={demoHref}
                className="rounded-xl bg-green px-5 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
              >
                Run the live demo
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
              >
                Back to landing
              </Link>
            </div>
          </div>

          <aside className="glass rounded-2xl p-5">
            <div className="font-mono text-[10px] uppercase tracking-wide text-blue">
              Live matchup anchor
            </div>
            {game ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">
                  {game.matchupLabel}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {game.status} - {game.venue} - {formatGameTime(game.gameDateUtc)}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[game.away, game.home].map((team) => (
                    <div
                      key={`${team.id}-${team.name}`}
                      className="rounded-xl border border-border bg-surface-2/50 p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                        {team.abbreviation ?? team.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{team.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {recordLabel(team)}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-text/85">
                        Probable: {team.probablePitcher?.fullName ?? "TBD"}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  Uses gamePk {game.gamePk}; completed pitch evidence falls back
                  to gamePk {game.evidenceFallback.gamePk} with{" "}
                  {game.evidenceFallback.trackedPitches} tracked pitches until
                  this upcoming game has final pitch data.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                MLB Stats API is temporarily unavailable. The demo still runs
                from the verified seeded brief.
              </p>
            )}
          </aside>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {SCRIPT_SEGMENTS.map((segment) => (
            <article key={segment.time} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">{segment.label}</h2>
                <span className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-muted ring-1 ring-border">
                  {segment.time}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-text/85">
                {segment.copy}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            "Open with data overload, not AI novelty.",
            "Click Run the live demo and let the agent rail animate.",
            "Call out the Skeptic before the final brief appears.",
            "End on verified decisions with evidence links.",
          ].map((step, index) => (
            <div key={step} className="rounded-2xl border border-border p-4">
              <div className="font-mono text-xs text-green">
                0{index + 1}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{step}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
