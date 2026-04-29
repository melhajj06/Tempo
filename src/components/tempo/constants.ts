import { StickyNote, Task, TempoTab } from "./types";

/** Tailwind class sets for agenda blocks by course/category (pastel red / blue / green / yellow). */
export function categoryBlockClasses(category: string): string {
  const c = category.toUpperCase();
  if (c.includes("4284") || c.includes("OS"))
    return "bg-[#ffd6d6] border-[#f5a8a8] text-[#5c2020]";
  if (c.includes("3114") || c.includes("DATA") || c.includes("SQL"))
    return "bg-[#cfe8ff] border-[#9dc4f0] text-[#143a5c]";
  if (c.includes("PHYS")) return "bg-[#d4f4dd] border-[#9dd4ae] text-[#1e4d2b]";
  return "bg-[#fff3c4] border-[#e8d58a] text-[#5c4a14]";
}

// Defines the main navigation tabs used throughout the Tempo dashboard.
export const tempoTabs: TempoTab[] = [
  "Dashboard",
  "Active Tasks",
  "Archive",
  "Reminders",
  "Sticky Notes",
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
    deadline: "2026-04-29",
    subjectivePriority: 5,
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
    deadline: "2026-04-28",
    subjectivePriority: 4,
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
    deadline: "2026-04-10",
    subjectivePriority: 2,
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
    deadline: "2026-04-12",
    subjectivePriority: 3,
    status: "Completed",
    archived: true,
    archivedAt: "2026-04-20T12:00:00.000Z",
    archiveReason: "No longer relevant",
  },
];

export const initialStickyNotes: StickyNote[] = [
  { id: 1, text: "Ship the demo", x: 0.06, y: 0.1 },
  { id: 2, text: "Call advisor — Friday", x: 0.48, y: 0.14 },
];