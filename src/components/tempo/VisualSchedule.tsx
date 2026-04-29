"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { categoryBlockClasses } from "./constants";
import { Task, TaskStatus, BlockedTime } from "./types";

function statusAccent(status: TaskStatus): string {
  switch (status) {
    case "Completed":
      return "border-l-emerald-600";
    case "In Progress":
      return "border-l-sky-600";
    case "Not Started":
      return "border-l-amber-500";
    default:
      return "border-l-neutral-400";
  }
}

function taskBlockClasses(task: Task): string {
  return `${categoryBlockClasses(task.category)} ${statusAccent(task.status)} border-l-4`;
}

export type CalendarViewType = "daily" | "weekly" | "monthly";

interface VisualScheduleProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, startHour: number, date: string) => void;
  selectedDate: string;
  weekStart: string;
  viewType: CalendarViewType;
  onViewChange: (viewType: CalendarViewType) => void;
  blockedTimes: BlockedTime[];
  onAddBlockedTime: (date: string, startHour: number, durationMinutes: number) => void;
  onRemoveBlockedTime: (blockedId: number) => void;
  blockingMode: boolean;
  onBlockingModeChange: (enabled: boolean) => void;
  blockingReason: string;
  onBlockingReasonChange: (reason: string) => void;
}

interface DragState {
  taskId: number;
  startY: number;
  startHour: number;
  startDate: string;
}

interface BlockingState {
  date: string;
  dayIndex: number; // initial day index where blocking started
  startDayIndex: number; // inclusive
  endDayIndex: number; // inclusive
  startHour: number;
  endHour: number;
}

const HOURS_PER_DAY = 24;
const HOUR_HEIGHT = 60; // pixels per hour
const DAYS = 7;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.mozFullScreenElement ?? null;
}

