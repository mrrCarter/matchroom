# MatchRoom — Master Spec, Landing Page Blueprint, and Build Scaffold v1.1

Owner: Carter Theogene / PlexAura  
Build mode: hackathon MVP that still feels like a real product  
Primary team: Carter + Claude + Codex + Cursor teammates, coordinated through Senti  
Primary deliverable: a live landing page + working demo that turns real football data into a verified coach-ready tactical brief

---

## 0. What changed from the previous sprint spec

This v1.1 file reframes the build from “analytics platform” to **verified AI coaching room**.

The previous spec had the right core idea: MatchRoom is an AI coaching room where Scout, Skeptic, Counter-Plan, and Evidence agents turn opponent data into a coach-ready tactical brief.

This version tightens the build around:

1. **Real data only** — StatsBomb Open Data, locally cached.
2. **A better hero demo** — a moving ball on a pitch shows the actual product flow.
3. **Seeded reliability** — the demo works even if model calls fail.
4. **No fake customers** — brand carousel is stack/ecosystem, not fake logos.
5. **SWE excellence** — strict TypeScript, clear file ownership, fallback paths, no over-engineering.
6. **Hackathon realism** — designed for 2–3 hours, one Cursor credit, Claude/Codex/Senti-heavy execution.

---

## 1. One-line pitch

**MatchRoom is the verified AI coaching room for football teams: scout agents, skeptic agents, and evidence agents turn real match data into a coach-ready tactical brief in minutes.**

Alternative landing-page one-liner:

**See your next opponent before they see you.**

---

## 2. Product thesis

Modern football clubs already have data. The bottleneck is no longer access to information. The bottleneck is trusted tactical decision-making.

Most tools help analysts inspect data. MatchRoom helps coaches act on verified tactical insight.

MatchRoom’s wedge:

- real football event + 360 data
- deterministic pattern extraction
- scout-agent tactical hypotheses
- skeptic-agent challenge layer
- evidence-gated final brief
- coach-ready output

The hackathon build should not look like “a dashboard with a chatbot.” It should look like **a coaching staff inside software**.

---

## 3. Hackathon win condition

A judge should understand in 30 seconds:

1. what MatchRoom does,
2. why it is not just analytics,
3. why the skeptic/verifier matters,
4. that the demo uses real football data,
5. that PlexAura can expand this into agentic decision infrastructure.

The winning demo flow:

> Coach asks a question → ball/pitch replay animates → Scout finds patterns → Skeptic challenges weak claims → final brief appears with evidence.

---

## 4. Non-negotiables

- No placeholder data.
- No fake customers.
- No fake logos.
- No fake “used by” claims.
- No made-up tactical metrics.
- No fragile live-only AI dependency.
- No auth wall blocking the demo during judging.
- No complex database setup required for the core demo.
- No real video processing in the sprint.
- No real cryptographic signing in the sprint.

Anything simulated visually must be labeled honestly and must represent the real flow.

---

## 5. Recommended real data source

Use **StatsBomb Open Data**.

The repo structure supports:

- `competitions.json`
- `matches`
- `events`
- `lineups`
- `three-sixty`

StatsBomb attribution must be visible on `/demo`, in the evidence drawer, and in the footer or credits section.

Required attribution copy:

> Data provided by StatsBomb Open Data. This demo is a research/exploration project built for a sports-tech hackathon.

---

## 6. Recommended canonical match

Use this match for the MVP:

**UEFA Euro 2020 — Italy vs Spain — Semi-finals**

Known metadata to seed:

```json
{
  "competition": "UEFA Euro",
  "season": "2020",
  "match_id": 3795220,
  "date": "2021-07-06",
  "home_team": "Italy",
  "away_team": "Spain",
  "stage": "Semi-finals",
  "score": "1-1",
  "stadium": "Wembley Stadium",
  "data_source": "StatsBomb Open Data"
}
```

Why this match:

