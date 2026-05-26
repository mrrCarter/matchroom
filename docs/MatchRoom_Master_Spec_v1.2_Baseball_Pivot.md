# MatchRoom — Master Spec v1.2: Baseball Pivot

**Status:** Live amendment to v1.1. Supersedes football-specific sections. Boston hackathon edition.
**Owner:** Carter Theogene / PlexAura
**Date applied:** 2026-05-26
**Audience:** Build team currently executing v1.1. Read top to bottom before next commit.

---

## 0. TL;DR — Why we are pivoting mid-sprint

We are shifting MatchRoom's canonical sport from **football (soccer)** to **MLB baseball**.

Three reasons:

1. **Boston hackathon, Boston judges.** Red Sox play home Tue/Wed/Thu of demo week. Celtics + Bruins both eliminated. Baseball is what the room cares about.
2. **Free MLB data is deeper than free soccer data.** Statcast = every pitch since 2008, live, 80+ features per event, no API key. StatsBomb open data is curated subset of ~700 matches. We have more raw material with MLB, not less.
3. **Baseball fits the verification thesis better.** Discrete events + huge sample sizes + verifiable pitch IDs = the Scout / Skeptic / Evidence-gated Brief flow becomes more rigorous, not less.

The architecture does not change. The agents do not change. The schemas barely change. **We are swapping the data layer and the visual hero.** Everything else holds.

---

## 1. What stays identical (do not touch)

- Scout / Skeptic / Brief / Evidence Filter agent topology (sections 19–20 of v1.1)
- `VerifiedBriefResponse` schema (section 17) — only `EvidenceRef` field semantics shift
- Seeded vs live mode pattern (section 16)
- API route structure (`/api/demo-brief`) (section 23)
- Three-panel `/demo` layout (section 14)
- Landing page section list (section 7)
- "Don't take it from us. Ask an AI." section (section 13)
- Non-negotiables list (section 4)
- SWE excellence gates (section 27)
- Build lane structure (section 25)
- Color tokens, typography (section 8)
- Vercel + Next.js + Tailwind + Framer Motion + AI SDK stack
- 60-second pitch script *structure*

If your work this morning touched any of the above, **keep going. No rework needed.**

---

## 2. What changes (the surgical pivot)

| Area | v1.1 (football) | v1.2 (baseball) |
|---|---|---|
| Sport | Football / soccer | **MLB baseball** |
| Data source | StatsBomb Open Data | **Statcast via Baseball Savant + MLB Stats API** |
| Canonical match | Italy vs Spain, Euro 2020 SF | **Red Sox vs Braves, Fenway, this week** |
| Hero animation | Ball traveling pitch | **Strike zone heatmap + spray chart + defensive shift** |
| Headline | "See your next opponent before they see you." | **"See the next pitch before they throw it."** |
| Coach question | "How do we disrupt Spain's progression?" | **"How do we attack the Braves' lineup tomorrow?"** |
| Channel logic | Pitch x/y → left/center/right | **Zones 1–9 (strike zone) + spray zones (pull/center/oppo)** |
| Replay primitive | Ball coordinates on pitch | **Pitch sequence inside strike zone + batted ball trajectory** |
| Attribution | StatsBomb Open Data | **Statcast / Baseball Savant** |

---

## 3. Why the data story is actually stronger now

This is the single biggest mind-shift. Walk in expecting "less data because not StatsBomb." Reality:

| Dimension | StatsBomb Open | Statcast Public |
|---|---|---|
| Cost | Free, curated | **Free, complete** |
| Match coverage | ~700 select matches | **Every MLB game since 2008 (~50k games)** |
| Live data | No | **Yes — real-time** |
| Per-event richness | ~30 features | **80+ features per pitch** |
| API key | No | **No** |
| Boston relevance | Low | **High** |
| Demoable "game just played" | No | **Yes** |

The "judges will not respect MLB data" instinct is wrong. Statcast is the US gold standard. Baseball Savant is consumer-famous.

The only thing public MLB data lacks vs StatsBomb 360: per-frame fielder positioning. We do not need it for v1.

---

## 4. Canonical demo match (replaces section 6 of v1.1)

**Boston Red Sox vs Atlanta Braves — Fenway Park — Tue 5/26 2026 6:45 PM ET**

Seed metadata:

```json
{
  "league": "MLB",
  "season": 2026,
  "gamePk": "<resolve from MLB Stats API>",
  "date": "2026-05-26",
  "home_team": "Boston Red Sox",
  "away_team": "Atlanta Braves",
  "stadium": "Fenway Park",
  "data_source": "Statcast via Baseball Savant + MLB Stats API"
}
```

