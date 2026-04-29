import type { Task } from "@/components/tempo/types";

/** Hours from reference moment to end of deadline day (inclusive urgency). */
function hoursUntilEndOfDeadlineDay(deadline: string, ref: Date): number {
  const end = new Date(`${deadline}T23:59:59`);
  return Math.max((end.getTime() - ref.getTime()) / 3_600_000, 1 / 24);
}

/** Urgency 0–100 from deadline proximity (closer → higher). */
function urgencyNormalized(deadline: string, ref: Date): number {
  const days = hoursUntilEndOfDeadlineDay(deadline, ref) / 24;
  return Math.min(100, (1 / Math.max(days, 1 / 24)) * 12);
}

/** User importance scaled to 0–100 (priority 1..5 → 20..100). */
function importanceNormalized(subjectivePriority: Task["subjectivePriority"]): number {
  return subjectivePriority * 20;
}

/**
 * Computes a dynamic priority score for scheduling: balances deadline proximity with subjective importance.
 * Higher scores should be addressed first when planning blocks.
 */
export function computeWeightScore(task: Task, referenceDate: Date = new Date()): number {
  const u = urgencyNormalized(task.deadline, referenceDate);
  const i = importanceNormalized(task.subjectivePriority);
  return 0.55 * u + 0.45 * i;
}

/** Active tasks only, ranked by weight (desc). */
export function rankTasksByWeight(tasks: Task[], referenceDate?: Date): Task[] {
  const ref = referenceDate ?? new Date();
  const active = tasks.filter((t) => !t.archived);
  return [...active].sort((a, b) => computeWeightScore(b, ref) - computeWeightScore(a, ref));
}
