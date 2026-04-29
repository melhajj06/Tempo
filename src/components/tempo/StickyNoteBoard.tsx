"use client";

import { useCallback, useRef } from "react";
import type { StickyNote } from "./types";

type DragState =
  | {
      id: number;
      grabOffsetX: number;
      grabOffsetY: number;
    }
  | null;

const NOTE_PX = 152;

/** Stable slight tilt per note id (pastel bulletin look). */
function rotationForId(id: number): number {
  const x = Math.sin(id * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return frac * 5 - 2.5;
}

type Props = {
  notes: StickyNote[];
  onUpdateNote: (
    id: number,
    patch: Partial<Pick<StickyNote, "x" | "y" | "text">>,
  ) => void;
  onAddNote: () => void;
  onRemoveNote: (id: number) => void;
  className?: string;
  /** Extra classes for the bulletin area (e.g. shorter height on Dashboard). */
  boardClassName?: string;
};

export function StickyNoteBoard({
  notes,
  onUpdateNote,
  onAddNote,
  onRemoveNote,
  className = "",
  boardClassName = "",
}: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState>(null);

  const clampPosition = useCallback((clientX: number, clientY: number, grabX: number, grabY: number) => {
    const el = boardRef.current;
    if (!el) return null;
    const br = el.getBoundingClientRect();
    const w = NOTE_PX / br.width;
    const h = NOTE_PX / br.height;
    let x = (clientX - br.left - grabX) / br.width;
    let y = (clientY - br.top - grabY) / br.height;
    x = Math.max(0, Math.min(1 - w, x));
    y = Math.max(0, Math.min(1 - h, y));
    return { x, y };
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !boardRef.current) return;
      const next = clampPosition(e.clientX, e.clientY, d.grabOffsetX, d.grabOffsetY);
      if (next) onUpdateNote(d.id, next);
    },
    [clampPosition, onUpdateNote],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);
  }, [handlePointerMove]);

  const startDrag = (
    e: React.PointerEvent,
    note: StickyNote,
  ) => {
    e.preventDefault();
    const board = boardRef.current;
    if (!board) return;
    const br = board.getBoundingClientRect();
    const leftPx = note.x * br.width;
    const topPx = note.y * br.height;
    dragRef.current = {
      id: note.id,
      grabOffsetX: e.clientX - br.left - leftPx,
      grabOffsetY: e.clientY - br.top - topPx,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          className="rounded-lg bg-[var(--tempo-ink)] px-3 py-1.5 text-sm font-medium text-[var(--tempo-surface)]"
          onClick={onAddNote}
          type="button"
        >
          Add note
        </button>
      </div>
      <div
        aria-label="Sticky note board"
        className={`relative isolate min-h-[min(420px,calc(100vh-12rem))] w-full overflow-hidden rounded-xl border-2 border-dashed border-[#d9d0bc] bg-[#f7f4ed] shadow-inner dark:border-neutral-700 dark:bg-neutral-900/60 ${boardClassName}`}
        ref={boardRef}
      >
        {notes.map((note) => (
          <div
            className="absolute flex flex-col cursor-grab rounded-sm border border-[#e8e4c8] p-3 shadow-[3px_3px_10px_rgba(0,0,0,0.12)] select-none hover:z-10 active:cursor-grabbing dark:border-yellow-900/40"
            key={note.id}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest("textarea,button")) return;
              startDrag(e, note);
            }}
            role="presentation"
            style={{
              width: NOTE_PX,
              height: NOTE_PX,
              left: `${note.x * 100}%`,
              top: `${note.y * 100}%`,
              transform: `rotate(${rotationForId(note.id)}deg)`,
              background: "linear-gradient(145deg, #fffdf0 0%, #fff3b0 45%, #ffec85 100%)",
            }}
          >
            <div className="mb-1 flex shrink-0 items-start justify-between gap-1">
              <span className="pointer-events-none text-[10px] font-semibold uppercase tracking-wide text-yellow-950/55">
                Note
              </span>
              <button
                className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-lg leading-none text-yellow-950/55 hover:bg-black/10 hover:text-yellow-950"
                onClick={() => onRemoveNote(note.id)}
                type="button"
              >
                ×
              </button>
            </div>
            <textarea
              className="min-h-0 w-full flex-1 resize-none border-0 bg-transparent p-0 text-[13px] leading-snug text-yellow-950/90 caret-yellow-950 placeholder:text-yellow-950/35 focus:outline-none focus:ring-0 cursor-text"
              onChange={(e) => onUpdateNote(note.id, { text: e.target.value })}
              placeholder="Jot something…"
              spellCheck
              value={note.text}
            />
          </div>
        ))}
        {notes.length === 0 && (
          <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-neutral-500">
            No notes yet. Use &ldquo;Add note&rdquo; or open this tab later—your desk is clear.
          </p>
        )}
      </div>
    </div>
  );
}