Fallback matches (in order):
1. Red Sox vs Braves Wed 5/27 (one game later)
2. Most recent completed Red Sox game (always resolvable from schedule endpoint)
3. 2025 Red Sox playoff game (frozen JSON, ships with repo)

Why this game:
- Local. Boston judges. Fenway visible from many vantage points across the city.
- Real game completed ~12 hours before demo time = "brief built from last night's data" moment.
- Braves have stars judges recognize (Acuña, Ozuna, Olson).
- Red Sox is the home team — the brief is from *Boston's coach's perspective*. That framing matters in the room.

---

## 5. Data layer (replaces section 5 of v1.1)

### Primary sources (all free, no API key)

1. **MLB Stats API** — `https://statsapi.mlb.com`
   - Schedule, lineups, live game feed, play-by-play
   - Use endpoint: `GET /api/v1/schedule?sportId=1&date=2026-05-26&teamId=111`
   - Live feed: `GET /api/v1.1/game/{gamePk}/feed/live`
   - Play-by-play: `GET /api/v1/game/{gamePk}/playByPlay`

2. **Baseball Savant CSV / Statcast Search** — `https://baseballsavant.mlb.com`
   - Per-pitch data: velocity, spin rate, spin axis, release point (x/y/z), plate location (x/y), pitch type, movement, perceived velocity, extension
   - Per batted ball: exit velocity, launch angle, launch direction, hit distance, xBA, xwOBA, xSLG, hit coordinates
   - CSV docs: `https://baseballsavant.mlb.com/csv-docs`

3. **pybaseball** (optional preprocessing only — TypeScript runtime does not need Python)
   - One-shot script to seed JSON. Not on the request path.

### Required attribution copy (replaces section 5 of v1.1)

> Data via Statcast / Baseball Savant and the MLB Stats API. This demo is a research / exploration project built for a sports-tech hackathon.

Show on `/demo`, evidence drawer, and footer.

### Data files (replaces section 22 — `public/data/`)

```
public/data/
├─ matchroom-game-metadata.json     # Red Sox vs Braves metadata
├─ matchroom-pitch-sequence.json    # selected at-bat pitch trail for hero animation
├─ matchroom-statcast-summary.json  # computed batter splits, pitcher tendencies
└─ matchroom-demo-brief.json        # full verified brief, seeded
```

---

## 6. Hero animation (replaces section 10 of v1.1)

The "ball moving across a football pitch" hero is replaced. Same agent rail phases. Different visual primitive.

### New hero metaphor

**A single high-leverage at-bat plays out. Pitches plot inside the strike zone. Skeptic challenges the call. Verified defensive shift animates onto the diamond.**

### Layout

Left side (unchanged):
- Headline
- Subheadline
- Two CTAs
- Trust microcopy

Right side (new):
- Compact diamond overlay (top)
- Strike zone grid (center) — pitches plot live as colored dots inside the 3x3 zone
- Spray chart wedge (bottom) — batted ball location
- Agent rail overlaid on right edge

### Animation phases (map 1:1 to v1.1 phases)

**Phase 1 — Load game**

```
MLB · Red Sox vs Braves · Fenway · 2026-05-26
Loading play-by-play
Loading Statcast pitch data
Building at-bat sequence
```

Agent rail: `Data Ingest` glows.

**Phase 2 — Pitch sequence animates**

Pitches plot into strike zone one at a time, in real pitch order from a real at-bat. Each pitch is a colored dot labeled with pitch type and velocity (e.g. `FF 96.4`). Coordinates come from real Statcast `plate_x`, `plate_z`.

No random motion. No invented pitches.

Agent rail: `Scout Agent` activates.

**Phase 3 — Scout card appears**

Copy template:

```
Scout hypothesis
Pattern candidate: batter chases breaking balls off the plate low-and-away in 2-strike counts.
```

With computed value if extractor supports:

```
Scout hypothesis
{batter} chase rate on breaking balls below the zone with 2 strikes: {computed_chase_rate}% on {n} pitches (last 30 days).
```

**Phase 4 — Skeptic card appears**

Copy template:

```
Skeptic check
Sample size acceptable. Claim narrowed: chase rate holds only when first pitch of at-bat was a fastball above 95. Otherwise chase rate drops to league average.
```

This is the trust moment. Make it visually prominent.

**Phase 5 — Verified brief appears**

Copy template:

```
Verified coach note
Establish fastball above 95 early, then attack below the zone with breaking stuff in 2-strike counts. Position 3B {n} steps off the line on pull-side weak contact tendency.
```

