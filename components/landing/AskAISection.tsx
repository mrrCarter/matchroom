"use client";

import { useEffect, useState } from "react";

const FALLBACK_PROMPT = `What is MatchRoom by PlexAura?

Evaluate this product concept as a technical product analyst:

MatchRoom ingests real MLB Statcast and play-by-play data, generates tactical hypotheses for pitching, hitting, and defensive alignment, uses a scout agent plus a skeptic / verifier agent, and produces a coach-ready tactical brief.

Explain:
1. What problem it solves for an MLB coaching staff
2. How it differs from a static analytics dashboard like Baseball Savant
3. How it differs from a plain sports chatbot
4. Why the skeptic / verifier layer matters
5. Why a coach, advance scout, or front office would care
6. What technical risks the team should solve next`;

interface AskAiModel {
  key: string;
  name: string;
  url: string;
}

const FALLBACK_MODELS: AskAiModel[] = [
  { key: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com" },
  { key: "claude", name: "Claude", url: "https://claude.ai" },
  { key: "gemini", name: "Gemini", url: "https://gemini.google.com" },
  { key: "grok", name: "Grok", url: "https://grok.com" },
];

export function AskAISection() {
  const [copied, setCopied] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(FALLBACK_PROMPT);
  const [models, setModels] = useState(FALLBACK_MODELS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ask-ai-links")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { prompt?: string; models?: AskAiModel[] }) => {
        if (cancelled) return;
        if (typeof d.prompt === "string") setPrompt(d.prompt);
        if (Array.isArray(d.models) && d.models.length > 0) setModels(d.models);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const copyFor = async (name: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(name);
      window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <section id="ask-ai" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Don&apos;t take it from us. Ask an AI.
        </h2>
        <p className="mt-3 text-muted">
          We give you the prompt. You pick the model. Copy it, paste it, and let
          a model you already trust evaluate MatchRoom.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {models.map((m) => (
          <div
            key={m.key}
            className="glass flex flex-col justify-between rounded-2xl p-5"
          >
            <div className="text-lg font-semibold">{m.name}</div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => copyFor(m.name)}
                className="rounded-lg bg-green/15 px-3 py-2 text-sm font-semibold text-green ring-1 ring-green/30 transition-colors hover:bg-green/25"
              >
                {copied === m.name ? "Prompt copied ✓" : "Copy Prompt"}
              </button>
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-center text-sm text-muted transition-colors hover:text-text"
              >
                Open {m.name}
              </a>
            </div>
          </div>
        ))}
      </div>

      {copied && (
        <p className="mt-6 text-center text-sm text-green" role="status">
          Prompt copied. Paste it into {copied}.
        </p>
      )}
    </section>
  );
}
