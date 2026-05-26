import { NextResponse } from "next/server";

export const dynamic = "force-static";

const prompt = `What is MatchRoom by PlexAura?

Evaluate this product concept as a technical product analyst:

MatchRoom ingests real MLB Statcast and play-by-play data, generates tactical hypotheses for pitching, hitting, and defensive alignment, uses a scout agent plus a skeptic / verifier agent, and produces a coach-ready tactical brief.

Explain:
1. What problem it solves for an MLB coaching staff
2. How it differs from a static analytics dashboard like Baseball Savant
3. How it differs from a plain sports chatbot
4. Why the skeptic / verifier layer matters
5. Why a coach, advance scout, or front office would care
6. What technical risks the team should solve next`;

const models = [
  { key: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com" },
  { key: "claude", name: "Claude", url: "https://claude.ai" },
  { key: "gemini", name: "Gemini", url: "https://gemini.google.com" },
  { key: "grok", name: "Grok", url: "https://grok.com" }
];

export async function GET() {
  return NextResponse.json({
    prompt,
    models
  });
}