The diamond overlay animates a defensive shift recommendation here.

**Phase 6 — CTA pulse**

Same as v1.1.

### Technical notes

- Same component: `components/landing/HeroPitchDemo.tsx` (keep the filename, rename internally — saves rework)
- Same library choice: Framer Motion for SVG animations
- Strike zone is a 3x3 grid drawn in SVG, normalized to Statcast coordinate space (`plate_x` ∈ approx [-1.5, 1.5] feet, `plate_z` ∈ approx [1.0, 4.0] feet)
- Diamond is a simple SVG diamond shape, 4 bases, fielder dots at standard positions, shift recommendation animates dots to new positions

---

## 7. Schemas — minor surgical updates (replaces section 17–18)

The top-level `VerifiedBriefResponse` shape **does not change**. The match block fields renamed and `EvidenceRef` adapted to pitches.

```ts
export type Confidence = "low" | "medium" | "high";

export interface EvidenceRef {
  pitchId: string;          // Statcast UUID or composed key
  gamePk: number;           // MLB Stats API game primary key
  inning: number;
  halfInning: "top" | "bottom";
  atBatIndex: number;
  pitchNumber: number;
  pitcher?: string;
  batter?: string;
  pitchType?: string;       // FF, SL, CH, etc.
  description: string;
  plateX?: number;          // Statcast feet, horizontal at plate
  plateZ?: number;          // Statcast feet, vertical at plate
  exitVelocity?: number;
  launchAngle?: number;
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
  game: {
    league: "MLB";
    season: number;
    gamePk: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    score?: string;
    stadium?: string;
    dataSource: string;
  };
  coachQuestion: string;
  executiveSummary: string;
  attackingPlan: TacticalInsight[];      // was attackingPatterns
  defensiveAlignment: TacticalInsight[]; // was defensiveTendencies
  pitchingPlan: TacticalInsight[];       // new — pitch sequencing recs
  riskFlags: TacticalInsight[];
  coachActions: string[];
  evidenceNotes: string[];
}
```

### Hero replay schema (replaces section 18)

```ts
export interface PitchPoint {
  pitchId: string;
  t: number;                // seconds offset in animation
  plateX: number;
  plateZ: number;
  pitchType: string;
  velocity: number;
  result: "ball" | "called_strike" | "swing_miss" | "foul" | "in_play";
  label?: string;
}

export interface BattedBallPoint {
  x: number;                // spray chart x
  y: number;                // spray chart y
  exitVelocity: number;
  launchAngle: number;
  result: string;           // single, double, out, etc.
}

export interface HeroAtBat {
  gamePk: number;
  label: string;
  pitches: PitchPoint[];
  battedBall?: BattedBallPoint;
  computedFrom: "statcast";
}
```

---

## 8. Deterministic extraction (replaces section 21)

Before agents run, compute simple truths from pitch + play data. These extractors live in `lib/analytics/`.

```ts
extractAtBats(plays)
extractPitchSequences(plays)
extractChaseRate(pitches, opts)              // pitches outside zone swung at
extractWhiffRate(pitches, opts)              // swinging strikes / swings
extractExitVeloByLocation(battedBalls)
extractZoneHeatmap(pitches)                  // pitch density across 3x3 zone
extractSprayChart(battedBalls)               // pull / center / oppo
extractPlatoonSplits(events, batter)
extractCountTendencies(pitches, pitcher)     // pitch type by 0-0, 1-1, 2-2, etc.
extractLeverageMoments(plays)                // high-WPA situations
buildHeroAtBat(plays, pitches)
```

### Zone logic

Statcast strike zone (right-handed batter):
- `plate_x` horizontal: roughly -0.83 to +0.83 feet inside the zone
- `plate_z` vertical: top of zone ≈ 3.5 ft, bottom ≈ 1.5 ft (varies by batter height — use `sz_top` / `sz_bot` fields when present)
- 3x3 grid: split each axis into thirds. Zones numbered 1–9 (top-left to bottom-right) by convention.

### Spray chart logic

- Pull side, center, opposite field — derive from batter handedness + `hc_x` / `hc_y` hit coordinates

### Anti-overclaim rule (unchanged in spirit)

Acceptable:

```
In the selected sample, Acuña's chase rate on low-and-away breaking balls in 2-strike counts is {x}% on {n} pitches.
```

Not acceptable without proof:

```
Acuña always chases breaking balls.
```

---

## 9. Agent prompts (light edits to section 20)

Only the system prompt domain language changes. Structure unchanged.

### Scout prompt

