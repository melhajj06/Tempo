export type TaskStatus = "Not Started" | "In Progress" | "Completed";

export type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string;
  startHour: number;
  durationMinutes: number;
  status: TaskStatus;
  archived: boolean;
  archivedAt: string | null;
  archiveReason: string | null;
};

export type Goal = {
  id: number;
  title: string;
  taskIds: number[];
};

export type Reminder = {
  id: number;
  taskId: number;
  minutesBefore: number;
};

export type SessionState = "idle" | "active" | "break";

export type TempoTab =
  | "Dashboard"
  | "Active Tasks"
  | "Archive"
  | "Reminders"
  | "Goals"
  | "Focus"
  | "Export";
