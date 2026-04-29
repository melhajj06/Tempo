import type { BlockedTime, Goal, Reminder, Task } from "@/components/tempo/types";

import type { ScheduleConflictPair } from "./scheduleConflicts";
import { computeWeightScore } from "./weightingEngine";

const DESC_CLIP = 500;
const MAX_ARCHIVE_ENTRIES = 100;
/** Hard cap, keeps request bodies safe; Gemini Flash still gets the bulk of realistic student data. */
const MAX_CHARS = 95_000;

function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function endHour(task: Task): number {
  return task.startHour + task.durationMinutes / 60;
}

function sortCalendar(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
}

/**
 * Rich plaintext snapshot for TempoAI: full active schedule, deadlines, blocks, reminders, goals,
 * conflicts, archived history, plus calendar framing so the model can answer deadline questions accurately.
 */
export function serializeTempoAiContext(params: {
  nowDate: string;
  weekStartDate: string;
  calendarViewType: string;
  activeTasks: Task[];
  archivedTasks: Task[];
  rankedTasks: Task[];
  blockedTimes: BlockedTime[];
  reminders: Reminder[];
  goals: Goal[];
  allTasksForLookup: Task[];
  scheduleConflicts: ScheduleConflictPair[];
}): string {
  const ref = new Date(`${params.nowDate}T12:00:00`);
  const chronological = sortCalendar(params.activeTasks);
  const byId = new Map(params.allTasksForLookup.map((t) => [t.id, t]));

  let out = "";
  out += "=== TEMPO APP DATA (AUTHORITATIVE; USER'S OWN STATE) ===\n\n";
  out += `REFERENCE "TODAY": ${params.nowDate}\n`;
  out += `VISIBLE WEEK STARTS (calendar column 0 date): ${params.weekStartDate}\n`;
  out += `CALENDAR VIEW IN UI (daily / weekly / monthly scope): ${params.calendarViewType}\n`;
  out += `\n`;

  out += "--- ACTIVE TASKS, TIME BLOCKS ON CALENDAR AND DEADLINES ---\n";
  out +=
    'Each row is something on the calendar. "Scheduled day" is when the block sits; "deadline" is due date.\n';
  if (chronological.length === 0) {
    out += "(none)\n";
  } else {
    chronological.forEach((task) => {
      const score = computeWeightScore(task, ref);
      out += `\n[id ${task.id}] ${task.title}\n`;
      out += `  category: ${task.category}\n`;
      out += `  description: ${clip(task.description, DESC_CLIP).replace(/\n/g, " ")}\n`;
      out += `  scheduled_calendar_day: ${task.date}; block_start_hour=${task.startHour}; duration_minutes=${task.durationMinutes}; approximate_end_hour=${endHour(task).toFixed(2)}\n`;
      out += `  deadline_date: ${task.deadline}\n`;
      out += `  subjective_priority_1_to_5: ${task.subjectivePriority}; dynamic_weight_score: ${score.toFixed(2)}\n`;
      out += `  status: ${task.status}\n`;
    });
  }
  out += "\n";

  out += "--- WEIGHTED PRIORITY ORDER (FOR WHAT TO DO FIRST algorithmically) ---\n";
  if (params.rankedTasks.length === 0) {
    out += "(none)\n\n";
  } else {
    params.rankedTasks.forEach((task, idx) => {
      const score = computeWeightScore(task, ref);
      out += `${idx + 1}. [id ${task.id}] ${task.title}, score ${score.toFixed(2)}, deadline ${task.deadline}\n`;
    });
    out += "\n";
  }

  out += "--- SCHEDULE CONFLICTS (OVERLAPPING ACTIVE BLOCKS SAME DAY) ---\n";
  if (params.scheduleConflicts.length === 0) {
    out += "None detected.\n\n";
  } else {
    params.scheduleConflicts.forEach(({ a, b }) => {
      out += `- On ${a.date}: "${a.title}" (id ${a.id}) overlaps "${b.title}" (id ${b.id})\n`;
    });
    out += "\n";
  }

  out += "--- BLOCKED TIME ON CALENDAR (USER-MARKED UNAVAILABLE; NOT TASKS) ---\n";
  if (params.blockedTimes.length === 0) {
    out += "None.\n\n";
  } else {
    [...params.blockedTimes]
      .sort((x, y) => x.date.localeCompare(y.date) || x.startHour - y.startHour)
      .forEach((b) => {
        out += `- ${b.date} from hour ${b.startHour} (${b.durationMinutes} min total), reason: ${b.reason}\n`;
      });
    out += "\n";
  }

  out += "--- SCHEDULED REMINDERS ---\n";
  if (params.reminders.length === 0) {
    out += "None.\n\n";
  } else {
    params.reminders.forEach((r) => {
      const linked = byId.get(r.taskId);
      out += `- ${r.minutesBefore} minutes before "${linked?.title ?? `task id ${r.taskId}`}" (task id ${r.taskId})\n`;
    });
    out += "\n";
  }

  out += "--- GOALS (LINKED TASK IDS REFERENCE THE BLOCKS ABOVE) ---\n";
  if (params.goals.length === 0) {
    out += "None.\n\n";
  } else {
    params.goals.forEach((g) => {
      const titles = g.taskIds
        .map((tid) => {
          const t = byId.get(tid);
          return t ? `"${t.title}" (${tid}, ${t.status})` : `(missing id ${tid})`;
        })
        .join("; ");
      out += `- ${g.title} (goal id ${g.id}): linked tasks → ${titles}\n`;
    });
    out += "\n";
  }

  out += "--- ARCHIVED TASKS (HISTORY, NOT ON ACTIVE CALENDAR) ---\n";
  const archived = [...params.archivedTasks]
    .sort((a, b) => {
      const at = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const bt = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      return bt - at;
    })
    .slice(0, MAX_ARCHIVE_ENTRIES);

  if (archived.length === 0) {
    out += "None archived.\n";
  } else {
    archived.forEach((task) => {
      out += `- [id ${task.id}] ${task.title} | last scheduled ${task.date} | deadline was ${task.deadline} | ${task.status}`;
      out += task.archivedAt ? ` | archived ${task.archivedAt}` : "";
      out += task.archiveReason ? ` | reason: ${task.archiveReason}` : "";
      out += "\n";
    });
  }

  const combined = out.trimEnd();
  if (combined.length <= MAX_CHARS) return combined;
  return `${combined.slice(0, MAX_CHARS - 20)}\n\n[CONTEXT TRUNCATED]`;
}
