import type { Task } from "@/components/tempo/types";

export type ScheduleConflictPair = { a: Task; b: Task };

function taskEndHour(task: Task): number {
  return task.startHour + task.durationMinutes / 60;
}

/** Finds overlapping pairs among non-archived tasks on the same calendar day (time-block conflict). */
export function findScheduleConflicts(tasks: Task[]): ScheduleConflictPair[] {
  const active = tasks.filter((t) => !t.archived);
  const byDate = new Map<string, Task[]>();
  for (const t of active) {
    const list = byDate.get(t.date) ?? [];
    list.push(t);
    byDate.set(t.date, list);
  }

  const pairs: ScheduleConflictPair[] = [];

  byDate.forEach((dayTasks) => {
    const sorted = [...dayTasks].sort((x, y) => x.startHour - y.startHour);
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        const aEnd = taskEndHour(a);
        const bEnd = taskEndHour(b);
        if (b.startHour < aEnd && a.startHour < bEnd) {
          pairs.push({ a, b });
        }
      }
    }
  });

  return pairs;
}