- Recognizable teams.
- Tactical match-up.
- StatsBomb Open Data has 360 availability for UEFA Euro 2020.
- Clean story: “How do we prepare against Spain’s possession and progression patterns?”
- Strong enough for a cinematic demo without inventing anything.

Fallback matches:

- UEFA Euro 2020 — Sweden vs Slovakia — match_id 3788761.
- UEFA Euro 2024 match only if confirmed and cached before sprint.
- Do not use Real Madrid vs Manchester City unless the exact match is confirmed in the local StatsBomb cache first.

---

## 7. Landing page requirements

Route: `/`

The landing page must be premium, dark, AI-native, and football-specific.

### Sections

1. Header
2. Hero with animated pitch demo
3. Stack/ecosystem carousel
4. Product flow: Scout → Skeptic → Verified Brief
5. Demo preview
6. “Don’t take it from us. Ask an AI.”
7. SWE / trust strip
8. Final CTA
9. Footer with StatsBomb attribution

---

## 8. Landing page visual system

### Style

- dark-mode first
- glass panels
- tactical pitch overlays
- subtle neon accents
- clean typography
- no clutter
- no generic SaaS stock imagery

### Color tokens

```css
--bg: #060816;
--surface: #0D1324;
--surface-2: #121A31;
--border: rgba(255,255,255,0.08);
--text: #F5F7FB;
--muted: #A9B2C7;
--green: #5BF2A5;
--blue: #66B3FF;
--gold: #FFC857;
--danger: #FF6B6B;
```

### Typography

- Heading: Geist, Inter Tight, or Sora
- Body: Inter or Geist Sans
- Data labels: JetBrains Mono or Geist Mono

---

## 9. Hero section copy

### Headline

**See your next opponent before they see you.**

### Subheadline

**MatchRoom turns real match data into a verified tactical brief — scout agent, skeptic agent, and coach-ready output in minutes.**

### Primary CTA

**Watch the Brief Build**

### Secondary CTA

**Open Interactive Demo**

### Trust microcopy

**Built on real StatsBomb Open Data. No placeholder analysis.**

---

## 10. Hero demo: “The Live Build Hero”

This is the most important visual feature.

The hero should not be a static screenshot. It should show the actual MatchRoom flow through a stylized pitch animation.

### Core idea

A football moves through a real or seeded event sequence on a pitch. As it moves, the product pipeline activates:

1. `Data Ingest`
2. `Scout Agent`
3. `Skeptic Agent`
4. `Verifier`
5. `Coach Brief Ready`

The ball is both:
- the football in the match,
- and the metaphor for an insight moving through the verification pipeline.

### Hero layout

Left side:
- headline
- subheadline
- CTAs
- trust microcopy

Right side:
- animated pitch
- moving ball
- event trail
- agent rail
- insight cards

### Hero animation phases

#### Phase 1 — Load match

UI copy:

```text
UEFA Euro 2020 · Italy vs Spain · Semi-finals
Loading events
Loading 360 context
Building possession chains
```

Visual:
- dark pitch fades in
- player dots appear
- agent rail status starts at “Data Ingest”

#### Phase 2 — Ball movement

Visual:
- ball moves across pitch using coordinates from seeded replay JSON
- pass/carry line animates behind it
- relevant channel or zone glows softly

Data rule:
- coordinates must come from the actual event file or a preprocessed derived replay file.
- no arbitrary random motion.

#### Phase 3 — Scout card appears

Copy format:

```text
Scout hypothesis
Pattern candidate detected from final-third entries.
```

Use computed values from the dataset if available:

```text
Scout hypothesis
Spain’s progression is clustering through [computed_channel].
```

Do not hardcode a tactical claim unless the preprocessing script supports it.

#### Phase 4 — Skeptic card appears

Copy format:

```text
Skeptic check
Claim narrowed: evidence must cite multiple event references or confidence is downgraded.
```

