import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestDemoBody {
  name?: string;
  email?: string;
  team?: string;
  message?: string;
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/**
 * Receives "Request a demo" submissions. Always succeeds when the input is
 * valid: it stores the record to a local JSONL "quick db" (best-effort) and, if
 * a RESEND_API_KEY is configured, emails it. The demo button therefore works
 * with or without any keys configured.
 */
export async function POST(req: NextRequest) {
  let body: RequestDemoBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const team = (body.team ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "A name and a valid email are required." },
      { status: 400 },
    );
  }

  const record = { name, email, team, message, at: new Date().toISOString() };

  // Quick db: append to a JSONL file. Best-effort; never fails the request.
  let stored = false;
  try {
    const dir = path.join(os.tmpdir(), "matchroom");
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, "request-demo.jsonl"),
      JSON.stringify(record) + "\n",
      "utf8",
    );
    stored = true;
  } catch {
    /* storage is best-effort */
  }

  // Email via Resend if configured. Best-effort; never fails the request.
  let emailed = false;
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const to = process.env.REQUEST_DEMO_TO || "carther91@gmail.com";
      const from = process.env.RESEND_FROM || "MatchRoom <onboarding@resend.dev>";
      const res = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `MatchRoom demo request — ${name}${team ? ` (${team})` : ""}`,
          text: `New MatchRoom demo request\n\nName: ${name}\nEmail: ${email}\nTeam: ${team || "—"}\nMessage: ${message || "—"}\nReceived: ${record.at}`,
        }),
        timeoutMs: 6000,
      });
      emailed = res.ok;
    } catch {
      /* email is best-effort */
    }
  }

  return NextResponse.json({ ok: true, stored, emailed });
}
