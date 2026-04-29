"use client";

import { useCallback, useEffect, useState } from "react";
import { categoryBlockClasses } from "./constants";
import type { Task } from "./types";

type TimerPhase = "idle" | "work" | "break";

type Preset = { label: string; workSeconds: number; breakSeconds: number };

const PRESETS: Preset[] = [
  { label: "25 / 5", workSeconds: 25 * 60, breakSeconds: 5 * 60 },
  { label: "50 / 10", workSeconds: 50 * 60, breakSeconds: 10 * 60 },
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
 * Full-screen black distraction-free surface: task context + Pomodoro timer front and center.
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
      aria-labelledby="deep-focus-title"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-black text-zinc-100"
      role="dialog"
    >
      <div className="flex shrink-0 items-center justify-end px-4 py-4 sm:px-6">
        <button
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
          onClick={onClose}
          type="button"
        >
          Exit Esc
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-20 pt-6 sm:px-8">
        <span
          className={`mb-6 inline-flex rounded-full border border-zinc-600 px-4 py-1.5 text-xs font-medium ${categoryBlockClasses(task.category)}`}
        >
          {task.category}
        </span>
        <h1
          id="deep-focus-title"
          className="max-w-2xl text-center text-xl font-semibold tracking-tight text-zinc-300 sm:text-2xl md:text-3xl"
        >
          {task.title}
        </h1>
        {task.description ? (
          <p className="mt-5 max-w-xl text-center text-sm leading-relaxed text-zinc-500 sm:text-base">{task.description}</p>
        ) : null}

        <div className="mt-16 sm:mt-20">
          <p className="mb-10 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Timer</p>
          <div className="text-center font-mono text-[4.5rem] leading-none tabular-nums tracking-tight text-white sm:text-8xl md:text-9xl">
            {phase === "idle" ? (
              <span className="text-zinc-600">--:--</span>
            ) : (
              <span className={phase === "break" ? "text-emerald-400" : undefined}>{fmt(secondsLeft)}</span>
            )}
          </div>
        </div>

        <div className="mt-14 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">
          <p className="mb-4 text-center text-xs uppercase tracking-wide text-zinc-500">Presets</p>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`rounded-lg border px-4 py-2.5 text-sm transition ${
                  activePreset?.label === p.label
                    ? "border-zinc-100 bg-zinc-900 text-zinc-100"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900"
                }`}
                onClick={() => pickPreset(p)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="mb-6 min-h-[1.25rem] text-center text-sm text-zinc-500">
            {phase === "idle" && "Choose a preset, then start."}
            {phase === "work" && "Stay on this task."}
            {phase === "break" && "Break. Step away when ready."}
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-black disabled:opacity-40"
              disabled={!activePreset || phase !== "idle"}
              onClick={startWork}
              type="button"
            >
              Start
            </button>
            <button
              className="rounded-lg border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 disabled:opacity-40"
              disabled={phase !== "work" || !activePreset}
              onClick={skipToBreak}
              type="button"
            >
              Skip to break
            </button>
            <button
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900"
              onClick={endSession}
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
