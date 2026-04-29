import { Goal, Task, TempoTab } from "./types";

// Defines the main navigation tabs used throughout the Tempo dashboard.
export const tempoTabs: TempoTab[] = [
  "Dashboard",
  "Active Tasks",
  "Archive",
  "Reminders",
  "Goals",
  "Focus",
  "Export",
];

// Provides starter task data for the app before any user-created tasks are added.
export const initialTasks: Task[] = [
  {
    id: 1,
    title: "OS Project Design Milestone",
    category: "CS4284",
    description: "Finalize diagrams and report draft",
    date: "2026-04-27",
    startHour: 20,
    durationMinutes: 90,
    status: "In Progress",
    archived: false,
    archivedAt: null,
    archiveReason: null,
  },
  {
    id: 2,
    title: "Database Homework",
    category: "CS3114",
    description: "Complete query optimization section",
    date: "2026-04-27",
    startHour: 9,
    durationMinutes: 60,
    status: "Not Started",
    archived: false,
    archivedAt: null,
    archiveReason: null,
  },
  {
    id: 3,
    title: "Old Physics Notes Review",
    category: "PHYS",
    description: "Review exam notes",
    date: "2026-04-10",
    startHour: 18,
    durationMinutes: 45,
    status: "Completed",
    archived: true,
    archivedAt: "2026-04-15T10:00:00.000Z",
    archiveReason: "Completed",
  },
  {
    id: 4,
    title: "SQL Lab 9",
    category: "CS3114",
    description: "Finish indexing section",
    date: "2026-04-12",
    startHour: 15,
    durationMinutes: 50,
    status: "Completed",
    archived: true,
    archivedAt: "2026-04-20T12:00:00.000Z",
    archiveReason: "No longer relevant",
  },
];

// Provides starter goal data and links each goal to related task IDs.
export const initialGoals: Goal[] = [
  { id: 1, title: "Graduate Strong", taskIds: [1, 2, 4] },
  { id: 2, title: "Finish Senior Project", taskIds: [1] },
];