This is important because it shows trust.

#### Phase 5 — Verified brief appears

Copy format:

```text
Verified coach note
Protect the channel where progression repeats, then force play toward lower-value zones.
```

If the deterministic extractor identifies the channel, fill it in:

```text
Verified coach note
Protect the {dominantProgressionChannel}; force circulation away from the highest-frequency entry lane.
```

#### Phase 6 — CTA animates

Primary CTA receives subtle pulse:

```text
Open Interactive Demo
```

### Hero technical implementation

Use SVG first.

Recommended component:

```text
components/landing/HeroPitchDemo.tsx
```

Use Framer Motion for:
- ball movement
- line drawing
- cards fading in
- pipeline status changes

Avoid Canvas unless SVG performance fails.

---

## 11. Brand / stack carousel

Section title:

**Grounded in the modern football + AI stack**

Caption:

**Data, models, and infrastructure that power the MVP concept — not customer logos.**

Carousel items:

- StatsBomb Open Data
- UEFA Euro
- OpenAI
- Anthropic
- Gemini
- Grok / xAI
- Next.js
- Vercel
- Senti
- PlexAura

Rules:

- Do not say “trusted by.”
- Do not imply any of these are customers.
- Use text logos if brand assets are not available.
- Keep it tasteful and small.

---

## 12. Product flow section

Title:

**From match data to verified tactical action**

Three or four cards:

### 1. Ingest

```text
MatchRoom reads event data, lineups, and 360 context from a real match package.
```

### 2. Scout

```text
A scout agent turns structured match patterns into tactical hypotheses.
```

### 3. Skeptic

```text
A skeptic agent challenges weak claims, downgrades overreach, and demands evidence.
```

### 4. Brief

```text
Only verified insights reach the final coach card.
```

---

## 13. “Don’t take it from us. Ask an AI.”

This section should be memorable and confident.

Title:

**Don’t take it from us. Ask an AI.**

Subtitle:

**We give you the prompt. You pick the model.**

Cards:

1. ChatGPT
2. Claude
3. Gemini
4. Grok

Each card:

- model name
- `Copy Prompt`
- `Open Model`

Because prefilled deep links can be unreliable, implement copy-to-clipboard first. Then open the model home page.

### Prompt to copy

```text
What is MatchRoom by PlexAura?

Evaluate this product concept as a technical product analyst:

MatchRoom ingests real football event and 360 data, generates opposition-analysis hypotheses, uses a scout agent plus a skeptic/verifier agent, and produces a coach-ready tactical brief.

Explain:
1. What problem it solves
2. How it differs from a static analytics dashboard
3. How it differs from a plain sports chatbot
4. Why the skeptic/verifier layer matters
5. Why a coach, analyst, or sporting director would care
6. What technical risks the team should solve next
```

### Model URLs

```ts
export const AI_MODEL_LINKS = {
  chatgpt: "https://chatgpt.com",
  claude: "https://claude.ai",
  gemini: "https://gemini.google.com",
  grok: "https://grok.com"
};
```

Toast after copy:

```text
Prompt copied. Paste it into {model}.
```

---

## 14. Demo page spec

Route: `/demo`

Purpose:

The landing page sells. The demo proves.

### Demo page layout

Desktop-first, three panels:

#### Left panel — Coach question

- match metadata
- team perspective selector
- coach question input
- run button

Default question:

```text
How should we prepare to disrupt Spain’s progression and create higher-value counters?
```

#### Center panel — Pitch replay

- pitch SVG
- ball movement
- sequence list
- evidence highlights
- replay button

#### Right panel — Agent rail + brief

- Scout output
- Skeptic challenge
- Verified final brief
- coach actions

Bottom drawer:

- event references
- confidence
- StatsBomb attribution
- demo credentialing badge

---

## 15. `/demo` interaction flow

