// Represents the possible progress states for a task.
export type TaskStatus = "Not Started" | "In Progress" | "Completed";

// Defines the structure for a task in the Tempo scheduler.
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


// Defines a blocked time slot where tasks should not be scheduled.
export type BlockedTime = {
  id: number;
  date: string;
  startHour: number;
  durationMinutes: number;
  reason: string;
};

// Defines a goal and the tasks connected to that goal.
export type Goal = {
  id: number;
  title: string;
  taskIds: number[];
};

// Defines a reminder linked to a specific task.
export type Reminder = {
  id: number;
  taskId: number;
  minutesBefore: number;
};

// Represents the current state of a focus session.
export type SessionState = "idle" | "active" | "break";


// Represents the available navigation tabs in the Tempo app.
export type TempoTab =
  | "Dashboard"
  | "Active Tasks"
  | "Archive"
  | "Reminders"
  | "Goals"
  | "Focus"
  | "Export";