```
You are MatchRoom Scout, an opposition-analysis assistant for MLB baseball.

You receive structured game metadata, deterministic summaries, and selected evidence references from real Statcast data.

Generate tactical observations that are specific, useful, and grounded in pitching, hitting, or defensive alignment decisions a coach can act on.

Rules:
- Do not invent facts.
- Do not invent pitch IDs.
- Do not claim exact counts unless provided.
- Prefer coach-relevant language (pitch sequencing, plate discipline, defensive positioning, leverage situations).
- Every observation must cite at least one evidence reference.
- If the evidence is thin, mark confidence as low.

Return structured JSON only.
```

### Skeptic prompt

```
You are MatchRoom Skeptic, an adversarial reviewer for baseball tactical claims.

Challenge the Scout's claims. Common failure modes to attack:
- Small samples passed off as patterns
- Hot streaks confused with skill
- Claims that don't survive platoon splits
- Recommendations that ignore game state, count, or leverage

Reject vague or unsupported claims. Revise claims that can be sharpened. Accept claims supported by evidence references.

For each claim, output:
- accepted, revised, or rejected
- skeptic note
- confidence adjustment
- revised claim if needed

Return structured JSON only.
```

### Brief prompt

```
You are MatchRoom Brief, the final coach-facing summarizer.

Use only accepted or revised claims. Write a compact tactical brief for an MLB coaching staff.

Rules:
- No fluff.
- No invented facts.
- Use plain baseball language.
- Every key point must include evidence summary.
- End with 3 practical coach actions across attacking plan, pitching plan, and defensive alignment.

Return structured JSON only.
```

---

## 10. Demo page (light edits to section 14–15)

The three-panel layout is unchanged. Per-panel content shifts:

### Left panel — Coach question

Match metadata (Red Sox vs Braves). Team perspective: default to **Red Sox**. Default question:

```
How do we attack the Braves' lineup tomorrow and where should we hide our weak defenders?
```

### Center panel — Strike zone + spray chart

- Strike zone SVG (3x3 grid) with pitches plotting in
- Spray chart wedge below
- Diamond overlay above with fielder positions
- Sequence list reads at-bat by at-bat instead of possession by possession
- Replay button

### Right panel — Agent rail + brief

Unchanged.

### Bottom drawer

- Pitch IDs (Baseball Savant URL pattern: `https://baseballsavant.mlb.com/sporty-videos?playId={uuid}` when available)
- Confidence
- Statcast attribution
- Demo credentialing badge

---

## 11. Landing page copy (replaces section 9)

### Headline

**See the next pitch before they throw it.**

### Subheadline

**MatchRoom turns real Statcast data into a verified coaching brief — scout, skeptic, and coach-ready output in minutes.**

### Primary CTA

**Watch the Brief Build**

### Secondary CTA

**Open Interactive Demo**

### Trust microcopy

**Built on real MLB Statcast data. No invented numbers.**

---

## 12. Brand / stack carousel (replaces section 11)

Carousel items (replace football items):

- Statcast / Baseball Savant
- MLB Stats API
- OpenAI
- Anthropic
- Gemini
- Grok / xAI
- Next.js
- Vercel
- Senti
- PlexAura

Same rules: no "trusted by," no customer implication.

---

## 13. "Don't take it from us. Ask an AI." (light edit to section 13)

Only the prompt body changes. Same four model cards, same copy mechanism, same URLs.

### Prompt to copy

```
What is MatchRoom by PlexAura?

Evaluate this product concept as a technical product analyst:

MatchRoom ingests real MLB Statcast and play-by-play data, generates tactical hypotheses for pitching, hitting, and defensive alignment, uses a scout agent plus a skeptic / verifier agent, and produces a coach-ready tactical brief.

Explain:
1. What problem it solves for an MLB coaching staff
2. How it differs from a static analytics dashboard like Baseball Savant
3. How it differs from a plain sports chatbot
4. Why the skeptic / verifier layer matters
5. Why a coach, advance scout, or front office would care
6. What technical risks the team should solve next
```

---

## 14. File rename map

Most files keep their names to minimize rework. Internal contents shift.

| Path | Action |
|---|---|
| `lib/data/statsbomb.ts` | **Rename** → `lib/data/statcast.ts` |
| `lib/types/statsbomb.ts` | **Rename** → `lib/types/statcast.ts` |
| `lib/analytics/possessions.ts` | **Rename** → `lib/analytics/atBats.ts` |
| `lib/analytics/progressions.ts` | **Rename** → `lib/analytics/pitchSequences.ts` |
| `lib/analytics/channels.ts` | **Rename** → `lib/analytics/zones.ts` |
| `lib/analytics/shots.ts` | **Rename** → `lib/analytics/battedBalls.ts` |
| `scripts/parse-statsbomb.ts` | **Rename** → `scripts/parse-statcast.ts` |
| `components/landing/HeroPitchDemo.tsx` | **Keep filename**, swap internals |
| `components/demo/PitchReplay.tsx` | **Keep filename**, swap to strike zone + spray |
| Everything else under `components/` | **Keep, no rename** |

