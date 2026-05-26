# MatchRoom

**The verified multi-agent decision room for high-stakes teams.**

MatchRoom turns raw event data into a *coach-ready, evidence-gated brief* — not by
asking one model to "analyze the game," but by running a small staff of
adversarial agents that **propose, challenge, and verify** every claim before it
reaches a decision-maker.

> Most tools help analysts **inspect** data. MatchRoom helps decision-makers
> **act** on insight they can trust — because every recommendation carries the
> evidence that survived a skeptic.

The current hackathon wedge is **MLB advance scouting** (a Red Sox vs Braves demo
for Boston judges). The larger system is **sports-agnostic**: the same
verification layer sits on top of baseball pitch data, football event data,
basketball possessions, hockey shifts, or any team workflow where weak claims are
dangerous.

---

## Why this exists

Modern teams are not short on data. A baseball front office has every pitch since
2008. A football club has event + tracking data for every match. The bottleneck
moved: it is no longer *access to information*, it is **trusted decision-making at
speed**.

Two failure modes dominate today:

1. **Dashboards** show you everything and decide nothing. The human still has to
   find the signal and trust their own read under time pressure.
2. **Chatbots** will confidently tell you anything — including hallucinated
   numbers, overfit patterns, and small-sample noise dressed up as a trend.

MatchRoom is built around one thesis:

> **Verification is the product.** An insight is only useful if you can trust it,
> and you can only trust it if something tried to break it first.

---

## How it works

```
  Real event data
        │
        ▼
  ┌────────────────────┐   Deterministic, no-LLM truths computed first:
  │ Feature extraction  │   pitch sequences, chase/whiff rates, zone heatmaps,
  │ (deterministic)     │   spray charts, platoon splits, leverage moments…
  └────────────────────┘
        │  structured summaries + selected EvidenceRefs
        ▼
  ┌────────────────────┐   Proposes specific, useful tactical hypotheses.
  │   Scout agent       │   Must cite ≥1 evidence reference per claim.
  └────────────────────┘   Never invents IDs, counts, or values.
        │  candidate claims
        ▼
  ┌────────────────────┐   Adversarial reviewer. Attacks small samples, hot
  │   Skeptic agent     │   streaks, claims that die under splits or game state.
  └────────────────────┘   Accepts / revises / rejects + adjusts confidence.
        │  accepted + revised claims only
        ▼
  ┌────────────────────┐   Deterministic code, not an LLM:
  │  Evidence filter    │   "No EvidenceRef → does not reach the brief."
  └────────────────────┘
        │  verified claims
        ▼
  ┌────────────────────┐   Compact, plain-language brief for a decision-maker,
  │   Brief agent       │   ending in concrete actions. No fluff. No fabrication.
  └────────────────────┘
        │
        ▼
   Coach-ready verified brief  ──►  every point links back to its evidence
```

### The four roles

| Role | Job | Hard rule |
|---|---|---|
| **Scout** | Turn structured patterns into tactical hypotheses | Every claim cites ≥1 `EvidenceRef`; thin evidence → `low` confidence |
| **Skeptic** | Challenge weak claims adversarially | Reject the unsupported, *narrow* the overclaimed, keep the survivors |
| **Evidence filter** | Gate the output (deterministic) | A claim with no evidence never reaches the brief |
| **Brief** | Summarize for the decision-maker | Only accepted/revised claims; plain language; ends in concrete actions |

The Skeptic is the moat. Anyone can wire a model to a dataset. The defensible part
is the **evidence-gated verification layer** that makes the output trustworthy
enough to act on.

---

## Current demo wedge

**Sport:** MLB baseball.

**Canonical game (coach question framing):**

- Atlanta Braves at Boston Red Sox — Fenway Park — May 26, 2026 — `gamePk=824758`

**Seed evidence game (pitch-level evidence):**

- Boston Red Sox at Atlanta Braves — May 17, 2026 — `gamePk=824923` — Final: Braves 8, Red Sox 1

The May 26 game is *scheduled* in the MLB Stats API at seed time, so the demo
intentionally pulls pitch-level evidence from a recent **completed** Red Sox–Braves
matchup. This keeps every cited pitch real and verifiable while still framing the
coach question around the Fenway game. Honesty over theater.

---

## Architecture

```text
app/
  layout.tsx, globals.css         design system, dark premium theme
  page.tsx                        landing page
  demo/page.tsx                   interactive three-panel demo
  api/
    demo-brief/route.ts           GET seeded brief (always works) · POST live mode
    ask-ai-links/route.ts         "Ask an AI" prompt + model links
components/
  layout/                         header, footer (+ attribution)
  landing/                        hero, animated build demo, how-it-works, ask-AI, CTA
  demo/                           context, replay, agent rail, brief panel, evidence drawer
lib/
  types/matchroom.ts              sports-agnostic brief contracts
  data/loaders.ts, data/seeded.ts source adapters + typed seeded loaders + fallbacks
  analytics/                      deterministic extractors (the "facts" layer)
  agents/                         scout · skeptic · brief · evidenceFilter
  utils/                          cn(), formatting
public/data/
  matchroom-game-metadata.json    Red Sox vs Braves metadata
  matchroom-pitch-sequence.json   selected at-bat pitch trail for the hero
  matchroom-statcast-summary.json computed batter splits / pitcher tendencies
  matchroom-demo-brief.json       full verified brief, seeded
scripts/
  senti_poller.py                 Sentinelayer listener wrapper
  start_senti_poller.ps1          Windows background launcher
```

### Seeded vs live mode