1. Page loads with Italy vs Spain metadata.
2. User clicks `Run MatchRoom`.
3. Timeline animates:
   - Data Ingest
   - Scout
   - Skeptic
   - Verified Brief
4. Pitch replay runs in center panel.
5. Final coach card appears.
6. User clicks `Show Evidence`.
7. Drawer opens with event IDs and match references.
8. User clicks `Replay`.
9. Ball replay runs again.

Required behavior:

- The demo must work with no model API key.
- If live inference fails, use seeded JSON and show `Seeded demo mode`.
- Never crash because of missing environment variables.

---

## 16. Seeded vs live mode

Use seeded mode by default.

Live mode can be a stretch.

### Why seeded-first

- reliable under hackathon pressure
- faster to render
- no latency issue
- no API rate-limit risk
- no awkward dead demo
- still honest if based on real data

### Required mode banner

```text
Seeded demo mode · Built from real StatsBomb Open Data
```

If live mode works:

```text
Live agent mode · Claims are still evidence-gated
```

---

## 17. Tactical brief schema

```ts
export type Confidence = "low" | "medium" | "high";

export interface EvidenceRef {
  eventId: string;
  matchId: number;
  minute: number;
  second?: number;
  team?: string;
  player?: string;
  eventType?: string;
  description: string;
  x?: number;
  y?: number;
}

export interface TacticalInsight {
  id: string;
  title: string;
  claim: string;
  confidence: Confidence;
  status: "accepted" | "revised" | "rejected";
  evidence: EvidenceRef[];
  skepticNote?: string;
  whyItMatters: string;
  recommendedAction: string;
}

export interface VerifiedBriefResponse {
  mode: "seeded" | "live";
  generatedAt: string;
  match: {
    competition: string;
    season: string;
    matchId: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    score: string;
    stage: string;
    stadium?: string;
    dataSource: string;
  };
  coachQuestion: string;
  executiveSummary: string;
  attackingPatterns: TacticalInsight[];
  defensiveTendencies: TacticalInsight[];
  transitionNotes: TacticalInsight[];
  riskFlags: TacticalInsight[];
  coachActions: string[];
  evidenceNotes: string[];
}
```

---

## 18. Hero replay schema

```ts
export interface ReplayPoint {
  id: string;
  eventId?: string;
  t: number;
  x: number;
  y: number;
  label?: string;
  type: "pass" | "carry" | "shot" | "pressure" | "recovery" | "start" | "end";
}

export interface HeroReplay {
  matchId: number;
  label: string;
  points: ReplayPoint[];
  dominantChannel?: "left" | "center" | "right";
  computedFrom: "statsbomb_events";
}
```

---

## 19. Agent topology

Do not overbuild.

MVP agents:

### Scout Agent

Inputs:
- match metadata
- deterministic summaries
- selected event sequences
- replay evidence refs

Outputs:
- candidate tactical insights

Rules:
- no invented metrics
- cite evidence refs
- prefer useful football language

### Skeptic Agent

Inputs:
- Scout claims
- deterministic summaries
- evidence refs

Outputs:
- accepted, revised, or rejected claims
- critique notes

Rules:
- challenge sample-size overreach
- downgrade vague claims
- preserve useful but narrower claims

### Brief Agent / Reconciler

Inputs:
- accepted + revised claims
- coach question
- evidence refs

Outputs:
- coach-ready brief

Rules:
- practical language
- no fluff
- every claim ties to evidence

### Evidence filter

This can be deterministic code, not an LLM.

Rule:

```text
If a claim has no EvidenceRef, it does not reach the coach card.
```

---

## 20. Agent prompts

### Scout prompt

```text
You are MatchRoom Scout, an opposition-analysis assistant for football.

You receive structured match metadata, deterministic summaries, and selected evidence references from a real StatsBomb match.

Generate tactical observations that are specific, useful, and grounded.

Rules:
- Do not invent facts.
- Do not invent event IDs.
- Do not claim exact counts unless provided.
- Prefer coach-relevant language.
- Every observation must cite at least one evidence reference.
- If the evidence is thin, mark confidence as low.

Return structured JSON only.
```

