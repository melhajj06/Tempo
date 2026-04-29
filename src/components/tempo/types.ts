// Represents the possible progress states for a task.
export type TaskStatus = "Not Started" | "In Progress" | "Completed";

/** Subjective importance (1 = lowest, 5 = highest) used by the dynamic weighting engine. */
export type SubjectivePriority = 1 | 2 | 3 | 4 | 5;

// Defines the structure for a task in the Tempo scheduler.
export type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  /** Calendar day this block is scheduled on. */
  date: string;
  startHour: number;
  durationMinutes: number;
  /** Due date (YYYY-MM-DD); drives deadline proximity in weighting. */
  deadline: string;
  subjectivePriority: SubjectivePriority;
  status: TaskStatus;
  archived: boolean;
  archivedAt: string | null;
  archiveReason: string | null;
};


// Defines a blocked time slot where tasks should not be scheduled.
export type BlockedTime = {
  id: number;
  date: string;
  startHour: number;
  durationMinutes: number;
  reason: string;
};

/** Paste yellow sticky-square note on the board; x/y are 0–1 inside the bulletin area. */
export type StickyNote = {
  id: number;
  text: string;
  x: number;
  y: number;
};

// Defines a reminder linked to a specific task.
export type Reminder = {
  id: number;
  taskId: number;
  minutesBefore: number;
};

// Represents the available navigation tabs in the Tempo app.
export type TempoTab =
  | "Dashboard"
  | "Active Tasks"
  | "Archive"
  | "Reminders"
  | "Sticky Notes"
  | "Focus"
  | "Export";
