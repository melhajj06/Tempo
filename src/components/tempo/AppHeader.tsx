import React from "react";

type AppHeaderProps = {
  uiMessage: string;
  onOpenMenu: () => void;
};

export function AppHeader({ uiMessage, onOpenMenu }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0">
            <button
              aria-label="Open navigation menu"
              className="rounded-md border p-2 hover:bg-slate-100"
              onClick={onOpenMenu}
              type="button"
            >
              <span className="flex h-5 w-5 flex-col justify-center gap-1">
                <span className="block h-0.5 w-5 bg-slate-700" />
                <span className="block h-0.5 w-5 bg-slate-700" />
                <span className="block h-0.5 w-5 bg-slate-700" />
              </span>
            </button>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Tempo</h1>
            <p className="hidden truncate text-sm text-slate-600 md:block">
            </p>
          </div>
        </div>
        <div className="max-w-md rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {uiMessage}
        </div>
      </div>
    </header>
  );
}