Seeded mode is the default and the safety net. The seeded JSON committed to the
repo is **the cached output of the real pipeline run on real data** — not
hand-written numbers. Live mode (optional) re-runs the agents against the data on
demand, and silently falls back to seeded if a key is missing or a model call
fails. Reliable under pressure *and* honest.

### Data contract (sport-agnostic shape)

The top-level response shape is stable across domains; only the evidence and
metadata semantics shift per adapter. The core type is `VerifiedBriefResponse` in
`lib/types/matchroom.ts`.

```ts
interface VerifiedBriefResponse {
  mode: "seeded" | "live";
  generatedAt: string;
  game: { league: string; season: number; gamePk: number; date: string;
          homeTeam: string; awayTeam: string; dataSource: string; /* … */ };
  coachQuestion: string;
  executiveSummary: string;
  attackingPlan: TacticalInsight[];
  defensiveAlignment: TacticalInsight[];
  pitchingPlan: TacticalInsight[];     // baseball adapter
  riskFlags: TacticalInsight[];
  coachActions: string[];
  evidenceNotes: string[];
}

interface TacticalInsight {
  id: string; title: string; claim: string;
  confidence: "low" | "medium" | "high";
  status: "accepted" | "revised" | "rejected";
  evidence: EvidenceRef[];             // ← the gate: empty ⇒ filtered out
  skepticNote?: string;
  whyItMatters: string;
  recommendedAction: string;
}
```

Every tactical claim that reaches the coach must carry `EvidenceRef[]`. In
baseball an evidence reference points to a pitch or batted-ball event; in other
sports the same concept maps to possessions, shots, shifts, clips, or event IDs.
Seeded files are derived from the MLB Stats API schedule + play-by-play endpoints
and the Baseball Savant video URL pattern (`playId`).

---

## API

### `GET /api/demo-brief`

Returns the seeded verified brief. Must always work without auth, model keys, or a
database.

### `POST /api/demo-brief`

```json
{ "coachQuestion": "How do we attack the Braves lineup tomorrow?", "mode": "live" }
```

Live mode falls back to the seeded response when no model key is configured. The
fallback is intentional for hackathon reliability.

---

## Trust model (the non-negotiables)

These hold in every mode, every domain, every demo:

- **No invented data.** No fabricated stats, IDs, or values — ever.
- **No claim without evidence.** If it has no `EvidenceRef`, it does not ship.
- **No fake customers or "trusted by" claims.** The brand strip is the *stack*,
  not a logo wall.
- **Honest sourcing.** Every brief shows its data source and attribution.
- **Graceful degradation.** Seeded mode works with **no API key** — the demo
  never dies because a model call failed or an env var is missing.
- **Verifiable claims only.** "In this sample, X is Y% over N events" — never
  "X always does Y."

---

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS** — dark, premium design system
- **Framer Motion** — animated "live build" hero and replay
- **Vercel AI SDK** — provider-agnostic model orchestration (OpenAI / Anthropic / Gemini / xAI)
- **Senti** — multi-agent build coordination (file locks, review gates)
- Data: **Statcast / Baseball Savant + MLB Stats API** (baseball wedge); **StatsBomb Open Data** (football adapter)

No database, no auth wall, and no live-only dependency are required to run the core experience.

---

## Domain adapters

A domain adapter supplies three things; the verification engine is otherwise untouched:

1. **Data source + loaders** — how to fetch/seed real events (Statcast CSV + MLB
   Stats API, or StatsBomb JSON).
2. **Deterministic extractors** — the domain's "facts" layer (chase rate, zone
   heatmap, spray chart for baseball; progressions, channel usage, box entries for
   football).
3. **Vocabulary** — the language the agents speak (pitch sequencing & defensive
   shifts vs. pressing & progression lanes) and the evidence-reference shape.

Swap the adapter, keep the verification engine. That separation is what makes
MatchRoom a platform rather than a single sports app.

---

## Roadmap

| Horizon | What it is |
|---|---|
| **Now (wedge)** | Verified tactical brief from one real MLB game, demoed live; premium landing + demo; seeded fallback with no API key |
| **60 days** | Multi-game advance-scouting room; team-specific data adapters; claim history, review states, exportable coach packets |
| **Platform** | Trusted multi-agent decision infrastructure for high-stakes teams — domain adapters for sports, operations, security, executive planning; evidence-gated agent outputs as a reusable trust layer |

Baseball advance scouting is the wedge. **Verified agentic decision-making is the
platform.**

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000  (seeded mode, no keys needed)
```

Optional live mode:

```bash
cp .env.example .env.local   # add a model key if you want live inference
```

Quality gates (run before every PR):

```bash
npm run typecheck    # tsc --noEmit — no type errors
npm run lint         # no critical lint errors
npm run build        # production build must pass
```

Local API check: `http://localhost:3000/api/demo-brief`

---

## Coordination

Development is coordinated through **Sentinelayer / Senti**. Agents claim files
before editing and release locks when work is complete. Start the listener with:

```powershell
.\scripts\start_senti_poller.ps1
```

---

## Attribution & scope

This is a **research / exploration project**. Baseball data via **Statcast /
Baseball Savant** and the **MLB Stats API**; football data via **StatsBomb Open
Data**. Attribution is shown on the demo, in the evidence drawer, and in the
footer.

> Data via Statcast / Baseball Savant and the MLB Stats API. This demo is a
> research / exploration project built for a sports-tech hackathon.

MatchRoom is not affiliated with or endorsed by MLB, MLBAM, or StatsBomb.

---

*MatchRoom is a PlexAura project.*
