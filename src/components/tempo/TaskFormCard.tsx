"use client";

import { FormEvent, useEffect, useState } from "react";
import type { SubjectivePriority, Task } from "./types";

export type TaskFormPayload = {
  title: string;
  description: string;
  category: string;
  date: string;
  startHour: number;
  durationMinutes: number;
  deadline: string;
  subjectivePriority: SubjectivePriority;
  status: Task["status"];
};

type TaskFormCardProps = {
  onCreate: (task: TaskFormPayload) => void;
  onUpdate?: (taskId: number, task: TaskFormPayload) => void;
  /** When set, the form edits this task instead of creating a new one. */
  editingTask?: Task | null;
  onDiscardEdit?: () => void;
  defaultScheduledDate?: string;
};

const emptyDefaults = (scheduled: string): TaskFormPayload => ({
  title: "",
  description: "",
  category: "General",
  date: scheduled,
  startHour: 9,
  durationMinutes: 60,
  deadline: scheduled,
  subjectivePriority: 3,
  status: "Not Started",
});

function taskToPayload(t: Task): TaskFormPayload {
  return {
    title: t.title,
    description: t.description,
    category: t.category,
    date: t.date,
    startHour: t.startHour,
    durationMinutes: t.durationMinutes,
    deadline: t.deadline,
    subjectivePriority: t.subjectivePriority,
    status: t.status,
  };
}

/** Notion-style card for creating and editing tasks, deadline + duration + priority feed the dynamic weighting engine. */
export function TaskFormCard({
  onCreate,
  onUpdate,
  editingTask,
  onDiscardEdit,
  defaultScheduledDate,
}: TaskFormCardProps) {
  const scheduled = defaultScheduledDate ?? new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<TaskFormPayload>(() => emptyDefaults(scheduled));

  useEffect(() => {
    if (editingTask) {
      setForm(taskToPayload(editingTask));
    } else {
      setForm(emptyDefaults(scheduled));
    }
  }, [editingTask, scheduled]);

  const isEdit = Boolean(editingTask);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload: TaskFormPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "General",
      date: form.date,
      startHour: form.startHour,
      durationMinutes: form.durationMinutes,
      deadline: form.deadline,
      subjectivePriority: form.subjectivePriority,
      status: form.status,
    };
    if (isEdit && editingTask && onUpdate) {
      onUpdate(editingTask.id, payload);
      onDiscardEdit?.();
      return;
    }
    onCreate(payload);
    setForm(emptyDefaults(scheduled));
  };

  return (
    <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--tempo-ink)]">
          {isEdit ? "Edit task" : "New task"}
        </h2>
        {isEdit && (
          <button
            className="text-xs text-[var(--tempo-muted-foreground)] underline-offset-4 hover:underline"
            onClick={() => {
              onDiscardEdit?.();
              setForm(emptyDefaults(scheduled));
            }}
            type="button"
          >
            Cancel edit
          </button>
        )}
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none placeholder:text-[var(--tempo-muted-foreground)] focus:ring-2 focus:ring-[var(--tempo-ring)]"
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title"
          required
          value={form.title}
        />
        <textarea
          className="min-h-[72px] w-full resize-none rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none placeholder:text-[var(--tempo-muted-foreground)] focus:ring-2 focus:ring-[var(--tempo-ring)]"
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Notes (optional)"
          value={form.description}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Category
            <input
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              value={form.category}
            />
          </label>
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Priority (weighting)
            <select
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              onChange={(e) =>
                setForm((f) => ({ ...f, subjectivePriority: Number(e.target.value) as SubjectivePriority }))
              }
              value={form.subjectivePriority}
            >
              <option value={1}>1, Lowest</option>
              <option value={2}>2, Low</option>
              <option value={3}>3, Medium</option>
              <option value={4}>4, High</option>
              <option value={5}>5, Critical</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Scheduled day
            <input
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              type="date"
              value={form.date}
            />
          </label>
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Deadline
            <input
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              type="date"
              value={form.deadline}
            />
          </label>
        </div>
        <label className="block text-xs font-medium text-[var(--tempo-muted-foreground)]">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Task["status"] }))}
            value={form.status}
          >
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Start time
            <input
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              max={23}
              min={0}
              onChange={(e) => setForm((f) => ({ ...f, startHour: Number(e.target.value) }))}
              type="number"
              value={form.startHour}
            />
          </label>
          <label className="text-xs font-medium text-[var(--tempo-muted-foreground)]">
            Est. duration (minutes)
            <input
              className="mt-1 w-full rounded-lg border border-[var(--tempo-border)] bg-[var(--tempo-muted)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--tempo-ring)]"
              min={15}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              step={5}
              type="number"
              value={form.durationMinutes}
            />
          </label>
        </div>
        <button
          className="w-full rounded-lg bg-[var(--tempo-ink)] px-3 py-2.5 text-sm font-medium text-[var(--tempo-surface)] transition hover:opacity-90"
          type="submit"
        >
          {isEdit ? "Save changes" : "Add task"}
        </button>
      </form>
    </div>
  );
}
