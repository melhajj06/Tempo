"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/auth-context";

import { SignInPanel } from "./SignInPanel";

export function NavbarAuth() {
  const { user, loading, refreshSession } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function signOut() {
    setBusy(true);
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
    return (
      <div aria-hidden className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-[var(--tempo-muted)]" />
    );
  }

  const display = user?.isGuest
    ? "Guest"
    : (user?.label?.trim() || "Signed in");

  return (
    <div className="relative z-40 shrink-0" ref={panelRef}>
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
              aria-label="Account"
              className="absolute right-0 top-[calc(100%+6px)] w-[min(100vw-2rem,16rem)] rounded-xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-3 shadow-lg"
              role="dialog"
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
              aria-label="Sign in to Tempo"
              className="absolute right-0 top-[calc(100%+6px)] z-50 w-[min(100vw-1rem,19rem)] rounded-xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-3 shadow-xl"
              role="dialog"
            >
              <SignInPanel
                onAuthenticated={async () => {
                  setOpen(false);
                  await refreshSession();
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
