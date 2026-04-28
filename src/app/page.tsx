"use client";

import { FormEvent, useMemo, useState } from "react";

type TaskStatus = "Not Started" | "In Progress" | "Completed";

type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  date: string;
  startHour: number;
  durationMinutes: number;
  status: TaskStatus;
  archived: boolean;
};

type Goal = {
  id: number;
  title: string;
  taskIds: number[];
};

type Reminder = {
  id: number;
  taskId: number;
  minutesBefore: number;
};

type SessionState = "idle" | "active" | "break";
type TempoTab = "Dashboard" | "Active Tasks" | "Archive" | "Reminders" | "Goals" | "Focus" | "Export";

const initialTasks: Task[] = [
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
  },
];

const initialGoals: Goal[] = [
  { id: 1, title: "Graduate Strong", taskIds: [1, 2, 4] },
  { id: 2, title: "Finish Senior Project", taskIds: [1] },
];

export default function TempoDashboard() {
  const [loggedIn] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveCategory, setArchiveCategory] = useState("All");
  const [archiveDateFrom, setArchiveDateFrom] = useState("");
  const [archiveDateTo, setArchiveDateTo] = useState("");
  const [archiveError, setArchiveError] = useState("");
  const [agendaFrom, setAgendaFrom] = useState("2026-04-27");
  const [agendaTo, setAgendaTo] = useState("2026-05-02");
  const [agendaError, setAgendaError] = useState("");
  const [selectedTaskForReminder, setSelectedTaskForReminder] = useState(1);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [reminderError, setReminderError] = useState("");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [goalTaskSelection, setGoalTaskSelection] = useState<number[]>([]);
  const [goalError, setGoalError] = useState("");
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionError, setSessionError] = useState("");
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [focusTaskId, setFocusTaskId] = useState<number>(1);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [activeTab, setActiveTab] = useState<TempoTab>("Dashboard");
  const [uiMessage, setUiMessage] = useState("Welcome back. Core Tempo features are active.");

  const nowDate = "2026-04-27";
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter((task) => task.archived), [tasks]);

  const activeTaskResults = useMemo(() => {
    return activeTasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(activeQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(activeQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || task.status === activeFilter;
      return matchesQuery && matchesFilter;
    });
  }, [activeTasks, activeFilter, activeQuery]);

  const archiveResults = useMemo(() => {
    const from = archiveDateFrom ? new Date(archiveDateFrom).getTime() : undefined;
    const to = archiveDateTo ? new Date(archiveDateTo).getTime() : undefined;
    return archivedTasks.filter((task) => {
      const taskDate = new Date(task.date).getTime();
      const matchesQuery =
        task.title.toLowerCase().includes(archiveQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(archiveQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(archiveQuery.toLowerCase());
      const matchesCategory = archiveCategory === "All" || task.category === archiveCategory;
      const matchesFrom = from === undefined || taskDate >= from;
      const matchesTo = to === undefined || taskDate <= to;
      return matchesQuery && matchesCategory && matchesFrom && matchesTo;
    });
  }, [archivedTasks, archiveQuery, archiveCategory, archiveDateFrom, archiveDateTo]);

  const focusConflict = useMemo(() => {
    const selected = tasks.find((task) => task.id === focusTaskId);
    if (!selected) {
      return null;
    }
    return activeTasks.find(
      (task) =>
        task.id !== selected.id &&
        task.date === selected.date &&
        task.startHour <= selected.startHour &&
        task.startHour + task.durationMinutes / 60 > selected.startHour,
    );
  }, [activeTasks, focusTaskId, tasks]);

  const goalProgress = useMemo(() => {
    return goals.map((goal) => {
      const linked = tasks.filter((task) => goal.taskIds.includes(task.id));
      const done = linked.filter((task) => task.status === "Completed").length;
      const percentage = linked.length === 0 ? 0 : Math.round((done / linked.length) * 100);
      return { goal, percentage };
    });
  }, [goals, tasks]);

  const todayItems = useMemo(() => {
    return activeTasks
      .filter((task) => task.date === nowDate)
      .sort((a, b) => a.startHour - b.startHour);
  }, [activeTasks]);

  const toggleTaskStatus = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const next: TaskStatus =
          task.status === "Not Started"
            ? "In Progress"
            : task.status === "In Progress"
              ? "Completed"
              : "Not Started";
        return { ...task, status: next };
      }),
    );
    setUiMessage("Task status updated and synced immediately.");
  };

  const createReminder = () => {
    setReminderError("");
    if (reminderMinutes <= 0) {
      setReminderError("Reminder time must be a positive number of minutes.");
      return;
    }
    if (reminderMinutes > 1440) {
      setReminderError("Reminder must be within 24 hours.");
      return;
    }
    const entry: Reminder = {
      id: Date.now(),
      taskId: selectedTaskForReminder,
      minutesBefore: reminderMinutes,
    };
    setReminders((prev) => [...prev, entry]);
    setUiMessage("Reminder scheduled successfully.");
  };

  const createGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGoalError("");
    if (!newGoalTitle.trim()) {
      setGoalError("Goal title is required.");
      return;
    }
    if (goalTaskSelection.length === 0) {
      setGoalError("Associate at least one task to track progress.");
      return;
    }
    const goal: Goal = {
      id: Date.now(),
      title: newGoalTitle.trim(),
      taskIds: goalTaskSelection,
    };
    setGoals((prev) => [...prev, goal]);
    setNewGoalTitle("");
    setGoalTaskSelection([]);
    setUiMessage("Goal created and linked to selected tasks.");
  };

  const exportAgenda = () => {
    setAgendaError("");
    if (!agendaFrom || !agendaTo || new Date(agendaFrom) > new Date(agendaTo)) {
      setAgendaError("Please select a valid date range.");
      return;
    }
    const payload = tasks
      .filter((task) => task.date >= agendaFrom && task.date <= agendaTo)
      .map(
        (task) =>
          `${task.date},${task.title},${task.category},${task.status},${task.durationMinutes} min`,
      )
      .join("\n");
    if (!payload) {
      setAgendaError("No tasks exist in that date range.");
      return;
    }
    const csvHeader = "Date,Title,Category,Status,Duration\n";
    const blob = new Blob([csvHeader + payload], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tempo-agenda-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setUiMessage("Agenda exported successfully.");
  };

  const validateArchiveFilters = () => {
    setArchiveError("");
    if (archiveDateFrom && archiveDateTo && new Date(archiveDateFrom) > new Date(archiveDateTo)) {
      setArchiveError("Invalid date range. Start date must be before end date.");
      return;
    }
    setUiMessage("Archive filter applied.");
  };

  const startFocusSession = () => {
    setSessionError("");
    if (sessionDuration < 10 || sessionDuration > 240) {
      setSessionError("Duration must be between 10 and 240 minutes.");
      return;
    }
    if (focusConflict) {
      setSessionError(
        `Conflict found with ${focusConflict.title}. Adjust time, proceed anyway, or cancel.`,
      );
      return;
    }
    setSessionState("active");
    setUiMessage("Focus session started.");
  };

  const startBreak = () => {
    if (sessionState !== "active") {
      return;
    }
    setSessionState("break");
    setUiMessage("Break started. Focus timer paused.");
  };

  const resumeFocus = () => {
    if (sessionState !== "break") {
      return;
    }
    if (breakMinutes > 30) {
      setSessionError("Break extension exceeds current limit.");
      return;
    }
    setSessionState("active");
    setUiMessage("Break logged and focus resumed.");
  };

  const stopFocus = () => {
    setSessionState("idle");
    setUiMessage("Focus session ended and saved.");
  };

  if (!loggedIn) {
    return <main className="p-8">Please log in to continue.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-black md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border bg-white p-5 shadow-sm">
          <h1 className="text-3xl font-semibold">Tempo Functional MVP</h1>
          <p className="mt-2 text-sm text-slate-700">
            Implemented use-case flows for tasks, archive retrieval, reminders, goals, focus mode,
            conflict handling, break management, and agenda export.
          </p>
          <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm">{uiMessage}</p>
        </header>

        <nav className="rounded-2xl border bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(
              [
                "Dashboard",
                "Active Tasks",
                "Archive",
                "Reminders",
                "Goals",
                "Focus",
                "Export",
              ] as TempoTab[]
            ).map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-3 py-2 text-sm ${
                  activeTab === tab ? "bg-slate-900 text-white" : "border hover:bg-slate-100"
                }`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {activeTab === "Dashboard" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Daily Dashboard (Today)</h2>
              <div className="space-y-2">
                {todayItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm">
                    No tasks or sessions scheduled today. Enjoy your free time or get ahead.
                  </div>
                ) : (
                  todayItems.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-12 items-center gap-2 rounded-lg border p-3 text-sm"
                    >
                      <div className="col-span-2 font-medium">{task.startHour}:00</div>
                      <div className="col-span-4">{task.title}</div>
                      <div className="col-span-2">{task.category}</div>
                      <div className="col-span-2">{task.status}</div>
                      <button
                        className="col-span-2 rounded-md border px-2 py-1 hover:bg-slate-100"
                        onClick={() => toggleTaskStatus(task.id)}
                        type="button"
                      >
                        Cycle Status
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">Goals</h2>
              <div className="space-y-3">
                {goalProgress.map(({ goal, percentage }) => (
                  <div key={goal.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{goal.title}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-200">
                      <div className="h-2 rounded bg-slate-800" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Active Tasks" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Search and Filter Active Tasks</h2>
              <div className="mb-3 grid gap-2 md:grid-cols-2">
                <input
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setActiveQuery(event.target.value)}
                  placeholder="Search title or description..."
                  value={activeQuery}
                />
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setActiveFilter(event.target.value)}
                  value={activeFilter}
                >
                  <option>All</option>
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                {activeTaskResults.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-sm">No matching tasks found.</p>
                ) : (
                  activeTaskResults.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium">{task.title}</div>
                      <div>
                        {task.category} - {task.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Archive" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Retrieve Archived Tasks</h2>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="rounded-lg border p-2 text-sm"
                  onBlur={validateArchiveFilters}
                  onChange={(event) => setArchiveQuery(event.target.value)}
                  placeholder="Search by name, category, or text..."
                  value={archiveQuery}
                />
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setArchiveCategory(event.target.value)}
                  value={archiveCategory}
                >
                  <option>All</option>
                  <option>CS4284</option>
                  <option>CS3114</option>
                  <option>PHYS</option>
                </select>
                <input
                  className="rounded-lg border p-2 text-sm"
                  onBlur={validateArchiveFilters}
                  onChange={(event) => setArchiveDateFrom(event.target.value)}
                  type="date"
                  value={archiveDateFrom}
                />
                <input
                  className="rounded-lg border p-2 text-sm"
                  onBlur={validateArchiveFilters}
                  onChange={(event) => setArchiveDateTo(event.target.value)}
                  type="date"
                  value={archiveDateTo}
                />
              </div>
              {archiveError && <p className="mt-2 text-sm text-red-600">{archiveError}</p>}
              <div className="mt-3 space-y-2">
                {archiveResults.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-sm">
                    No archived tasks match your criteria.
                  </p>
                ) : (
                  archiveResults.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium">{task.title}</div>
                      <div>
                        {task.date} - {task.category}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Reminders" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Set Reminder</h2>
              <div className="space-y-2">
                <select
                  className="w-full rounded-lg border p-2 text-sm"
                  onChange={(event) => setSelectedTaskForReminder(Number(event.target.value))}
                  value={selectedTaskForReminder}
                >
                  {activeTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full rounded-lg border p-2 text-sm"
                  onChange={(event) => setReminderMinutes(Number(event.target.value))}
                  value={reminderMinutes}
                >
                  <option value={10}>10 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={180}>3 hours before</option>
                </select>
                <button
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                  onClick={createReminder}
                  type="button"
                >
                  Schedule Reminder
                </button>
                {reminderError && <p className="text-sm text-red-600">{reminderError}</p>}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">Scheduled Reminders</h2>
              <div className="space-y-1 text-sm">
                {reminders.length === 0 && (
                  <p className="rounded border border-dashed p-2">No reminders scheduled yet.</p>
                )}
                {reminders.map((reminder) => {
                  const task = tasks.find((entry) => entry.id === reminder.taskId);
                  return (
                    <div key={reminder.id} className="rounded border bg-slate-50 p-2">
                      {task?.title} - {reminder.minutesBefore} min before
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Goals" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Create Goal and Link Tasks</h2>
              <form className="space-y-3" onSubmit={createGoal}>
                <input
                  className="w-full rounded-lg border p-2 text-sm"
                  onChange={(event) => setNewGoalTitle(event.target.value)}
                  placeholder="Goal title..."
                  value={newGoalTitle}
                />
                <div className="grid gap-2 md:grid-cols-2">
                  {activeTasks.map((task) => (
                    <label key={task.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                      <input
                        checked={goalTaskSelection.includes(task.id)}
                        onChange={(event) =>
                          setGoalTaskSelection((prev) =>
                            event.target.checked
                              ? [...prev, task.id]
                              : prev.filter((id) => id !== task.id),
                          )
                        }
                        type="checkbox"
                      />
                      {task.title}
                    </label>
                  ))}
                </div>
                <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
                  Create Goal
                </button>
                {goalError && <p className="text-sm text-red-600">{goalError}</p>}
              </form>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">Goal Progress</h2>
              <div className="space-y-3">
                {goalProgress.map(({ goal, percentage }) => (
                  <div key={goal.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{goal.title}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="h-2 rounded bg-slate-200">
                      <div className="h-2 rounded bg-slate-800" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "Focus" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-3">
              <h2 className="mb-3 text-xl font-semibold">Focus Session and Break Management</h2>
              <div className="grid gap-2 md:grid-cols-3">
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setFocusTaskId(Number(event.target.value))}
                  value={focusTaskId}
                >
                  {activeTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-lg border p-2 text-sm"
                  max={240}
                  min={10}
                  onChange={(event) => setSessionDuration(Number(event.target.value))}
                  type="number"
                  value={sessionDuration}
                />
                <input
                  className="rounded-lg border p-2 text-sm"
                  max={30}
                  min={1}
                  onChange={(event) => setBreakMinutes(Number(event.target.value))}
                  type="number"
                  value={breakMinutes}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                  onClick={startFocusSession}
                  type="button"
                >
                  Start Focus Session
                </button>
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={startBreak} type="button">
                  Start Break
                </button>
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={resumeFocus} type="button">
                  Resume Focus
                </button>
                <button className="rounded-lg border px-3 py-2 text-sm" onClick={stopFocus} type="button">
                  End Session
                </button>
              </div>
              <p className="mt-2 text-sm">Session state: {sessionState}</p>
              {focusConflict && (
                <p className="mt-2 rounded bg-amber-100 p-2 text-sm">
                  Conflict detected with {focusConflict.title}. Choose adjust/proceed/cancel behavior.
                </p>
              )}
              {sessionError && <p className="mt-2 text-sm text-red-600">{sessionError}</p>}
            </div>
          </section>
        )}

        {activeTab === "Export" && (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Agenda Export</h2>
              <div className="space-y-2">
                <input
                  className="w-full rounded-lg border p-2 text-sm"
                  onChange={(event) => setAgendaFrom(event.target.value)}
                  type="date"
                  value={agendaFrom}
                />
                <input
                  className="w-full rounded-lg border p-2 text-sm"
                  onChange={(event) => setAgendaTo(event.target.value)}
                  type="date"
                  value={agendaTo}
                />
                <button
                  className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                  onClick={exportAgenda}
                  type="button"
                >
                  Export Agenda (CSV)
                </button>
                {agendaError && <p className="text-sm text-red-600">{agendaError}</p>}
                <p className="text-xs text-slate-600">Export format can be extended to PDF/print view.</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