### Skeptic prompt

```text
You are MatchRoom Skeptic, an adversarial reviewer.

Your job is to challenge the Scout’s claims.

Reject claims that are vague, unsupported, or overgeneralized.
Revise claims that can be made more precise.
Accept claims only when they are supported by evidence references.

For each claim, output:
- accepted, revised, or rejected
- skeptic note
- confidence adjustment
- revised claim if needed

Return structured JSON only.
```

### Brief prompt

```text
You are MatchRoom Brief, the final coach-facing summarizer.

Use only accepted or revised claims.
Write a compact tactical brief for a coach.

Rules:
- No fluff.
- No invented facts.
- Use plain football language.
- Every key point must include evidence summary.
- End with 3 practical coach actions.

Return structured JSON only.
```

---

## 21. Deterministic data extraction

Before agents run, compute simple truths from the match data.

Implement lightweight functions:

```ts
extractPasses(events)
extractCarries(events)
extractShots(events)
extractFinalThirdEntries(events)
extractBoxEntries(events)
extractProgressiveActions(events)
extractChannelUsage(events)
extractShotCreatingSequences(events)
buildPossessionChains(events)
buildHeroReplay(events)
```

### Channel logic

StatsBomb pitch:
- x range: 0–120
- y range: 0–80

Approximate channels:
- left: y < 26.67
- center: y >= 26.67 && y <= 53.33
- right: y > 53.33

Use team attack direction carefully. If you do not normalize direction in time, label channels as pitch channels, not attacking left/right.

### Avoid overclaiming

Acceptable:

```text
In the selected match sample, final-third entries cluster through the computed channel.
```

Not acceptable unless proven:

```text
Spain always attacks through the left.
```

---

## 22. Required files and scaffold

```text
matchroom/
├─ app/
│  ├─ layout.tsx
│  ├─ globals.css
│  ├─ page.tsx
│  ├─ demo/
│  │  └─ page.tsx
│  └─ api/
│     ├─ demo-brief/
│     │  └─ route.ts
│     └─ ask-ai-links/
│        └─ route.ts
├─ components/
│  ├─ layout/
│  │  ├─ SiteHeader.tsx
│  │  └─ SiteFooter.tsx
│  ├─ landing/
│  │  ├─ HeroSection.tsx
│  │  ├─ HeroPitchDemo.tsx
│  │  ├─ BrandCarousel.tsx
│  │  ├─ HowItWorks.tsx
│  │  ├─ AskAISection.tsx
│  │  ├─ BriefPreview.tsx
│  │  └─ FinalCTA.tsx
│  ├─ demo/
│  │  ├─ MatchContextPanel.tsx
│  │  ├─ CoachQuestionPanel.tsx
│  │  ├─ PitchReplay.tsx
│  │  ├─ AgentRail.tsx
│  │  ├─ VerifiedBriefPanel.tsx
│  │  └─ EvidenceDrawer.tsx
│  └─ ui/
├─ lib/
│  ├─ types/
│  │  ├─ matchroom.ts
│  │  └─ statsbomb.ts
│  ├─ data/
│  │  ├─ loaders.ts
│  │  ├─ seeded.ts
│  │  └─ statsbomb.ts
│  ├─ analytics/
│  │  ├─ possessions.ts
│  │  ├─ progressions.ts
│  │  ├─ channels.ts
│  │  ├─ shots.ts
│  │  └─ summary.ts
│  ├─ agents/
│  │  ├─ scout.ts
│  │  ├─ skeptic.ts
│  │  ├─ brief.ts
│  │  └─ evidenceFilter.ts
│  ├─ demo/
│  │  ├─ heroTimeline.ts
│  │  ├─ replayBuilder.ts
│  │  └─ askAi.ts
│  └─ utils/
│     ├─ cn.ts
│     └─ format.ts
├─ public/
│  ├─ data/
│  │  ├─ matchroom-demo-brief.json
│  │  ├─ matchroom-hero-replay.json
│  │  └─ matchroom-match-metadata.json
│  └─ logos/
├─ scripts/
│  ├─ build-seeded-demo.ts
│  ├─ parse-statsbomb.ts
│  └─ generate-canonical-brief.ts
├─ tests/
│  ├─ analytics/
│  └─ smoke/
├─ .env.example
├─ README.md
├─ package.json
└─ tsconfig.json
```

