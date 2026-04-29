"use client";

import { useState } from "react";

import { useAuth } from "@/contexts/auth-context";

import { SignInPanel } from "./SignInPanel";

/** Centered entry: guest session or modal sign-in. */
export function LandingGate() {
  const { refreshSession } = useAuth();
  const [guestBusy, setGuestBusy] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [guestMsg, setGuestMsg] = useState<string | null>(null);

  async function continueAsGuest() {
    setGuestMsg(null);
    setGuestBusy(true);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST", credentials: "include" });
      const data: { ok?: boolean; error?: string } = await res.json();
      if (!res.ok) {
        setGuestMsg(data.error ?? "Could not continue as guest.");
        return;
      }
      await refreshSession();
    } catch {
      setGuestMsg("Network error.");
    } finally {
      setGuestBusy(false);
    }
  }

  return (
    <div className="flex min-h-[min(520px,calc(100vh-8rem))] flex-col items-center justify-center px-6 text-center">
      <p className="text-xl font-semibold tracking-tight">Welcome to Tempo</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--tempo-muted-foreground)]">
        Sign in with the app password, or continue as a guest to try the dashboard in this browser.
      </p>
      <div className="mt-10 flex w-full max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          className="w-full min-w-[10rem] rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-surface)] px-6 py-3 text-sm font-medium text-[var(--tempo-ink)] hover:bg-[var(--tempo-muted)] disabled:opacity-50 sm:w-auto"
          disabled={guestBusy}
          onClick={() => void continueAsGuest()}
          type="button"
        >
          {guestBusy ? "…" : "Continue as guest"}
        </button>
        <button
          className="w-full min-w-[10rem] rounded-lg bg-[var(--tempo-ink)] px-6 py-3 text-sm font-medium text-[var(--tempo-surface)] hover:opacity-90 sm:w-auto"
          onClick={() => setSignInOpen(true)}
          type="button"
        >
          Sign in
        </button>
      </div>
      {guestMsg && (
        <p className="mt-4 max-w-md rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {guestMsg}
        </p>
      )}
      {signInOpen && (
        <div
          aria-labelledby="sign-in-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSignInOpen(false)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <button
              aria-label="Close"
              className="absolute right-3 top-3 rounded-lg p-1 text-lg leading-none text-[var(--tempo-muted-foreground)] hover:bg-[var(--tempo-muted)]"
              onClick={() => setSignInOpen(false)}
              type="button"
            >
              ×
            </button>
            <h2 className="mb-4 pr-8 text-lg font-semibold text-[var(--tempo-ink)]" id="sign-in-title">
              Sign in to Tempo
            </h2>
            <SignInPanel
              onAuthenticated={async () => {
                await refreshSession();
                setSignInOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
