const STEPS = [
  {
    n: "01",
    title: "Ingest",
    color: "text-blue",
    body: "MatchRoom reads play-by-play and per-pitch Statcast data from a real MLB game package.",
  },
  {
    n: "02",
    title: "Scout",
    color: "text-blue",
    body: "A scout agent turns structured pitch and batted-ball patterns into tactical hypotheses.",
  },
  {
    n: "03",
    title: "Skeptic",
    color: "text-gold",
    body: "A skeptic agent challenges weak claims, downgrades overreach, and demands evidence.",
  },
  {
    n: "04",
    title: "Brief",
    color: "text-green",
    body: "Only verified, evidence-backed insights reach the final coach card.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          From Statcast data to verified tactical action
        </h2>
        <p className="mt-3 text-muted">
          Not a dashboard with a chatbot bolted on — a coaching staff inside
          software, where every claim has to survive a skeptic.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1"
          >
            <div className={`font-mono text-sm ${s.color}`}>{s.n}</div>
            <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
