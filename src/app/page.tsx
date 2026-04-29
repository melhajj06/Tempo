"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppHeader } from "../components/tempo/AppHeader";
import { DeepFocusMode } from "../components/tempo/DeepFocusMode";
import { SidebarMenu } from "../components/tempo/SidebarMenu";
import { TempoAI } from "../components/tempo/TempoAI";
import { TaskFormCard } from "../components/tempo/TaskFormCard";
import { VisualSchedule } from "../components/tempo/VisualSchedule";
import { categoryBlockClasses, initialGoals, initialTasks, tempoTabs } from "../components/tempo/constants";
import type { CalendarViewType } from "../components/tempo/VisualSchedule";
import { BlockedTime, Goal, Reminder, SessionState, Task, TaskStatus, TempoTab } from "../components/tempo/types";
import type { TaskFormPayload } from "../components/tempo/TaskFormCard";
import { rankTasksByWeight, computeWeightScore } from "@/lib/tempo/weightingEngine";
import { findScheduleConflicts } from "@/lib/tempo/scheduleConflicts";
import { serializeTempoAiContext } from "@/lib/tempo/tempoAiContext";
import { useAuth } from "@/contexts/auth-context";
export default function TempoDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveCategory, setArchiveCategory] = useState("All");
  const [archiveDateFrom, setArchiveDateFrom] = useState("");
  const [archiveDateTo, setArchiveDateTo] = useState("");
  const [archiveReasonFilter, setArchiveReasonFilter] = useState("All");
  const [archiveSort, setArchiveSort] = useState("Newest archived");
  const [archiveError, setArchiveError] = useState("");
  const [archiveActionError, setArchiveActionError] = useState("");
  const [archiveActionPendingTaskId, setArchiveActionPendingTaskId] = useState<number | null>(null);
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [archiveReasonInput, setArchiveReasonInput] = useState("Completed");
  const [uiMessage, setUiMessage] = useState("Welcome back. Core Tempo features are active.");
  const [weekStartDate, setWeekStartDate] = useState("2026-04-27");
  const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>("weekly");
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [blockingMode, setBlockingMode] = useState(false);
  const [blockingStartHour, setBlockingStartHour] = useState<number | null>(null);
  const [blockingReason, setBlockingReason] = useState("Meeting");
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deepFocusOpen, setDeepFocusOpen] = useState(false);

  const nowDate = "2026-04-27";
  const activeTasks = useMemo(() => tasks.filter((task) => !task.archived), [tasks]);
  const archivedTasks = useMemo(() => tasks.filter((task) => task.archived), [tasks]);

  const rankedTasks = useMemo(() => rankTasksByWeight(tasks), [tasks]);

  const scheduleConflicts = useMemo(() => findScheduleConflicts(tasks), [tasks]);

  const tempoAiContext = useMemo(
    () =>
      serializeTempoAiContext({
        nowDate,
        weekStartDate,
        calendarViewType,
        activeTasks,
        archivedTasks,
        rankedTasks,
        blockedTimes,
        reminders,
        goals,
        allTasksForLookup: tasks,
        scheduleConflicts,
      }),
    [
      nowDate,
      weekStartDate,
      calendarViewType,
      activeTasks,
      archivedTasks,
      rankedTasks,
      blockedTimes,
      reminders,
      goals,
      tasks,
      scheduleConflicts,
    ],
  );

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
    const filtered = archivedTasks.filter((task) => {
      const taskDate = new Date(task.date).getTime();
      const matchesQuery =
        task.title.toLowerCase().includes(archiveQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(archiveQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(archiveQuery.toLowerCase());
      const matchesCategory = archiveCategory === "All" || task.category === archiveCategory;
      const matchesReason = archiveReasonFilter === "All" || task.archiveReason === archiveReasonFilter;
      const matchesFrom = from === undefined || taskDate >= from;
      const matchesTo = to === undefined || taskDate <= to;
      return matchesQuery && matchesCategory && matchesReason && matchesFrom && matchesTo;
    });

    return [...filtered].sort((a, b) => {
      const archivedAtA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const archivedAtB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      if (archiveSort === "Oldest archived") {
        return archivedAtA - archivedAtB;
      }
      return archivedAtB - archivedAtA;
    });
  }, [
    archivedTasks,
    archiveQuery,
    archiveCategory,
    archiveReasonFilter,
    archiveDateFrom,
    archiveDateTo,
    archiveSort,
  ]);

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
  }, [activeTasks, nowDate]);

  const deepFocusSubject = useMemo(
    () => activeTasks.find((t) => t.id === focusTaskId) ?? activeTasks[0] ?? null,
    [activeTasks, focusTaskId],
  );

  const handleTaskTimeUpdate = (taskId: number, startHour: number, newDate: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        return { ...task, startHour, date: newDate };
      }),
    );
    const task = tasks.find((t) => t.id === taskId);
    setUiMessage(`Task "${task?.title}" rescheduled to ${newDate} at ${String(startHour).padStart(2, "0")}:00.`);
  };

  const handleWeekNavigation = (direction: "prev" | "next") => {
    const current = new Date(weekStartDate);
    current.setDate(current.getDate() + (direction === "next" ? 7 : -7));
    setWeekStartDate(current.toISOString().split("T")[0]);
  };

  const addBlockedTime = (date: string, startHour: number, durationMinutes: number) => {
    const newBlocked: BlockedTime = {
      id: Date.now(),
      date,
      startHour,
      durationMinutes,
      reason: blockingReason,
    };
    setBlockedTimes((prev) => [...prev, newBlocked]);
    setUiMessage(`Blocked ${durationMinutes / 60}h starting at ${String(startHour).padStart(2, "0")}:00 on ${date}`);
  };

  const removeBlockedTime = (blockedId: number) => {
    setBlockedTimes((prev) => prev.filter((b) => b.id !== blockedId));
    setUiMessage("Blocked time removed.");
  };

  const handleCreateTask = (payload: TaskFormPayload) => {
    const id = Date.now();
    const next: Task = {
      id,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      date: payload.date,
      startHour: payload.startHour,
      durationMinutes: payload.durationMinutes,
      deadline: payload.deadline,
      subjectivePriority: payload.subjectivePriority,
      status: payload.status,
      archived: false,
      archivedAt: null,
      archiveReason: null,
    };
    setTasks((prev) => [...prev, next]);
    setUiMessage("Task added. It is ranked using the dynamic weighting engine.");
  };

  const handleUpdateTask = (taskId: number, payload: TaskFormPayload) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              title: payload.title,
              description: payload.description,
              category: payload.category,
              date: payload.date,
              startHour: payload.startHour,
              durationMinutes: payload.durationMinutes,
              deadline: payload.deadline,
              subjectivePriority: payload.subjectivePriority,
              status: payload.status,
            }
          : t,
      ),
    );
    setEditTarget(null);
    setUiMessage("Task saved. Weighting updated.");
  };

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

  const archiveTask = (taskId: number) => {
    setArchiveActionError("");
    if (!archiveReasonInput.trim()) {
      setArchiveActionError("Please select a valid archive reason.");
      return;
    }
    setArchiveActionPendingTaskId(taskId);
    window.setTimeout(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                archived: true,
                archivedAt: new Date().toISOString(),
                archiveReason: archiveReasonInput,
              }
            : task,
        ),
      );
      setArchiveActionPendingTaskId(null);
      setUiMessage("Task archived successfully.");
      setActiveTab("Archive");
    }, 500);
  };

  const restoreTask = (taskId: number) => {
    setArchiveActionPendingTaskId(taskId);
    window.setTimeout(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, archived: false, archivedAt: null, archiveReason: null }
            : task,
        ),
      );
      setArchiveActionPendingTaskId(null);
      setUiMessage("Archived task restored to active tasks.");
    }, 500);
  };

  const deleteArchivedTask = (taskId: number) => {
    setArchiveActionPendingTaskId(taskId);
    window.setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setGoals((prev) =>
        prev.map((goal) => ({
          ...goal,
          taskIds: goal.taskIds.filter((goalTaskId) => goalTaskId !== taskId),
        })),
      );
      setReminders((prev) => prev.filter((reminder) => reminder.taskId !== taskId));
      setArchiveActionPendingTaskId(null);
      setUiMessage("Archived task permanently deleted.");
    }, 500);
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

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[var(--tempo-canvas)] text-[var(--tempo-ink)]">
        <AppHeader onOpenMenu={() => {}} showMenu={false} uiMessage="Loading session…" />
        <div className="flex min-h-[45vh] items-center justify-center px-4 text-sm text-[var(--tempo-muted-foreground)]">
          Loading…
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--tempo-canvas)] text-[var(--tempo-ink)]">
        <AppHeader onOpenMenu={() => {}} showMenu={false} uiMessage="Sign in to use Tempo." />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <p className="text-xl font-semibold tracking-tight">Welcome to Tempo</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--tempo-muted-foreground)]">
            Use <span className="font-medium text-[var(--tempo-ink)]">Sign in</span> in the top right to continue with Google or email.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--tempo-canvas)] text-[var(--tempo-ink)]">
      <AppHeader
        onOpenMenu={() => setIsMenuOpen(true)}
        primaryAction={{
          label: "Deep focus",
          onClick: () => setDeepFocusOpen(true),
          disabled: !deepFocusSubject,
        }}
        uiMessage={uiMessage}
      />
      <SidebarMenu
        activeTab={activeTab}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMenuOpen(false);
        }}
        tabs={tempoTabs}
      />

      <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
        {activeTab === "Dashboard" && (
          <section className="space-y-6">
            {scheduleConflicts.length > 0 && (
              <div
                className="rounded-xl border border-amber-300/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
                role="status"
              >
                <p className="font-medium">Schedule overlap detected</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90">
                  {scheduleConflicts.map(({ a, b }) => (
                    <li key={`${a.id}-${b.id}`}>
                      &ldquo;{a.title}&rdquo; overlaps with &ldquo;{b.title}&rdquo; on {a.date}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-1">
                <TaskFormCard
                  defaultScheduledDate={nowDate}
                  editingTask={editTarget}
                  onCreate={handleCreateTask}
                  onDiscardEdit={() => setEditTarget(null)}
                  onUpdate={handleUpdateTask}
                />

                <TempoAI context={tempoAiContext} />

                <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm">
                  <h2 className="mb-1 text-xl font-semibold tracking-tight text-[var(--tempo-ink)]">
                    Weighted queue
                  </h2>
                  <p className="mb-3 text-xs text-[var(--tempo-muted-foreground)]">
                    Rank combines deadline urgency and your priority ({new Date(nowDate).getFullYear()} reference).
                  </p>
                  <div className="space-y-2">
                    {rankedTasks.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--tempo-border)] p-4 text-sm text-[var(--tempo-muted-foreground)]">
                        No active tasks. Add one above or restore from Archive.
                      </div>
                    ) : (
                      rankedTasks.map((task, i) => {
                        const score = computeWeightScore(task, new Date(`${nowDate}T12:00:00`));
                        return (
                          <div
                            key={task.id}
                            className={`flex gap-3 rounded-lg border border-[var(--tempo-border)] p-3 text-sm`}
                          >
                            <span className="w-6 shrink-0 pt-0.5 text-xs text-[var(--tempo-muted-foreground)]">{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="font-medium leading-snug">{task.title}</div>
                                <button
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${categoryBlockClasses(task.category)}`}
                                  onClick={() => setEditTarget(task)}
                                  type="button"
                                >
                                  Edit
                                </button>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--tempo-muted-foreground)]">
                                <span>Due {task.deadline}</span>
                                <span>P{task.subjectivePriority}</span>
                                <span>Score {score.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm">
                  <h2 className="mb-3 text-xl font-semibold tracking-tight">Today</h2>
                  <div className="space-y-2">
                    {todayItems.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-[var(--tempo-border)] p-4 text-sm text-[var(--tempo-muted-foreground)]">
                        No sessions today.
                      </div>
                    ) : (
                      todayItems.map((task) => (
                        <div
                          key={task.id}
                          className="space-y-2 rounded-lg border border-[var(--tempo-border)] p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-medium">{task.startHour}:00</div>
                            <div className="flex-1">{task.title}</div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-[var(--tempo-muted-foreground)]">
                              {task.category} • {task.status}
                            </div>
                            <button
                              className="whitespace-nowrap rounded-md border border-[var(--tempo-border)] px-2 py-1 text-xs hover:bg-[var(--tempo-muted)]"
                              onClick={() => toggleTaskStatus(task.id)}
                              type="button"
                            >
                              Cycle status
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm">
                  <h2 className="mb-3 text-xl font-semibold tracking-tight">Goals</h2>
                  <div className="space-y-3">
                    {goalProgress.map(({ goal, percentage }) => (
                      <div key={goal.id}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{goal.title}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="h-2 rounded bg-[var(--tempo-muted)]">
                          <div
                            className="h-2 rounded bg-[var(--tempo-ink)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <VisualSchedule
                  tasks={tasks}
                  onTaskUpdate={handleTaskTimeUpdate}
                  selectedDate={nowDate}
                  weekStart={weekStartDate}
                  viewType={calendarViewType}
                  onViewChange={setCalendarViewType}
                  blockedTimes={blockedTimes}
                  onAddBlockedTime={addBlockedTime}
                  onRemoveBlockedTime={removeBlockedTime}
                  blockingMode={blockingMode}
                  onBlockingModeChange={setBlockingMode}
                  blockingReason={blockingReason}
                  onBlockingReasonChange={setBlockingReason}
                />
              </div>
            </div>

            {/* Week navigation - only show for weekly view */}
            {calendarViewType === "weekly" && (
              <div className="flex justify-center gap-2">
                <button
                  className="rounded-lg border px-4 py-2 hover:bg-slate-100 text-sm"
                  onClick={() => handleWeekNavigation("prev")}
                  type="button"
                >
                  ← Previous Week
                </button>
                <button
                  className="rounded-lg border px-4 py-2 hover:bg-slate-100 text-sm"
                  onClick={() => handleWeekNavigation("next")}
                  type="button"
                >
                  Next Week →
                </button>
              </div>
            )}
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
              <div className="mb-3 grid gap-2 md:grid-cols-2">
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setArchiveReasonInput(event.target.value)}
                  value={archiveReasonInput}
                >
                  <option>Completed</option>
                  <option>No longer relevant</option>
                  <option>Duplicate task</option>
                  <option>Deferred</option>
                </select>
                <p className="rounded-lg border border-dashed p-2 text-sm">
                  Select an archive reason, then use the Archive button on a task.
                </p>
              </div>
              {archiveActionError && <p className="mb-2 text-sm text-red-600">{archiveActionError}</p>}
              <div className="space-y-2">
                {activeTaskResults.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-3 text-sm">No matching tasks found.</p>
                ) : (
                  activeTaskResults.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3 text-sm">
                      <div className="font-medium">{task.title}</div>
                      <div className="mb-2">
                        {task.category} - {task.status}
                      </div>
                      <button
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-100"
                        disabled={archiveActionPendingTaskId === task.id}
                        onClick={() => archiveTask(task.id)}
                        type="button"
                      >
                        {archiveActionPendingTaskId === task.id ? "Archiving..." : "Archive Task"}
                      </button>
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
              <div className="grid gap-2 md:grid-cols-3">
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
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setArchiveReasonFilter(event.target.value)}
                  value={archiveReasonFilter}
                >
                  <option>All</option>
                  <option>Completed</option>
                  <option>No longer relevant</option>
                  <option>Duplicate task</option>
                  <option>Deferred</option>
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
                <select
                  className="rounded-lg border p-2 text-sm"
                  onChange={(event) => setArchiveSort(event.target.value)}
                  value={archiveSort}
                >
                  <option>Newest archived</option>
                  <option>Oldest archived</option>
                </select>
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
                      <div className="mb-2">
                        {task.date} - {task.category}
                      </div>
                      <div className="mb-2 text-xs text-slate-600">
                        Archived: {task.archivedAt ? new Date(task.archivedAt).toLocaleString() : "Unknown"} |
                        Reason: {task.archiveReason ?? "N/A"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-100"
                          disabled={archiveActionPendingTaskId === task.id}
                          onClick={() => restoreTask(task.id)}
                          type="button"
                        >
                          {archiveActionPendingTaskId === task.id ? "Working..." : "Restore"}
                        </button>
                        <button
                          className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                          disabled={archiveActionPendingTaskId === task.id}
                          onClick={() => deleteArchivedTask(task.id)}
                          type="button"
                        >
                          {archiveActionPendingTaskId === task.id ? "Working..." : "Delete Permanently"}
                        </button>
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
            <div className="rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm lg:col-span-3">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">Focus session</h2>
                <button
                  className="rounded-lg bg-[var(--tempo-ink)] px-4 py-2 text-sm font-medium text-[var(--tempo-surface)] disabled:opacity-40"
                  disabled={!deepFocusSubject}
                  onClick={() => setDeepFocusOpen(true)}
                  type="button"
                >
                  Enter Deep Focus
                </button>
              </div>
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

      <DeepFocusMode onClose={() => setDeepFocusOpen(false)} open={deepFocusOpen} task={deepFocusSubject} />
    </main>
  );
}
