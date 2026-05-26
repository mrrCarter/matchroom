# MatchRoom Spec

## Mission

MatchRoom is a verified multi-agent decision room for sports teams. It turns real event data into a coach-ready brief by running deterministic extraction, Scout hypotheses, Skeptic review, and evidence-gated final recommendations.

## Current Public Wedge

The public hackathon demo is MLB advance scouting for Red Sox vs Braves:

- Upcoming context: Atlanta Braves at Boston Red Sox, Fenway Park, May 26, 2026, `gamePk=824758`.
- Seed evidence sample: Boston Red Sox at Atlanta Braves, May 17, 2026, `gamePk=824923`.
- Data source: MLB Stats API and Statcast-derived Baseball Savant references.

The soccer substrate lives in a separate repo, `mrrCarter/matchroom-soccer-substrate`, and follows the original football master spec with StatsBomb Open Data.

## Non-Negotiables

- No invented stats, IDs, teams, games, or tactical metrics.
- Every coach-facing claim must carry evidence or be explicitly marked as context.
- Seeded mode must work without model keys or a database.
- Data source attribution must be visible.
- Secrets must live only in GitHub Actions secrets or local environment variables, never in files.

## Quality Gates

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Omar Gate blocks at P1 or higher on protected PRs and main pushes.

## Routes And Endpoints

- `/` renders the public MatchRoom landing page and the current upcoming-game proof hook.
- `/demo` renders the interactive verified coaching-room demo.
- `/present` renders the short presentation view.
- `GET /api/demo-brief` returns the seeded verified brief and must work without model keys.
- `POST /api/demo-brief` accepts a coach question, optional `gamePk`, and live mode request, then falls back to seeded data if live generation cannot complete.
- `GET /api/upcoming-game` returns the next or requested MLB game context from the MLB Stats API, plus real seeded evidence fallback fields when current pitch data is unavailable.
- `GET /api/health` returns app status, seeded evidence status, and optional live MLB connectivity checks.
- `GET /api/ask-ai-links` returns prebuilt external model links and prompt text for the landing page.
- `POST /api/request-demo` receives demo-request form submissions and optionally forwards mail through Resend when `RESEND_API_KEY` is configured.
- Static data under GET /data/*.json is generated from real MLB/Statcast-derived sources and used as the no-key fallback.
- GET /data/matchroom-demo-brief.json is the full seeded verified brief fallback.
- GET /data/matchroom-pitch-sequence.json is the real seeded pitch trail for the landing/demo replay.
- GET /data/matchroom-statcast-summary.json is the computed evidence summary used by proof cards.
- GET /data/matchroom-game-metadata.json is the seeded game metadata record.

## Client Data Loading

Client components may fetch seeded API and static data, but effects must abort or ignore in-flight requests on unmount. No fetch response may be treated as evidence unless it resolves through the typed loaders or seeded JSON contracts.

## Canonical Docs

- `README.md`
- `docs/MatchRoom_Master_Spec_and_Scaffold_v1_1.md`
- `docs/MatchRoom_Master_Spec_v1.2_Baseball_Pivot.md`
