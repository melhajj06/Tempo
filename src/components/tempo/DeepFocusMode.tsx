"use client";

import { useCallback, useEffect, useState } from "react";
import { categoryBlockClasses } from "./constants";
import type { Task } from "./types";

type TimerPhase = "idle" | "work" | "break";

type Preset = { label: string; workSeconds: number; breakSeconds: number };

const PRESETS: Preset[] = [
  { label: "Pomodoro 25 / 5", workSeconds: 25 * 60, breakSeconds: 5 * 60 },
  { label: "Long focus 50 / 10", workSeconds: 50 * 60, breakSeconds: 10 * 60 },
];

function fmt(mmss: number): string {
  const m = Math.floor(mmss / 60);
  const s = mmss % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type DeepFocusModeProps = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
};

/**
 * Distraction-free full-screen surface: single task context + smart Pomodoro with automated break handoff.
 */
export function DeepFocusMode({ open, task, onClose }: DeepFocusModeProps) {
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);

  const resetLocal = useCallback(() => {
    setPhase("idle");
    setSecondsLeft(0);
    setActivePreset(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetLocal();
    }
  }, [open, resetLocal]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (phase !== "work" && phase !== "break") return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (secondsLeft !== 0) return;
    if (phase === "work" && activePreset) {
      setPhase("break");
      setSecondsLeft(activePreset.breakSeconds);
      return;
    }
    if (phase === "break") {
      setPhase("idle");
    }
  }, [secondsLeft, phase, activePreset]);

  const pickPreset = (p: Preset) => {
    setActivePreset(p);
    setPhase("idle");
    setSecondsLeft(0);
  };

  const startWork = () => {
    if (!activePreset) return;
    setPhase("work");
    setSecondsLeft(activePreset.workSeconds);
  };

  const skipToBreak = () => {
    if (!activePreset || phase !== "work") return;
    setPhase("break");
    setSecondsLeft(activePreset.breakSeconds);
  };

  const endSession = () => {
    resetLocal();
  };

  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-[var(--tempo-canvas)] text-[var(--tempo-ink)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deep-focus-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--tempo-border)] px-6 py-4">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--tempo-muted-foreground)]">
          Deep focus
        </p>
        <button
          className="rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-surface)] px-3 py-1.5 text-sm hover:bg-[var(--tempo-muted)]"
          onClick={onClose}
          type="button"
        >
          Exit (Esc)
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-10">
        <span
          className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${categoryBlockClasses(task.category)}`}
        >
          {task.category}
        </span>
        <h1 id="deep-focus-title" className="max-w-2xl text-center text-3xl font-semibold tracking-tight md:text-4xl">
          {task.title}
        </h1>
        {task.description ? (
          <p className="mt-4 max-w-xl text-center text-base leading-relaxed text-[var(--tempo-muted-foreground)]">
            {task.description}
          </p>
        ) : null}

        <div className="mt-12 w-full max-w-md rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-6 shadow-sm">
          <p className="mb-3 text-center text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Smart Pomodoro
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`rounded-lg border px-3 py-2 text-xs ${
                  activePreset?.label === p.label
                    ? "border-[var(--tempo-ink)] bg-[var(--tempo-muted)]"
                    : "border-[var(--tempo-border)] hover:bg-[var(--tempo-muted)]"
                }`}
                onClick={() => pickPreset(p)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mb-6 text-center font-mono text-5xl tabular-nums tracking-tight md:text-6xl">
            {phase === "idle" ? (
              <span className="text-[var(--tempo-muted-foreground)]">--:--</span>
            ) : (
              <span className={phase === "break" ? "text-emerald-700" : undefined}>{fmt(secondsLeft)}</span>
            )}
          </div>

          <p className="mb-4 text-center text-sm text-[var(--tempo-muted-foreground)]">
            {phase === "idle" && "Choose a preset, then start focus."}
            {phase === "work" && "Focus on this task only."}
            {phase === "break" && "Break, step away, then start another focus round when ready."}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="rounded-lg bg-[var(--tempo-ink)] px-4 py-2 text-sm font-medium text-[var(--tempo-surface)] disabled:opacity-40"
              disabled={!activePreset || phase !== "idle"}
              onClick={startWork}
              type="button"
            >
              Start focus
            </button>
            <button
              className="rounded-lg border border-[var(--tempo-border)] px-4 py-2 text-sm hover:bg-[var(--tempo-muted)] disabled:opacity-40"
              disabled={phase !== "work" || !activePreset}
              onClick={skipToBreak}
              type="button"
            >
              Skip to break
            </button>
            <button
              className="rounded-lg border border-[var(--tempo-border)] px-4 py-2 text-sm hover:bg-[var(--tempo-muted)]"
              onClick={endSession}
              type="button"
            >
              Reset timer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
