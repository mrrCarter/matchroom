import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <span className="text-[15px] font-semibold tracking-tight">
              Match<span className="text-green">Room</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The verified AI coaching room. Real data in, an evidence-gated
              tactical brief out.
            </p>
          </div>

          <nav className="flex gap-12 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted/70">
                Product
              </span>
              <Link href="/demo" className="text-muted hover:text-text">
                Interactive Demo
              </Link>
              <Link href="#how-it-works" className="text-muted hover:text-text">
                How it works
              </Link>
              <Link href="#ask-ai" className="text-muted hover:text-text">
                Ask an AI
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs leading-relaxed text-muted/80">
          <p>
            Data via Statcast / Baseball Savant and the MLB Stats API. This demo
            is a research / exploration project built for a sports-tech
            hackathon. MatchRoom is not affiliated with or endorsed by MLB,
            MLBAM, or StatsBomb.
          </p>
          <p className="mt-3 text-muted/60">
            © {new Date().getFullYear()} PlexAura. All numbers shown are derived
            from real data — no invented statistics.
          </p>
        </div>
      </div>
    </footer>
  );
}
