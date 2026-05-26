"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  due_date: string | null;
  completed_at: string | null;
};

const STATUS_COLORS = {
  done: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  todo: "bg-brand-700/50 text-brand-300 border-brand-600/30",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const [view, setView] = useState<"month" | "week">("month");
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [selected, setSelected] = useState<string | null>(null);

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.due_date ?? (t.completed_at ? t.completed_at.slice(0, 10) : null);
    if (key) {
      acc[key] = [...(acc[key] ?? []), t];
    }
    return acc;
  }, {});

  const selectedTasks = selected ? (tasksByDate[selected] ?? []) : [];

  function prevMonth() {
    setCurrent((c) => {
      if (c.month === 0) return { year: c.year - 1, month: 11 };
      return { year: c.year, month: c.month - 1 };
    });
    setSelected(null);
  }
  function nextMonth() {
    setCurrent((c) => {
      if (c.month === 11) return { year: c.year + 1, month: 0 };
      return { year: c.year, month: c.month + 1 };
    });
    setSelected(null);
  }
  function prevWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    setSelected(null);
  }
  function nextWeek() {
    setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    setSelected(null);
  }

  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={view === "month" ? prevMonth : prevWeek}
            className="p-2 rounded-xl text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-lg font-semibold text-white min-w-40 text-center">
            {view === "month"
              ? `${MONTHS[current.month]} ${current.year}`
              : (() => {
                  const end = new Date(weekStart);
                  end.setDate(end.getDate() + 6);
                  return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
                })()
            }
          </h3>
          <button
            onClick={view === "month" ? nextMonth : nextWeek}
            className="p-2 rounded-xl text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCurrent({ year: now.getFullYear(), month: now.getMonth() });
              const d = new Date(now);
              d.setDate(d.getDate() - d.getDay());
              setWeekStart(d);
              setSelected(null);
            }}
            className="ml-2 px-3 py-1.5 text-xs text-brand-400 border border-brand-700 rounded-lg hover:bg-brand-800 hover:text-white transition-colors"
          >
            Today
          </button>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-brand-900 border border-brand-800 rounded-xl p-1">
          <button
            onClick={() => { setView("month"); setSelected(null); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              view === "month" ? "bg-brand-700 text-white" : "text-brand-400 hover:text-brand-200"
            )}
          >
            <Calendar size={14} /> Month
          </button>
          <button
            onClick={() => { setView("week"); setSelected(null); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              view === "week" ? "bg-brand-700 text-white" : "text-brand-400 hover:text-brand-200"
            )}
          >
            <List size={14} /> Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          {view === "month" ? (
            <MonthGrid
              year={current.year}
              month={current.month}
              todayStr={todayStr}
              tasksByDate={tasksByDate}
              selected={selected}
              onSelect={setSelected}
            />
          ) : (
            <WeekGrid
              weekStart={weekStart}
              todayStr={todayStr}
              tasksByDate={tasksByDate}
              selected={selected}
              onSelect={setSelected}
            />
          )}
        </div>

        {/* Side panel */}
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-5">
          {selected ? (
            <>
              <h4 className="text-sm font-semibold text-white mb-4">
                {new Date(selected + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric",
                })}
              </h4>
              {selectedTasks.length === 0 ? (
                <p className="text-brand-500 text-sm">No tasks on this day.</p>
              ) : (
                <div className="space-y-2.5">
                  {selectedTasks.map((t) => (
                    <div key={t.id} className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm",
                      STATUS_COLORS[t.status]
                    )}>
                      <p className={cn("font-medium", t.status === "done" && "line-through opacity-70")}>
                        {t.title}
                      </p>
                      <p className="text-xs mt-0.5 opacity-70 capitalize">{t.status.replace("_", " ")}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar size={28} className="text-brand-700 mx-auto mb-3" />
              <p className="text-brand-500 text-sm">Select a day to see tasks</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  year, month, todayStr, tasksByDate, selected, onSelect,
}: {
  year: number; month: number; todayStr: string;
  tasksByDate: Record<string, Task[]>; selected: string | null;
  onSelect: (d: string) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-brand-800">
        {DAYS.map((d) => (
          <div key={d} className="py-3 text-center text-xs font-medium text-brand-500">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-20 border-r border-b border-brand-800/50 last:border-r-0" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayTasks = tasksByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;

          return (
            <button
              key={i}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "h-20 p-1.5 border-r border-b border-brand-800/50 text-left transition-colors hover:bg-brand-800/40",
                (i + 1) % 7 === 0 && "border-r-0",
                isSelected && "bg-brand-800/60",
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
                isToday ? "bg-brand-500 text-white" : "text-brand-300",
              )}>
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <div key={t.id} className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded truncate",
                    t.status === "done" ? "bg-green-500/20 text-green-400"
                    : t.status === "in_progress" ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-brand-700 text-brand-300"
                  )}>
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-brand-500 px-1">+{dayTasks.length - 2} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({
  weekStart, todayStr, tasksByDate, selected, onSelect,
}: {
  weekStart: Date; todayStr: string;
  tasksByDate: Record<string, Task[]>; selected: string | null;
  onSelect: (d: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-brand-800">
        {days.map((d) => (
          <div key={d.toISOString()} className="py-3 text-center text-xs font-medium text-brand-500">
            {DAYS[d.getDay()]}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-48">
        {days.map((d) => {
          const dateStr = d.toISOString().slice(0, 10);
          const dayTasks = tasksByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selected;

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className={cn(
                "p-2 border-r border-brand-800/50 text-left transition-colors hover:bg-brand-800/40 last:border-r-0",
                isSelected && "bg-brand-800/60",
              )}
            >
              <span className={cn(
                "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-2",
                isToday ? "bg-brand-500 text-white" : "text-brand-300",
              )}>
                {d.getDate()}
              </span>
              <div className="space-y-1">
                {dayTasks.map((t) => (
                  <div key={t.id} className={cn(
                    "text-[10px] px-1.5 py-1 rounded-lg truncate border",
                    STATUS_COLORS[t.status]
                  )}>
                    {t.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
