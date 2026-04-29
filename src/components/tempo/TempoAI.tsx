"use client";

import { FormEvent, useState } from "react";

type TempoAIProps = {
  /** Dense plaintext: full tasks, blocked time, reminders, goals, archives, conflicts, calendar refs. Server-only with API key. */
  context: string;
};

/** TempoAI, which calls `/api/gemini`; Gemini runs server-side using your aggregated Tempo data. */
export function TempoAI({ context }: TempoAIProps) {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setReply("");
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, tempoAiContext: context }),
      });
      const data: { text?: string; error?: string; model?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      if (data.text) {
        setReply(data.text);
      }
    } catch {
      setError("Could not reach TempoAI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm">
      <h2 className="mb-1 text-[15px] font-semibold tracking-tight text-[var(--tempo-ink)]">TempoAI</h2>
      <p className="mb-3 text-xs text-[var(--tempo-muted-foreground)]">
        <span className="font-medium text-[var(--tempo-ink)]">Gemini 2.5 Flash</span>
        {', '}AI assistant with the context of your current schedule, tasks, deadlines, etc.
      </p>
      <form className="space-y-3" onSubmit={submit}>
        <textarea
          className="min-h-[84px] w-full resize-none rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none placeholder:text-[var(--tempo-muted-foreground)] focus:ring-2 focus:ring-[var(--tempo-ring)]"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Which deadline should I prioritize this week?"
          value={prompt}
        />
        <button
          className="w-full rounded-lg bg-[var(--tempo-ink)] px-3 py-2.5 text-sm font-medium text-[var(--tempo-surface)] disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? "Thinking…" : "Ask TempoAI"}
        </button>
      </form>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {reply && (
        <div className="mt-3 whitespace-pre-wrap rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm leading-relaxed text-[var(--tempo-ink)]">
          {reply}
        </div>
      )}
    </div>
  );
}
