"use client";

import { useState } from "react";
import { fetchWithTimeout } from "@/lib/utils/fetch-with-timeout";

type Status = "idle" | "submitting" | "ok" | "error";

export function RequestDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      team: String(fd.get("team") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    setStatus("submitting");
    setError("");
    try {
      const res = await fetchWithTimeout("/api/request-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        timeoutMs: 8000,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("ok");
        form.reset();
      } else {
        setStatus("error");
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  };

  return (
    <section id="request-demo" className="mx-auto max-w-6xl px-6 py-24">
      <div className="glass grid gap-10 rounded-3xl p-8 sm:p-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Request a demo
          </h2>
          <p className="mt-3 max-w-md text-muted">
            Tell us about your club or front office and we&apos;ll set up a
            walkthrough of the verified coaching room on a game you care about.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <span className="text-green">●</span> Built on real Statcast data
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green">●</span> Evidence-gated briefs, no
              invented numbers
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green">●</span> We&apos;ll reply to the email
              you provide
            </li>
          </ul>
        </div>

        {status === "ok" ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-green/30 bg-green/5 p-8 text-center"
            role="status"
          >
            <div className="text-2xl">✓</div>
            <h3 className="mt-2 text-lg font-semibold text-green">
              Request received
            </h3>
            <p className="mt-1 text-sm text-muted">
              Thanks — we&apos;ve logged your request and will be in touch shortly.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-4 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Alex Cora" required />
              <Field
                label="Work email"
                name="email"
                type="email"
                placeholder="you@club.com"
                required
              />
            </div>
            <Field
              label="Team / organization"
              name="team"
              placeholder="Boston Red Sox"
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-muted">
                What do you want to scout?{" "}
                <span className="text-muted/50">(optional)</span>
              </span>
              <textarea
                name="message"
                rows={3}
                placeholder="We want to prep for our next series against…"
                className="rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-muted/50 focus:border-green/40"
              />
            </label>

            {status === "error" && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 rounded-xl bg-green px-6 py-3 text-sm font-semibold text-bg transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
            >
              {status === "submitting" ? "Sending…" : "Request a demo"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted">
        {label}
        {required && <span className="ml-0.5 text-green">*</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-muted/50 focus:border-green/40"
      />
    </label>
  );
}