---

## 15. Migration order (priority for next commits)

If you have been building v1.1 for the last 60 minutes, here is the order to convert without losing momentum:

1. **First 10 minutes** — seeded JSON. Carter or whoever owns Lane C runs a one-shot script (Python or Node) to pull yesterday's Red Sox game and a sample at-bat, write the four files in `public/data/`. Everyone else can keep working off the seed.
2. **Next 20 minutes** — schema swap. Update `lib/types/` to match section 7 of this doc. TypeScript will surface every site that needs updating.
3. **Next 20 minutes** — hero animation. Swap pitch SVG for strike zone + spray chart SVG inside `HeroPitchDemo.tsx`. Same Framer Motion patterns. Same agent rail phases.
4. **Next 20 minutes** — copy update. Headline, subheadline, trust line, coach question, prompt to copy, carousel.
5. **Next 20 minutes** — demo page panels. Center panel becomes strike zone + spray + diamond. Right panel unchanged structurally.
6. **Last 30 minutes** — polish, attribution, QA gates.

If anyone has already built football-specific UI components that cannot be easily reskinned, leave them out of the seeded demo and route the live mode flag to skip them. Do not block on cleanup.

---

## 16. Non-negotiables (unchanged from v1.1)

- No placeholder data.
- No fake customers.
- No invented Statcast values.
- No claims without `EvidenceRef`.
- Seeded fallback must work without any API key.
- Statcast / MLB Stats API attribution visible.
- No auth wall.

---

## 17. The 30-second judge pitch (replaces section 30)

```
Every MLB coaching staff has more data than they can use. Baseball Savant has every pitch since 2008. Front offices have TruMedia. But on Sunday night, a manager still gets a forty-page PDF and a tired analyst saying "trust me."

MatchRoom is the verified AI coaching room for baseball. Watch this: we load yesterday's Red Sox game from Statcast, ask how to attack the Braves' lineup, and the system turns thousands of pitches into a coach-ready brief.

The important part is not just the scout agent. The skeptic agent challenges weak claims and forces evidence. Only verified insights make it into the coach card.

So instead of another dashboard, coaches get an actionable brief: what pitch to throw, where to position the defense, what to train.

MLB advance scouting is the wedge. Verified agentic decision-making is the platform.
```

---

## 18. Risk register (be honest with the team)

- **2-hour pivot mid-sprint is not free.** Mitigation: most files keep names. Schema changes are surgical. Agents are domain-agnostic.
- **Baseball Savant is a famous public tool.** Judges may say "I can already look this up." Counter: the moat is not the data, it is the **skeptic-gated verification layer**. Make the Skeptic card the most prominent thing in the demo.
- **Strike zone is less cinematic than a moving ball.** Counter: spray chart fills in real time, defensive shift animates on diamond. Multiple visual primitives instead of one.
- **MLB licensing is stricter for commercial use long-term.** Hackathon = "research / exploration project." Future = needs MLBAM conversation. Not a problem this week.

---

## 19. Builder instruction (replaces section 31)

Copy this into Claude / Codex / Cursor / Senti:

```
Build MatchRoom v1.2 from this spec.

Prioritize:
1. Beautiful premium dark landing page focused on MLB
2. Animated hero with strike zone heatmap, pitch sequence, and defensive shift overlay, showing Scout → Skeptic → Verified Brief flow
3. Working /demo page powered by real Statcast / MLB Stats API data, served from seeded JSON
4. No placeholders, no fake customers, no invented Statcast values
5. Seeded fallback that works with no API key
6. Strict TypeScript, clean components, successful build

Canonical game: Boston Red Sox vs Atlanta Braves, Fenway, 2026-05-26.

Do not overbuild auth, billing, database, or video processing.
Ship the smallest excellent version.
```

---

## 20. North Star (unchanged structurally)

Hackathon MVP:
**verified tactical brief from one real MLB game, demoed in front of Boston judges**

60-day product:
**multi-game advance-scouting room for MLB front offices and minor league affiliates**

Decacorn platform story:
**trusted multi-agent decision infrastructure for high-stakes teams**

Do not confuse these levels during the sprint. Win the room first.
