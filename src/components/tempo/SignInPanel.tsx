"use client";

import { FormEvent, useState } from "react";

type Props = {
  onAuthenticated: () => void | Promise<void>;
};

/** Shared password gate form for toolbar dropdown and landing modal. */
export function SignInPanel({ onAuthenticated }: Props) {
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, label: label.trim() || undefined }),
      });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not sign in.");
        return;
      }
      setPassword("");
      await onAuthenticated();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-2 text-left" onSubmit={signIn}>
      <input
        autoComplete="username"
        className="w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
        name="label"
        onChange={(ev) => setLabel(ev.target.value)}
        placeholder="Display name (optional)"
        type="text"
        value={label}
      />
      <input
        autoComplete="current-password"
        className="w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
        name="password"
        onChange={(ev) => setPassword(ev.target.value)}
        placeholder="App password"
        required
        type="password"
        value={password}
      />
      {message && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-950">{message}</p>
      )}
      <button
        className="w-full rounded-lg bg-[var(--tempo-ink)] py-2 text-sm font-medium text-[var(--tempo-surface)] disabled:opacity-50"
        disabled={busy}
        type="submit"
      >
        {busy ? "…" : "Sign in"}
      </button>
    </form>
  );
}