---

## 23. API routes

### `GET /api/demo-brief`

Returns the seeded verified brief.

Response:

```ts
VerifiedBriefResponse
```

Must always work.

### `POST /api/demo-brief`

Optional live mode.

Body:

```json
{
  "coachQuestion": "How should we prepare against Spain?",
  "mode": "live"
}
```

Behavior:
- if model key missing, return seeded response with `mode: seeded`
- if model fails, return seeded response
- include clear `fallbackReason` in development logs only

---

## 24. Example seeded brief generation rules

The seeded brief must be generated from preprocessed data.

Do not manually invent metrics.

Acceptable seeded generation path:

1. Load StatsBomb events for match_id 3795220.
2. Extract event references.
3. Compute channel usage and final-third entries.
4. Select 3–5 representative evidence events.
5. Generate claims from computed summaries.
6. Run skeptic pass or simulate skeptic pass deterministically.
7. Save final JSON.

The saved JSON is allowed to be committed because it is a cached canonical output of the real pipeline.

---

## 25. Build lanes

Given one Cursor credit and heavy Claude/Codex/Senti usage, use four lanes.

### Lane A — Landing page

Owner: teammate with Cursor or Claude

Files:
- `app/page.tsx`
- `components/landing/*`
- `components/layout/*`

Deliverables:
- full landing page
- hero layout
- brand carousel
- ask-AI section
- final CTA

### Lane B — Hero animation

Owner: teammate or Carter if strongest frontend

Files:
- `components/landing/HeroPitchDemo.tsx`
- `components/demo/PitchReplay.tsx`
- `lib/demo/replayBuilder.ts`

Deliverables:
- animated SVG pitch
- moving ball
- timeline sync
- replay button

### Lane C — Data + seeded brief

Owner: Carter + Codex

Files:
- `scripts/*`
- `lib/analytics/*`
- `public/data/*`
- `lib/data/*`

Deliverables:
- match metadata JSON
- hero replay JSON
- seeded verified brief JSON
- deterministic extraction helpers

### Lane D — Demo page + API + QA

Owner: Claude/Codex/Carter

Files:
- `app/demo/page.tsx`
- `app/api/demo-brief/route.ts`
- `components/demo/*`
- `lib/agents/*`

Deliverables:
- working demo
- agent rail
- final brief panel
- evidence drawer
- seeded fallback

---

## 26. Sprint plan: 2–3 hours

### Pre-sprint

Do before timer starts if possible:

- Create Next.js app.
- Install Tailwind/shadcn/framer-motion.
- Download/cache StatsBomb data.
- Pick canonical match.
- Generate seeded JSON.
- Create Vercel project.
- Confirm all agents can read this file.
- Create `AGENTS.md` and `README.md`.

### Minute 0–20

- Landing skeleton
- `/demo` skeleton
- seeded JSON wired
- hero pitch component placeholder with real replay points loaded

### Minute 20–50

- Ball animation
- agent rail
- brief panel
- API route returns seeded brief
- ask-AI copy buttons

### Minute 50–80

- evidence drawer
- pitch replay polish
- responsive desktop layout
- StatsBomb attribution
- no broken CTAs

### Minute 80–110

- visual polish
- final copy
- QA gates
- deploy

### Minute 110–120