// Displays the visual schedule with daily, weekly, and monthly calendar views.
export function VisualSchedule({
  tasks,
  onTaskUpdate,
  selectedDate,
  weekStart,
  viewType,
  onViewChange,
  blockedTimes,
  onAddBlockedTime,
  onRemoveBlockedTime,
  blockingMode,
  onBlockingModeChange,
  blockingReason,
  onBlockingReasonChange,
}: VisualScheduleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scheduleRootRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const syncFullscreenState = useCallback(() => {
    const root = scheduleRootRef.current;
    const fsEl = getFullscreenElement();
    setIsFullscreen(Boolean(root && fsEl === root));
  }, []);

  useEffect(() => {
    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);
    document.addEventListener("webkitfullscreenchange", syncFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.removeEventListener("webkitfullscreenchange", syncFullscreenState);
    };
  }, [syncFullscreenState]);

  const toggleFullscreen = useCallback(async () => {
    const el = scheduleRootRef.current;
    if (!el) return;
    try {
      if (!getFullscreenElement()) {
        const wk = el as HTMLElement & {
          webkitRequestFullscreen?: () => void;
        };
        if (typeof el.requestFullscreen === "function") {
          await el.requestFullscreen();
        } else if (typeof wk.webkitRequestFullscreen === "function") {
          wk.webkitRequestFullscreen();
        }
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => void;
        };
        if (typeof document.exitFullscreen === "function") {
          await document.exitFullscreen();
        } else if (typeof doc.webkitExitFullscreen === "function") {
          doc.webkitExitFullscreen();
        }
      }
    } catch {
      /* user denied / unsupported */
    }
  }, []);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [blockingState, setBlockingState] = useState<BlockingState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreview, setDragPreview] = useState<
    | {
        taskId: number;
        top: number;
        left: number;
        height: number;
        dayIndex: number;
        startHour: number;
        date: string;
        invalid?: boolean;
      }
    | null
  >(null);

  // Builds the list of dates shown in the weekly calendar view.
  const getWeekDates = useCallback(() => {
    const start = new Date(weekStart);
    const dates: string[] = [];
    for (let i = 0; i < DAYS; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }, [weekStart]);

  // Builds the full 6-week date grid used for the monthly calendar view.
  const getMonthDates = useCallback(() => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates: string[] = [];
    const current = new Date(startDate);
    
    while (dates.length < 42) { // 6 weeks * 7 days
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }, [selectedDate]);

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();
  const relevantDates = viewType === "monthly" ? monthDates : 
                        viewType === "daily" ? [selectedDate] : 
                        weekDates;
  
  const tasksForView = tasks.filter(
    (task) =>
      !task.archived &&
      relevantDates.includes(task.date)
  );

  // Checks whether a task overlaps with any blocked time on the same date.
  const isTimeBlocked = (date: string, startHour: number, durationHours: number): boolean => {
    return blockedTimes.some((blocked) => {
      if (blocked.date !== date) return false;
      const blockedStart = blocked.startHour;
      const blockedEnd = blocked.startHour + blocked.durationMinutes / 60;
      const taskEnd = startHour + durationHours;
      return !(taskEnd <= blockedStart || startHour >= blockedEnd);
    });
  };

  // Returns all blocked time entries for a specific date.
  const getBlockedTimesForDate = (date: string): BlockedTime[] => {
    return blockedTimes.filter((b) => b.date === date);
  };

  // Starts creating a blocked time range when the user clicks on the calendar grid.
  const handleGridPointerDown = (e: React.PointerEvent, dayIndex: number) => {
    if (!blockingMode || !containerRef.current) return;
    const targetDates =
      viewType === "monthly" ? monthDates : viewType === "daily" ? [selectedDate] : weekDates;

    // Find the exact day column element so we can calculate Y relative to its content area
    const dayEl = containerRef.current.querySelector<HTMLElement>(`[data-day-index=\"${dayIndex}\"]`);
    const headerHeight = viewType === "daily" ? 50 : 40;
    let hour = 0;
    if (dayEl) {
      const dayRect = dayEl.getBoundingClientRect();
      const relativeY = e.clientY - dayRect.top - headerHeight;
      const hoursOffset = relativeY / HOUR_HEIGHT;
      hour = Math.max(0, Math.min(23, Math.floor(hoursOffset)));
    }

    setBlockingState({
      dayIndex,
      startDayIndex: dayIndex,
      endDayIndex: dayIndex,
      date: targetDates[dayIndex],
      startHour: hour,
      endHour: hour + 1,
    });
  };

  // Calculates where a task should appear visually on the calendar grid.
  const getTaskPosition = (task: Task, datesArray: string[]) => {
    const dayIndex = datesArray.indexOf(task.date);
    if (dayIndex === -1) return null;

    return {
      top: task.startHour * HOUR_HEIGHT,
      height: (task.durationMinutes / 60) * HOUR_HEIGHT,
      dayIndex,
    };
  };

  // Converts mouse coordinates into a calendar date and start hour.
  const getTaskFromCoordinates = (
    clientX: number,
    clientY: number,
    dayIndexHint: number | null,
    totalDays: number
  ): { startHour: number; date: string; dayIndex: number } | null => {
    if (!containerRef.current) return null;

    const targetDates =
      viewType === "monthly" ? monthDates : viewType === "daily" ? [selectedDate] : weekDates;

    // Determine dayIndex by hit-testing day column rects if possible
    const dayElements = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-day-index]'));
    let dayIndex = -1;
    for (const el of dayElements) {
      const idx = Number(el.dataset.dayIndex);
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right) {
        dayIndex = idx;
        break;
      }
    }

    if (dayIndex === -1 && dayIndexHint !== null) {
      dayIndex = dayIndexHint;
    }

    if (dayIndex < 0 || dayIndex >= totalDays) return null;

    // compute relative Y inside the day column excluding sticky header
    const dayEl = containerRef.current.querySelector<HTMLElement>(`[data-day-index=\"${dayIndex}\"]`);
    if (!dayEl) return null;
    const dayRect = dayEl.getBoundingClientRect();

    const headerHeight = viewType === "daily" ? 50 : 40;
    const relativeY = clientY - dayRect.top - headerHeight;
    const hoursOffset = relativeY / HOUR_HEIGHT;

    // Round to nearest 15-minute increment
    const roundedHours = Math.round(hoursOffset * 4) / 4;
    const startHour = Math.max(0, Math.min(23, Math.floor(roundedHours)));

    return {
      startHour,
      date: targetDates[dayIndex],
      dayIndex,
    };
  };

  // Starts dragging a task and creates its visual drag preview.
  const handlePointerDownOnTask = (task: Task, e: React.PointerEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragState({
      taskId: task.id,
      startY: e.clientY,
      startHour: task.startHour,
      startDate: task.date,
    });
    setIsDragging(true);
    // initialize preview
    const targetDates = viewType === "monthly" ? monthDates : viewType === "daily" ? [selectedDate] : weekDates;
    const dayIndex = Math.max(0, targetDates.indexOf(task.date));
    const dayEl = containerRef.current.querySelector<HTMLElement>(`[data-day-index=\"${dayIndex}\"]`);
    const headerHeight = viewType === "daily" ? 50 : 40;
    let left = 60;
    if (dayEl && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dayRect = dayEl.getBoundingClientRect();
      left = dayRect.left - rect.left + 4; // small padding
    }
    const top = task.startHour * HOUR_HEIGHT + headerHeight;
    const height = (task.durationMinutes / 60) * HOUR_HEIGHT;
    setDragPreview({
      taskId: task.id,
      top,
      left,
      height,
      dayIndex,
      startHour: task.startHour,
      date: task.date,
    });
  };

  // Handles mouse movement while dragging over the calendar.
  const handleMouseMove = (e: React.MouseEvent, maxDayIndex: number) => {
    if (!dragState || !containerRef.current) return;
    const maybe = getTaskFromCoordinates(e.clientX, e.clientY, null, maxDayIndex + 1);
    if (maybe) {
      // preview could be updated here if needed
    }
  };

  // Finalizes task movement or blocked time creation when the mouse is released.
  const handleMouseUp = (e: React.MouseEvent, maxDayIndex: number) => {
    if (!dragState || !containerRef.current) return;

    if (blockingMode && blockingState) {
      const targetDate =
        viewType === "monthly" ? monthDates[blockingState.startDayIndex] : viewType === "daily" ? selectedDate : weekDates[blockingState.startDayIndex];
      const durationMinutes = (blockingState.endHour - blockingState.startHour) * 60;
      onAddBlockedTime(targetDate, blockingState.startHour, durationMinutes);
      setBlockingState(null);
      return;
    }

    const maybe = getTaskFromCoordinates(e.clientX, e.clientY, null, maxDayIndex + 1);
    if (maybe) {
      const task = tasks.find((t) => t.id === dragState.taskId);
      if (task && !isTimeBlocked(maybe.date, maybe.startHour, task.durationMinutes / 60)) {
        const targetDate = viewType === "monthly" ? monthDates[maybe.dayIndex] : viewType === "daily" ? selectedDate : weekDates[maybe.dayIndex];
        onTaskUpdate(dragState.taskId, maybe.startHour, targetDate);
      }
    }

    setDragState(null);
  };

  // Pointer move/up handlers for smooth dragging and blocking preview
  const handlePointerMove = (e: PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Blocking preview - support horizontal span across days
    if (blockingState) {
      // Determine which day column the pointer is over
      const dayElements = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-day-index]'));
      let hoverDay = blockingState.startDayIndex;
      for (const el of dayElements) {
        const idx = Number(el.dataset.dayIndex);
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right) {
          hoverDay = idx;
          break;
        }
      }

      // compute endHour relative to the day column under pointer (or startDay if not found)
      const dayEl = containerRef.current.querySelector<HTMLElement>(`[data-day-index=\"${hoverDay}\"]`);
      const headerHeight = viewType === "daily" ? 50 : 40;
      let endHour = blockingState.endHour;
      if (dayEl) {
        const dayRect = dayEl.getBoundingClientRect();
        const relativeY = e.clientY - dayRect.top - headerHeight;
        const hoursOffset = relativeY / HOUR_HEIGHT;
        endHour = Math.max(0, Math.min(24, Math.ceil(hoursOffset)));
      }

      setBlockingState((prev) => (prev ? { ...prev, endHour, endDayIndex: hoverDay } : prev));
      return;
    }

    // Dragging preview
    if (isDragging && dragState) {
      const maybe = getTaskFromCoordinates(e.clientX, e.clientY, null, viewType === "daily" ? 1 : viewType === "monthly" ? 7 : DAYS);
      if (!maybe) return;

      const task = tasks.find((t) => t.id === dragState.taskId);
      const height = task ? (task.durationMinutes / 60) * HOUR_HEIGHT : HOUR_HEIGHT;
      const top = maybe.startHour * HOUR_HEIGHT + (viewType === "daily" ? 50 : 40);

      // compute left using the day element bounds
      const dayEl = containerRef.current.querySelector<HTMLElement>(`[data-day-index=\"${maybe.dayIndex}\"]`);
      const left = dayEl ? dayEl.getBoundingClientRect().left - rect.left + 4 : 60;
      const date = maybe.date;
      const invalid = task ? isTimeBlocked(date, maybe.startHour, task.durationMinutes / 60) : false;

      setDragPreview({
        taskId: dragState.taskId,
        top,
        left,
        height,
        dayIndex: maybe.dayIndex,
        startHour: maybe.startHour,
        date,
        invalid,
      });
    }
  };

  // Finalizes dragging or blocking behavior when the pointer is released.
  const handlePointerUp = (e: PointerEvent) => {
    if (blockingState) {
      // finalize blocking across possibly multiple days
      const { startDayIndex, endDayIndex, startHour, endHour } = blockingState;
      const s = Math.min(startDayIndex, endDayIndex);
      const eIdx = Math.max(startDayIndex, endDayIndex);
      if (endHour && endHour > startHour) {
        const targetDates = viewType === "monthly" ? monthDates : viewType === "daily" ? [selectedDate] : weekDates;
        for (let di = s; di <= eIdx; di++) {
          const date = targetDates[di];
          if (date) onAddBlockedTime(date, startHour, (endHour - startHour) * 60);
        }
      }
      setBlockingState(null);
      onBlockingModeChange(false);
      return;
    }

    if (isDragging && dragPreview) {
      const task = tasks.find((t) => t.id === dragPreview.taskId);
      if (task && !dragPreview.invalid) {
        onTaskUpdate(dragPreview.taskId, dragPreview.startHour, dragPreview.date);
      }
    }

    setIsDragging(false);
    setDragState(null);
    setDragPreview(null);
  };

  // attach/detach global pointer listeners
  useEffect(() => {
    if (isDragging || blockingState) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, blockingState, dragState, dragPreview, viewType, weekDates, monthDates, tasks]);


 // Renders the weekly calendar layout with tasks and blocked times.
  const renderWeeklyView = () => {
    return (
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          className="relative grid"
          style={{
            gridTemplateColumns: `60px repeat(${DAYS}, 1fr)`,
            minWidth: "100%",
          }}
          onMouseMove={(e) => handleMouseMove(e, DAYS - 1)}
          onMouseUp={(e) => handleMouseUp(e, DAYS - 1)}
          onMouseLeave={(e) => handleMouseUp(e, DAYS - 1)}
        >
          {/* Time labels */}
          <div className="sticky left-0 z-10 bg-white">
            <div
              className="sticky top-0 border-b border-r border-slate-200 bg-white"
              style={{ height: "40px" }}
            />
            {Array.from({ length: HOURS_PER_DAY }).map((_, hour) => (
              <div
                key={`time-${hour}`}
                className="border-r border-slate-200 text-right text-xs text-slate-500 pr-2"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date, dayIndex) => {
            const dayOfWeek = new Date(date);
            const isToday = date === selectedDate;
            const dayName = DAY_NAMES[dayOfWeek.getDay()];
            const dayNum = dayOfWeek.getDate();

            return (
              <div
                key={`day-${date}`}
                className={`relative ${isToday ? "bg-blue-50" : "bg-white"}`}
              >
                <div
                  className={`sticky top-0 z-10 border-b border-slate-200 p-2 text-center text-sm font-medium ${
                    isToday ? "bg-blue-100 text-blue-900" : "bg-white"
                  }`}
                  style={{ height: "40px" }}
                >
                  <div>{dayName}</div>
                  <div className="text-xs">{dayNum}</div>
                </div>

                <div className="relative" data-day-index={dayIndex}>
                  {Array.from({ length: HOURS_PER_DAY }).map((_, hour) => (
                    <div
                      key={`grid-${dayIndex}-${hour}`}
                      className={`border-b border-slate-100 ${blockingMode ? "cursor-crosshair hover:bg-yellow-100" : ""}`}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      onPointerDown={(e) => blockingMode && handleGridPointerDown(e, dayIndex)}
                    />
                  ))}

                  {/* Blocked time blocks */}
                  {getBlockedTimesForDate(date).map((blocked) => (
                    <div
                      key={`blocked-${blocked.id}`}
                      className="absolute left-1 right-1 rounded border-2 border-red-400 bg-red-100 p-2 text-xs cursor-pointer hover:bg-red-200 z-5"
                      style={{
                        top: `${blocked.startHour * HOUR_HEIGHT}px`,
                        height: `${(blocked.durationMinutes / 60) * HOUR_HEIGHT}px`,
                        minHeight: "30px",
                      }}
                      title={`Blocked: ${blocked.reason}`}
                      onClick={() => onRemoveBlockedTime(blocked.id)}
                    >
                      <div className="font-semibold text-red-700">Blocked</div>
                      <div className="text-xs text-red-600">{blocked.reason}</div>
                      <div className="text-xs text-red-500 pt-1">(Click to remove)</div>
                    </div>
                  ))}

                  {tasksForView
                    .filter((task) => task.date === date)
                    .map((task) => {
                      const position = getTaskPosition(task, weekDates);
                      if (!position) return null;
                      const isDragging = dragState?.taskId === task.id;

                      return (
                        <TaskBlock
                          key={`task-${task.id}`}
                          task={task}
                          position={position}
                          isDragging={isDragging}
                          hoveredTask={hoveredTask}
                          onHover={() => setHoveredTask(task.id)}
                          onUnhover={() => setHoveredTask(null)}
                          onPointerDown={(e) => handlePointerDownOnTask(task, e)}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Drag preview */}
        {dragPreview && viewType === "weekly" && (
          (() => {
            const dayEl = containerRef.current?.querySelector<HTMLElement>(`[data-day-index=\"${dragPreview.dayIndex}\"]`);
            const rect = containerRef.current?.getBoundingClientRect();
            const width = dayEl && rect ? Math.max(40, dayEl.getBoundingClientRect().width - 8) : undefined;
            return (
              <div
                className={`absolute z-40 pointer-events-none ${dragPreview.invalid ? "opacity-60 bg-red-200 border-red-400" : "opacity-90 bg-slate-100 border-slate-300"}`}
                style={{
                  top: `${dragPreview.top}px`,
                  left: `${dragPreview.left}px`,
                  height: `${dragPreview.height}px`,
                  width: width ? `${width}px` : `calc((100% - 60px) / ${DAYS} - 8px)`,
                  transform: `translateX(0)`,
                  borderLeftWidth: 4,
                  borderStyle: "solid",
                }}
              />
            );
          })()
        )}
        {/* Blocking preview */}
        {blockingState && viewType === "weekly" && containerRef.current && (
          (() => {
            const rect = containerRef.current.getBoundingClientRect();
            const dayElements = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-day-index]'));
            const startIdx = Math.min(blockingState.startDayIndex, blockingState.endDayIndex);
            const endIdx = Math.max(blockingState.startDayIndex, blockingState.endDayIndex);

            const startEl = dayElements.find((el) => Number(el.dataset.dayIndex) === startIdx);
            const endEl = dayElements.find((el) => Number(el.dataset.dayIndex) === endIdx);
            const headerHeight = 40;

            const left = startEl ? startEl.getBoundingClientRect().left - rect.left + 4 : 60;
            const right = endEl ? endEl.getBoundingClientRect().right - rect.left - 4 : left + 100;
            const top = blockingState.startHour * HOUR_HEIGHT + headerHeight;
            const height = Math.max(30, (Math.max(blockingState.endHour ?? blockingState.startHour + 1, blockingState.startHour) - blockingState.startHour) * HOUR_HEIGHT);
            const width = Math.max(40, right - left);

            return (
              <div
                className="absolute z-30 pointer-events-none bg-yellow-200 opacity-80 border border-yellow-400 rounded"
                style={{ top: `${top}px`, left: `${left}px`, height: `${height}px`, width: `${width}px` }}
              />
            );
          })()
        )}
      </div>
    );
  };

  // Renders the single-day calendar layout.
  const renderDailyView = () => {
    const dayOfWeek = new Date(selectedDate);
    const dayName = DAY_NAMES[dayOfWeek.getDay()];
    const dayNum = dayOfWeek.getDate();
    const month = dayOfWeek.toLocaleString("default", { month: "short" });

    return (
      <div className="overflow-x-auto">
        <div
          ref={containerRef}
          className="relative grid"
          style={{
            gridTemplateColumns: `60px 1fr`,
            minWidth: "100%",
          }}
          onMouseMove={(e) => handleMouseMove(e, 0)}
          onMouseUp={(e) => handleMouseUp(e, 0)}
          onMouseLeave={(e) => handleMouseUp(e, 0)}
        >
          {/* Time labels */}
          <div className="sticky left-0 z-10 bg-white">
            <div
              className="sticky top-0 border-b border-r border-slate-200 bg-white font-semibold"
              style={{ height: "50px" }}
            />
            {Array.from({ length: HOURS_PER_DAY }).map((_, hour) => (
              <div
                key={`time-${hour}`}
                className="border-r border-slate-200 text-right text-xs text-slate-500 pr-2"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Day column */}
          <div className="relative bg-white">
            <div
              className="sticky top-0 z-10 border-b border-slate-200 bg-blue-50 p-3 text-center font-semibold text-blue-900"
              style={{ height: "50px" }}
            >
              {dayName}, {month} {dayNum}
            </div>

            <div className="relative" data-day-index={0}>
              {Array.from({ length: HOURS_PER_DAY }).map((_, hour) => (
                <div
                  key={`grid-${hour}`}
                  className={`border-b border-slate-100 ${blockingMode ? "cursor-crosshair hover:bg-yellow-100" : ""}`}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  onPointerDown={(e) => blockingMode && handleGridPointerDown(e, 0)}
                />
              ))}

              {/* Blocked time blocks */}
              {getBlockedTimesForDate(selectedDate).map((blocked) => (
                <div
                  key={`blocked-${blocked.id}`}
                  className="absolute left-1 right-1 rounded border-2 border-red-400 bg-red-100 p-2 text-xs cursor-pointer hover:bg-red-200 z-5"
                  style={{
                    top: `${blocked.startHour * HOUR_HEIGHT}px`,
                    height: `${(blocked.durationMinutes / 60) * HOUR_HEIGHT}px`,
                    minHeight: "30px",
                  }}
                  title={`Blocked: ${blocked.reason}`}
                  onClick={() => onRemoveBlockedTime(blocked.id)}
                >
                  <div className="font-semibold text-red-700">Blocked</div>
                  <div className="text-xs text-red-600">{blocked.reason}</div>
                  <div className="text-xs text-red-500 pt-1">(Click to remove)</div>
                </div>
              ))}

              {tasksForView
                .filter((task) => task.date === selectedDate)
                .map((task) => {
                  const position = getTaskPosition(task, [selectedDate]);
                  if (!position) return null;
                  const isDragging = dragState?.taskId === task.id;

                  return (
                    <TaskBlock
                      key={`task-${task.id}`}
                      task={task}
                      position={position}
                      isDragging={isDragging}
                      hoveredTask={hoveredTask}
                      onHover={() => setHoveredTask(task.id)}
                      onUnhover={() => setHoveredTask(null)}
                      onPointerDown={(e) => handlePointerDownOnTask(task, e)}
                    />
                  );
                })}

                {dragPreview && viewType === "daily" && (
                  <div
                    className={`absolute z-40 pointer-events-none ${dragPreview.invalid ? "opacity-60 bg-red-200 border-red-400" : "opacity-90 bg-slate-100 border-slate-300"}`}
                    style={{
                      top: `${dragPreview.top}px`,
                      left: `${dragPreview.left}px`,
                      height: `${dragPreview.height}px`,
                      width: `calc(100% - 68px)`,
                      borderLeftWidth: 4,
                      borderStyle: "solid",
                    }}
                  />
                )}

                {blockingState && viewType === "daily" && containerRef.current && (
                  (() => {
                    const headerHeight = 50;
                    const top = blockingState.startHour * HOUR_HEIGHT + headerHeight;
                    const height = Math.max(30, (Math.max(blockingState.endHour ?? blockingState.startHour + 1, blockingState.startHour) - blockingState.startHour) * HOUR_HEIGHT);
                    return (
                      <div
                        className="absolute z-30 pointer-events-none bg-yellow-200 opacity-80 border border-yellow-400 rounded left-0"
                        style={{ top: `${top}px`, left: `60px`, height: `${height}px`, width: `calc(100% - 68px)` }}
                      />
                    );
                  })()
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

 // Renders the monthly calendar grid.
  const renderMonthlyView = () => {
    const date = new Date(selectedDate);
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });

    return (
      <div className="overflow-auto" ref={containerRef}>
        <div className="grid grid-cols-7 gap-px bg-slate-200 p-px min-w-max">
          {/* Day headers */}
          {DAY_NAMES_SHORT.map((day, dayIndex) => (
            <div
              key={`header-${dayIndex}`}
              className="bg-slate-100 p-2 text-center font-semibold text-sm h-10 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {/* Calendar cells */}
          {monthDates.map((date, idx) => {
            const dayOfMonth = new Date(date).getDate();
            const month = new Date(date).getMonth();
            const currentMonth = new Date(selectedDate).getMonth();
            const isCurrentMonth = month === currentMonth;
            const isToday = date === selectedDate;
            const dayTasks = tasksForView.filter((t) => t.date === date);

            return (
              <div
                key={`cell-${date}`}
                data-day-index={idx}
                className={`min-h-24 p-2 border text-xs ${
                  isToday
                    ? "bg-blue-50 border-blue-300"
                    : isCurrentMonth
                      ? "bg-white"
                      : "bg-gray-50"
                } ${!isCurrentMonth ? "opacity-50" : ""}`}
                onPointerDown={(e) => blockingMode && handleGridPointerDown(e, idx)}
              >
                <div
                  className={`font-semibold mb-1 ${
                    isToday ? "text-blue-700" : isCurrentMonth ? "text-black" : "text-gray-500"
                  }`}
                >
                  {dayOfMonth}
                </div>
                <div className="space-y-px">
                  {getBlockedTimesForDate(date).length > 0 && (
                    <div className="p-1 rounded text-xs bg-red-200 text-red-700 font-semibold border border-red-400">
                      🔒 Blocked
                    </div>
                  )}
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={`task-${task.id}`}
                      className={`p-1 text-xs truncate cursor-move rounded border ${taskBlockClasses(task)}`}
                      title={task.title}
                      onPointerDown={(e) => handlePointerDownOnTask(task, e)}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-slate-500">+{dayTasks.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={scheduleRootRef}
      className="w-full rounded-2xl border border-[var(--tempo-border)] bg-[var(--tempo-surface)] p-5 shadow-sm fullscreen:fixed fullscreen:inset-0 fullscreen:z-[100] fullscreen:flex fullscreen:h-screen fullscreen:flex-col fullscreen:overflow-hidden fullscreen:rounded-none fullscreen:p-4 sm:fullscreen:p-6"
    >
      <div className="mb-4 flex shrink-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Visual Schedule</h2>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewType === "daily"
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-100"
              }`}
              onClick={() => onViewChange("daily")}
              type="button"
            >
              Day
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewType === "weekly"
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-100"
              }`}
              onClick={() => onViewChange("weekly")}
              type="button"
            >
              Week
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewType === "monthly"
                  ? "bg-blue-600 text-white"
                  : "border hover:bg-slate-100"
              }`}
              onClick={() => onViewChange("monthly")}
              type="button"
            >
              Month
            </button>
            <button
              aria-pressed={isFullscreen}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                isFullscreen
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => void toggleFullscreen()}
              type="button"
            >
              {isFullscreen ? "Exit fullscreen" : "Expand"}
            </button>
          </div>
        </div>

        {/* Blocking mode controls */}
        <div className="flex items-center gap-2 border-t pt-3">
          <button
            onClick={() => onBlockingModeChange(!blockingMode)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              blockingMode
                ? "bg-red-600 text-white"
                : "border hover:bg-slate-100"
            }`}
            type="button"
          >
            {blockingMode ? "🔒 Blocking ON" : "Block Time"}
          </button>
          {blockingMode && (
            <>
              <select
                value={blockingReason}
                onChange={(e) => onBlockingReasonChange(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option>Meeting</option>
                <option>Break</option>
                <option>Lunch</option>
                <option>Focus Time</option>
                <option>Personal</option>
                <option>Other</option>
              </select>
              <span className="text-sm text-slate-600 ml-auto">Click on calendar to block time periods</span>
            </>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto fullscreen:overflow-auto">
        {viewType === "weekly" && renderWeeklyView()}
        {viewType === "daily" && renderDailyView()}
        {viewType === "monthly" && renderMonthlyView()}
      </div>

      <div className="mt-4 shrink-0 text-xs text-slate-600 fullscreen:mt-2">
        <p>💡 Drag tasks to reschedule them to a different time or day</p>
      </div>
    </div>
  );
}

// Helper component for task blocks
interface TaskBlockProps {
  task: Task;
  position: { top: number; height: number; dayIndex: number };
  isDragging: boolean;
  hoveredTask: number | null;
  onHover: () => void;
  onUnhover: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}

// Displays a draggable task block inside the calendar grid.
function TaskBlock({
  task,
  position,
  isDragging,
  hoveredTask,
  onHover,
  onUnhover,
  onPointerDown,
}: TaskBlockProps) {
  return (
    <div
      className={`absolute left-1 right-1 rounded p-2 text-xs cursor-move overflow-hidden transition-all border ${taskBlockClasses(
        task
      )} ${isDragging ? "opacity-75 z-20 shadow-lg border-t-2" : "z-10"}`}
      style={{
        top: `${position.top}px`,
        height: `${Math.max(30, position.height)}px`,
        minHeight: "30px",
      }}
      onPointerDown={onPointerDown}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      title={`${task.title} (${Math.floor(task.durationMinutes / 60)}h ${task.durationMinutes % 60}m)`}
    >
      <div className="font-semibold truncate">{task.title}</div>
      {hoveredTask === task.id && (
        <div className="mt-1 text-xs opacity-75">
          {Math.floor(task.durationMinutes / 60)}h {task.durationMinutes % 60}m
        </div>
      )}
      <div className="text-xs opacity-75">{task.category}</div>
    </div>
  );
}
