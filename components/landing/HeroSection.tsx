import Link from "next/link";
import { HeroPitchDemo } from "./HeroPitchDemo";

export function HeroSection() {
  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="pitch-grid absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        {/* Left: copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-mono text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Verified AI coaching room · MLB
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            See the next pitch{" "}
            <span className="text-gradient">before they throw it.</span>
          </h1>

          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-muted">
            MatchRoom turns real Statcast data into a verified coaching brief —
            scout, skeptic, and coach-ready output in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/demo?run=1"
              className="animate-pulse-cta rounded-xl bg-green px-6 py-3 text-sm font-semibold text-bg transition-transform hover:scale-[1.03]"
            >
              Watch the Brief Build
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-text transition-colors hover:border-blue/40 hover:text-blue"
            >
              Open Interactive Demo
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted">
            <span className="text-green">●</span> Built on real MLB Statcast
            data. No invented numbers.
          </p>
        </div>

        {/* Right: live build hero */}
        <div className="relative">
          <HeroPitchDemo />
        </div>
      </div>
    </section>
  );
}