- rehearse pitch twice
- keep local fallback ready

If 3 hours are available, use extra time for:
- PDF export
- second match toggle
- better evidence drawer
- docs route

---

## 27. SWE excellence gates for this sprint

Do these, no matter how fast the sprint is.

### TypeScript

```bash
npx tsc --noEmit
```

No TypeScript errors.

### Lint

```bash
npm run lint
```

No critical lint errors.

### Build

```bash
npm run build
```

Production build must pass.

### Frontend safety

- no state updates inside loops
- no missing cleanup for timers
- no object literals in dependency arrays
- no more than 5 `useState` hooks in a single component unless justified
- no `dangerouslySetInnerHTML`
- no console errors during demo

### Performance

- do not import heavy chart libraries for one SVG pitch
- no giant client bundle if avoidable
- lazy-load below-fold sections if time allows
- hero should not cause layout shift

### Reliability

- `/` loads
- `/demo` loads
- seeded demo works
- API route works without model key
- no dead buttons

### Legal / trust

- StatsBomb attribution visible
- no fake customers
- no fake commercial claims

---

## 28. `AGENTS.md` content

Create this file in the repo root:

```md
# AGENTS.md — MatchRoom

Read this before editing.

## Mission
Build MatchRoom: a premium landing page + working demo that turns real football match data into a verified coach-ready tactical brief.

## Non-negotiables
- No placeholder data.
- No fake customer logos.
- No invented tactical metrics.
- Seeded demo must work without live model calls.
- Use strict TypeScript.
- Keep components small.
- Do not edit outside your assigned lane without asking in Senti.

## Core flow
real StatsBomb data → deterministic extraction → Scout → Skeptic → verified coach brief

## Quality gates
Run:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## File ownership
Coordinate via Senti. Do not have two agents edit the same file at once.
```

---

## 29. README outline

```md
# MatchRoom

MatchRoom is a verified AI coaching room for football teams.

It turns real match event data into a coach-ready tactical brief using:
- deterministic feature extraction
- scout-agent hypothesis generation
- skeptic-agent verification
- evidence-gated coach output

## Demo dataset
UEFA Euro 2020 — Italy vs Spain — Semi-finals
StatsBomb Open Data, match_id 3795220

## Run locally

npm install
npm run dev

## Build

npm run build

## Attribution
Data provided by StatsBomb Open Data.
```

---

## 30. Final pitch script

Use this as the 60-second version:

```text
Every serious football team has more data than its staff can process. The bottleneck is not information anymore — it is trusted tactical decision-making.

MatchRoom is the verified AI coaching room for football. Watch this: we load a real match from StatsBomb Open Data, ask how to prepare against the opponent, and the system turns raw events into a coach-ready brief.

The important part is not just the scout agent. The skeptic agent challenges weak claims and forces evidence. Only verified insights make it into the coach card.

So instead of another dashboard, coaches get an actionable brief: what pattern matters, why it matters, and what to train.

Soccer opposition analysis is the wedge. Verified agentic decision-making is the platform.
```

---

## 31. Final builder instruction

Copy this into Claude/Codex/Cursor/Senti:

```text
Build MatchRoom exactly from this spec.

Prioritize:
1. Beautiful premium landing page
2. Animated hero pitch with moving ball and visible Scout → Skeptic → Verified Brief flow
3. Working /demo page powered by real StatsBomb Open Data-derived seeded JSON
4. No placeholders, no fake customers, no invented data
5. Seeded fallback that works with no API key
6. Strict TypeScript, clean components, successful build

Do not overbuild auth, billing, database, or video processing.
Ship the smallest excellent version.
```

---

## 32. The actual product North Star

Hackathon MVP:

**verified tactical brief from one real match**

60-day product:

**multi-match opposition room for analysts**

Decacorn platform story:

**trusted multi-agent decision infrastructure for high-stakes teams**

Do not confuse these levels during the sprint.

Win the room first.
