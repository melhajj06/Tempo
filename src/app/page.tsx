"use client";

export default function TempoMockups() {
  const screens = [
    {
      title: "1. Sign In / Registration",
      description: "Authentication, password reset, profile setup, and secure access entry points.",
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-2xl font-semibold mb-2 text-black">Tempo</div>
            <div className="text-sm text-black mb-6">Smart scheduling for focused students</div>
            <div className="space-y-4">
              <input className="w-full rounded-xl border p-3 text-black" value="wilson@example.com" readOnly />
              <input className="w-full rounded-xl border p-3 text-black" value="••••••••••" readOnly />
              <button className="w-full rounded-xl bg-slate-900 text-white py-3">Sign In</button>
              <button className="w-full rounded-xl border py-3 text-black">Create Account</button>
              <div className="text-sm text-blue-600">Forgot password?</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="text-lg font-semibold mb-4 text-black">Set Up Your Profile</div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="mb-1 text-black">Name</div>
                <div className="rounded-xl border p-3 text-black">Wilson G.</div>
              </div>
              <div>
                <div className="mb-1 text-black">Preferred Study Hours</div>
                <div className="rounded-xl border p-3 text-black">7:00 PM – 11:00 PM</div>
              </div>
              <div>
                <div className="mb-1 text-black">Notification Preferences</div>
                <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-2 rounded-full bg-slate-100 text-black">Email</span>
                  <span className="px-3 py-2 rounded-full bg-slate-100 text-black">Push</span>
                  <span className="px-3 py-2 rounded-full bg-slate-100 text-black">Daily Briefing</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-black">Schedule Sharing</div>
                <div className="rounded-xl border p-3 text-black">Share with: alex@vt.edu (View Only)</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "2. Main Dashboard / Multi-View Agenda",
      description: "Daily, weekly, monthly, and priority-focused scheduling views with AI recommendations.",
      content: (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-1 bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="text-xl font-semibold mb-6">Tempo</div>
            <div className="space-y-3 text-sm">
              <div className="bg-white/10 rounded-xl px-3 py-2">Dashboard</div>
              <div className="rounded-xl px-3 py-2">Tasks</div>
              <div className="rounded-xl px-3 py-2">Focus Mode</div>
              <div className="rounded-xl px-3 py-2">Reports</div>
              <div className="rounded-xl px-3 py-2">Archive</div>
              <div className="rounded-xl px-3 py-2">Settings</div>
            </div>
          </div>
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-2xl font-semibold text-black">Monday Overview</div>
                  <div className="text-sm text-black">Next best task based on urgency, time, and focus hours</div>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="px-3 py-2 rounded-full bg-slate-900 text-white">Daily</span>
                  <span className="px-3 py-2 rounded-full bg-slate-100">Weekly</span>
                  <span className="px-3 py-2 rounded-full bg-slate-100">Monthly</span>
                  <span className="px-3 py-2 rounded-full bg-slate-100">Priority Only</span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-sm text-black mb-1">AI Suggestion</div>
                  <div className="font-semibold text-black">Finish OS Project Design</div>
                  <div className="text-sm mt-2 text-black">Urgency score: 93</div>
                  <div className="text-sm text-black">Best slot: 8:00 PM – 9:30 PM</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-sm text-black mb-1">Gap Analysis</div>
                  <div className="font-semibold text-black">2:00 PM – 3:00 PM free</div>
                  <div className="text-sm mt-2 text-black">Suggested task: SQL lab review</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 border">
                  <div className="text-sm text-black mb-1">Workload Alert</div>
                  <div className="font-semibold text-black">Thursday overloaded</div>
                  <div className="text-sm mt-2 text-black">8.5 hrs scheduled</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-4 text-black">Today's Timeline</div>
              <div className="space-y-3">
                {[
                  ["9:00 AM", "Database Homework", "High", "CS"],
                  ["1:00 PM", "Team Meeting", "Medium", "Project"],
                  ["3:30 PM", "Gym", "Low", "Personal"],
                  ["8:00 PM", "OS Project Design", "Critical", "CS"],
                ].map(([time, task, priority, cat]) => (
                  <div key={task} className="grid grid-cols-12 gap-3 items-center rounded-xl border p-3 text-sm">
                    <div className="col-span-2 font-medium text-black">{time}</div>
                    <div className="col-span-5 text-black">{task}</div>
                    <div className="col-span-2"><span className="px-2 py-1 rounded-full bg-slate-100 text-black">{priority}</span></div>
                    <div className="col-span-2 text-black">{cat}</div>
                    <div className="col-span-1 text-right">⋯</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "3. Task Creation + Bulk Processing",
      description: "Single-flow task entry, urgency logic, conflict detection, and multi-select actions.",
      content: (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border p-6 shadow-sm">
            <div className="text-xl font-semibold mb-5 text-black">Create New Task</div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="mb-1 text-black">Title</div>
                <div className="rounded-xl border p-3 text-black">Prepare design milestone</div>
              </div>
              <div>
                <div className="mb-1 text-black">Category</div>
                <div className="rounded-xl border p-3 text-black">School / CS4284</div>
              </div>
              <div className="md:col-span-2">
                <div className="mb-1 text-black">Description</div>
                <div className="rounded-xl border p-3 h-24 text-black">Finish diagrams, finalize report sections, and submit before midnight.</div>
              </div>
              <div>
                <div className="mb-1 text-black">Deadline</div>
                <div className="rounded-xl border p-3 text-black">Apr 18, 11:59 PM</div>
              </div>
              <div>
                <div className="mb-1 text-black">Estimated Duration</div>
                <div className="rounded-xl border p-3 text-black">2 hours</div>
              </div>
              <div>
                <div className="mb-1 text-black">Importance</div>
                <div className="rounded-xl border p-3 text-black">9 / 10</div>
              </div>
              <div>
                <div className="mb-1 text-black">Urgency Score</div>
                <div className="rounded-xl border p-3 bg-slate-50 text-black">Calculated: 91</div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
                  <button className="rounded-xl bg-slate-900 text-white px-4 py-3 font-medium">Save Task</button>
              <button className="rounded-xl border px-4 py-3 text-black">Preview Schedule Fit</button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Conflict Resolution</div>
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-black">
                This task overlaps with <span className="font-medium">Team Meeting</span> from 8:00 PM – 8:30 PM.
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="rounded-xl border p-3 text-black">Move new task to 8:30 PM</div>
                <div className="rounded-xl border p-3 text-black">Shorten meeting block</div>
                <div className="rounded-xl border p-3 text-black">Override and keep both</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Bulk Actions</div>
                <div className="text-sm text-black">3 selected</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl border p-3 text-black">Delete Selected</div>
                <div className="rounded-xl border p-3 text-black">Reschedule Selected</div>
                <div className="rounded-xl border p-3 text-black">Change Category</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "4. Focus Mode / Pomodoro",
      description: "Distraction mitigation, locked schedule editing, break prompts, and live progress tracking.",
      content: (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 text-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="text-sm uppercase tracking-widest text-black">Focus Session</div>
                <div className="text-3xl font-semibold text-white">Operating Systems Project</div>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/10 text-sm">Schedule Locked</div>
            </div>
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-56 h-56 rounded-full border-8 border-white/20 flex items-center justify-center text-5xl font-semibold">24:18</div>
              <div className="mt-5 text-black">Pomodoro Session 3 of 4</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-8 text-sm">
              <div className="rounded-2xl bg-white/5 p-4">Started: 8:00 PM</div>
              <div className="rounded-2xl bg-white/5 p-4">Category: CS4284</div>
              <div className="rounded-2xl bg-white/5 p-4">Break due in 24 min</div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Today's Weighted Progress</div>
              <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full w-2/3 bg-slate-900 rounded-full"></div>
              </div>
              <div className="mt-2 text-sm text-black">67% of weighted workload completed</div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Activity Log</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3 border text-black">7:00 PM – 7:25 PM · SQL review</div>
                <div className="rounded-xl bg-slate-50 p-3 border text-black">7:30 PM – 7:55 PM · Break</div>
                <div className="rounded-xl bg-slate-50 p-3 border text-black">8:00 PM – now · OS project</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Break Recommendation</div>
              <div className="text-sm text-black">Take a 5-minute break after this session to maintain focus quality.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "5. Reports / Search / Archive",
      description: "Analytics, keyword search, goal tracking, deletion recovery, and export tooling.",
      content: (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <div className="text-xl font-semibold text-black">Weekly Performance Analytics</div>
                  <div className="text-sm text-black">Focus time grouped by category</div>
                </div>
                <div className="flex gap-2 text-sm">
                  <button className="rounded-xl border px-4 py-2 text-black">Export PDF</button>
                  <button className="rounded-xl border px-4 py-2 text-black">Export CSV</button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4 items-end h-64">
                {[55, 80, 40, 95, 60].map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full rounded-t-2xl bg-slate-900" style={{ height: `${h * 2}px` }}></div>
                    <div className="text-xs text-black">{["CS", "Math", "Project", "Reading", "Personal"][i]}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Goal Progress</div>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1 text-black"><span>Graduate Strong</span><span>72%</span></div>
                  <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-slate-900 w-3/4"></div></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-black"><span>Finish Senior Project</span><span>48%</span></div>
                  <div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-slate-900 w-1/2"></div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Keyword Search</div>
              <div className="rounded-xl border p-3 text-sm mb-3 text-black">Search tasks, deadlines, notes...</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 border p-3 text-black">"SQL" → SQL Lab 9, SQL Study Guide</div>
                <div className="rounded-xl bg-slate-50 border p-3 text-black">"Design" → Project 4 Design Milestone</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Archive Recovery</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl border p-3 flex justify-between text-black"><span>Old Physics Notes</span><span className="text-blue-600">Restore</span></div>
                <div className="rounded-xl border p-3 flex justify-between text-black"><span>Deleted Meeting Block</span><span className="text-blue-600">Restore</span></div>
              </div>
              <div className="mt-3 text-xs text-black">Items remain recoverable for 30 days.</div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Task History / Versioning</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 border p-3 text-black">Apr 14 · Deadline changed from Apr 15 to Apr 18</div>
                <div className="rounded-xl bg-slate-50 border p-3 text-black">Apr 13 · Priority changed from 7 to 9</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "6. Notifications / Daily Briefing",
      description: "Escalating reminders, morning summary, and personalized schedule nudges.",
      content: (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
            <div className="text-xl font-semibold mb-5 text-black">Daily Morning Briefing</div>
            <div className="rounded-2xl bg-slate-50 border p-5 text-black">
              <div className="text-sm text-black">Good morning, Wilson. Here are your top 3 priorities.</div>
              <div className="space-y-3">
                {[
                  "1. Submit Project 4 Design Milestone — due today 11:59 PM",
                  "2. Review SQL Notebook 8 — estimated 45 minutes",
                  "3. Team sync at 1:00 PM — editable shared schedule event",
                ].map((item) => (
                  <div key={item} className="rounded-xl bg-white border p-3 text-sm text-black">{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Reminder Escalation</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl border p-3 text-black">2 hrs before deadline</div>
                <div className="rounded-xl border p-3 text-black">30 mins before deadline</div>
                <div className="rounded-xl border p-3 text-black">Marked critical if overdue</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="text-lg font-semibold mb-3 text-black">Personalization Settings</div>
              <div className="space-y-2 text-sm">
                <div className="rounded-xl bg-slate-50 border p-3 text-black">Peak productivity: 7 PM – 11 PM</div>
                <div className="rounded-xl bg-slate-50 border p-3 text-black">Reminder style: Push + Email</div>
                <div className="rounded-xl bg-slate-50 border p-3 text-black">Accessibility mode: Large text enabled</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex px-3 py-1 rounded-full bg-white border text-xs uppercase tracking-widest text-black mb-4">
            UI Mockups
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-3 text-black">Tempo Smart Scheduler</h1>
          <p className="text-black max-w-3xl text-lg">
            High-fidelity mock UI concepts covering authentication, task scheduling, AI recommendations, focus mode, analytics, notifications, and recovery workflows.
          </p>
        </div>

        <div className="space-y-10">
          {screens.map((screen) => (
            <section key={screen.title} className="space-y-3">
              <div>
                <h2 className="text-2xl font-semibold text-black">{screen.title}</h2>
                <p className="text-black">{screen.description}</p>
              </div>
              {screen.content}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
