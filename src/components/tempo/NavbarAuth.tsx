"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";

export function NavbarAuth() {
  const { user, loading, refreshSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function signIn(e: React.FormEvent) {
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
      const data: { ok?: boolean; error?: string; label?: string | null } = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not sign in.");
        return;
      }
      setPassword("");
      setOpen(false);
      await refreshSession();
    } catch {
      setMessage("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMessage(null);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      await refreshSession();
      setOpen(false);
    } catch {
      await refreshSession();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-[var(--tempo-muted)]" aria-hidden="true" />;
  }

  const display = user?.label?.trim() || "Signed in";

  return (
    <div ref={panelRef} className="relative z-40 shrink-0">
      {user ? (
        <>
          <button
            aria-expanded={open}
            aria-haspopup="dialog"
            className="flex max-w-[min(260px,calc(100vw-96px))] items-center gap-2 rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-left text-xs text-[var(--tempo-ink)] hover:bg-[var(--tempo-surface)] md:text-sm"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <span className="min-w-0 flex-1 truncate">{display}</span>
            <span aria-hidden className="text-[var(--tempo-muted-foreground)]">▾</span>
          </button>
          {open && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] w-[min(100vw-2rem,16rem)] rounded-xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-3 shadow-lg"
              role="dialog"
              aria-label="Account"
            >
              <button
                className="w-full rounded-lg border border-[var(--tempo-border)] px-3 py-2 text-sm hover:bg-[var(--tempo-muted)] disabled:opacity-50"
                disabled={busy}
                onClick={() => signOut()}
                type="button"
              >
                Sign out
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            aria-expanded={open}
            aria-haspopup="dialog"
            className="rounded-lg bg-[var(--tempo-ink)] px-3 py-2 text-xs font-medium text-[var(--tempo-surface)] hover:opacity-90 md:text-sm"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            Sign in
          </button>
          {open && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-1rem,19rem)] rounded-xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-3 shadow-xl"
              role="dialog"
              aria-label="Sign in to Tempo"
            >
              <form className="space-y-2" onSubmit={signIn}>
                <input
                  autoComplete="username"
                  className="w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
                  name="label"
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Display name (optional)"
                  type="text"
                  value={label}
                />
                <input
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
