"use client";

import { NavbarAuth } from "./NavbarAuth";

type AppHeaderProps = {
  uiMessage: string;
  onOpenMenu: () => void;
  /** Optional quick action shown on larger screens (e.g., Focus). */
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  /** Show slide-out menu trigger; omit on sign-in-only shells. */
  showMenu?: boolean;
  /** Hide account control (when the page provides its own sign-in UI). */
  showNavbarAuth?: boolean;
};

/**
 * Top bar: Tempo branding, ambient status message, slide-out navigation, optional primary control.
 */
export function AppHeader({
  uiMessage,
  onOpenMenu,
  primaryAction,
  showMenu = true,
  showNavbarAuth = true,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--tempo-border)] bg-[var(--tempo-surface)]/95 backdrop-blur-sm">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {showMenu ? (
            <div className="shrink-0">
              <button
                aria-label="Open navigation menu"
                className="rounded-md border border-[var(--tempo-border)] p-2 hover:bg-[var(--tempo-muted)]"
                onClick={onOpenMenu}
                type="button"
              >
                <span className="flex h-5 w-5 flex-col justify-center gap-1">
                  <span className="block h-0.5 w-5 bg-[var(--tempo-ink)]" />
                  <span className="block h-0.5 w-5 bg-[var(--tempo-ink)]" />
                  <span className="block h-0.5 w-5 bg-[var(--tempo-ink)]" />
                </span>
              </button>
            </div>
          ) : null}
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--tempo-ink)]">Tempo</h1>
            <span className="hidden text-sm text-[var(--tempo-muted-foreground)] md:inline">Smart agenda for students</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-3">
          {primaryAction && (
            <button
              className="hidden shrink-0 rounded-lg bg-[var(--tempo-ink)] px-3 py-2 text-sm font-medium text-[var(--tempo-surface)] disabled:opacity-40 md:inline-flex"
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
              type="button"
            >
              {primaryAction.label}
            </button>
          )}
          <div className="hidden min-w-0 max-w-xl flex-1 truncate rounded-md border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm text-[var(--tempo-muted-foreground)] sm:block">
            {uiMessage}
          </div>
          {showNavbarAuth ? <NavbarAuth /> : null}
        </div>
      </div>
    </header>
  );
}
