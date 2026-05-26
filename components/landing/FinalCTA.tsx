import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-glow">
        <div className="pitch-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Stop reading the dashboard.{" "}
            <span className="text-gradient">Get the verified brief.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Watch a real MLB game turn into a coach-ready plan — scout, skeptic,
            and evidence, in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/demo?run=1"
              className="animate-pulse-cta rounded-xl bg-green px-6 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Open Interactive Demo
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-blue/40 hover:text-blue"
            >
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
