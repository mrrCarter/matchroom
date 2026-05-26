const ITEMS = [
  "Statcast / Baseball Savant",
  "MLB Stats API",
  "OpenAI",
  "Anthropic",
  "Gemini",
  "Grok / xAI",
  "Next.js",
  "Vercel",
  "Senti",
  "PlexAura",
];

export function BrandCarousel() {
  return (
    <section className="border-y border-border bg-surface/30 py-10">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-muted">
          Grounded in the modern baseball + AI stack — not customer logos
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {ITEMS.map((item) => (
            <span
              key={item}
              className="text-sm font-medium text-muted/80 transition-colors hover:text-text"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
