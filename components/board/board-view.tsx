"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  Plus, CheckCircle2, Circle, Clock, Trash2,
  ChevronDown, ChevronRight, UserCircle, Calendar,
} from "lucide-react";
import {
  createSection, createTask, updateTaskStatus,
  deleteTask, updateTaskAssignee, updateTaskDueDate,
} from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  section_id: string;
  parent_task_id: string | null;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignee_id: string | null;
  due_date: string | null;
};

type Section = { id: string; name: string; order_index: number };
type Member = { user_id: string; role: string; display_name: string | null };

interface BoardViewProps {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  members: Member[];
  currentUserId: string;
}

const statusIcons = {
  todo: <Circle size={17} className="text-brand-500" />,
  in_progress: <Clock size={17} className="text-yellow-400" />,
  done: <CheckCircle2 size={17} className="text-green-500" />,
};

const nextStatus = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
} as const;

function AssigneeMenu({
  taskId,
  projectId,
  assigneeId,
  members,
}: {
  taskId: string;
  projectId: string;
  assigneeId: string | null;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const assignee = members.find((m) => m.user_id === assigneeId);

  function assign(userId: string | null) {
    startTransition(() => void updateTaskAssignee(taskId, userId, projectId));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "p-1.5 rounded transition-colors",
          assignee ? "text-brand-300 hover:text-white" : "text-brand-500 hover:text-brand-300"
        )}
        title={assignee ? `Assigned: ${assignee.display_name}` : "Assign member"}
      >
        <UserCircle size={13} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-brand-800 border border-brand-700 rounded-xl shadow-lg z-20 py-1 w-36">
          {members.map((m) => (
            <button
              key={m.user_id}
              onClick={() => assign(m.user_id)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs hover:bg-brand-700 transition-colors",
                m.user_id === assigneeId ? "text-white font-medium" : "text-brand-200"
              )}
            >
              {m.display_name ?? "Unknown"}
            </button>
          ))}
          {assigneeId && (
            <button
              onClick={() => assign(null)}
              className="w-full text-left px-3 py-2 text-xs text-brand-500 hover:bg-brand-700 hover:text-brand-300 border-t border-brand-700"
            >
              Unassign
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DueDateButton({
  taskId,
  projectId,
  dueDate,
}: {
  taskId: string;
  projectId: string;
  dueDate: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleChange(value: string) {
    startTransition(() => void updateTaskDueDate(taskId, value || null, projectId));
    setOpen(false);
  }

  const isOverdue = dueDate
    ? new Date(dueDate) < new Date(new Date().toDateString())
    : false;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "p-1.5 rounded transition-colors",
          dueDate
            ? isOverdue ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"
            : "text-brand-500 hover:text-brand-300"
        )}
        title={dueDate ? `Due: ${dueDate}` : "Set due date"}
      >
        <Calendar size={13} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-brand-800 border border-brand-700 rounded-xl shadow-lg z-20 p-3">
          <input
            type="date"
            defaultValue={dueDate ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-brand-700 border border-brand-600 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            style={{ colorScheme: "dark" }}
          />
          {dueDate && (
            <button
              onClick={() => handleChange("")}
              className="block w-full mt-2 text-xs text-brand-500 hover:text-brand-300 text-center"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  projectId,
  subtasks,
  members,
}: {
  task: Task;
  projectId: string;
  subtasks: Task[];
  members: Member[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [, startTransition] = useTransition();

  const assignee = members.find((m) => m.user_id === task.assignee_id);
  const isOverdue = task.due_date
    ? new Date(task.due_date) < new Date(new Date().toDateString()) && task.status !== "done"
    : false;

  const handleToggleStatus = () => {
    startTransition(() => {
      updateTaskStatus(task.id, nextStatus[task.status], projectId);
    });
  };

  const handleDelete = () => {
    startTransition(() => {
      deleteTask(task.id, projectId);
    });
  };

  const handleAddSubtask = () => {
    if (!subTitle.trim()) return;
    startTransition(() => {
      createTask(task.section_id, projectId, subTitle.trim(), undefined, task.id);
      setSubTitle("");
      setAddingSub(false);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-brand-800 group transition-colors">
        <button onClick={handleToggleStatus} className="shrink-0">
          {statusIcons[task.status]}
        </button>

        {subtasks.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0 text-brand-500">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        <span
          className={cn(
            "flex-1 text-sm leading-snug min-w-0 truncate",
            task.status === "done" ? "line-through text-brand-500" : "text-brand-100"
          )}
        >
          {task.title}
        </span>

        {/* Metadata chips — always visible */}
        <div className="flex items-center gap-1 shrink-0">
          {assignee && (
            <span className="text-xs text-brand-500 hidden sm:block px-1.5 py-0.5 bg-brand-800 rounded-md">
              {assignee.display_name}
            </span>
          )}
          {task.due_date && (
            <span className={cn(
              "text-xs hidden sm:block px-1.5 py-0.5 rounded-md",
              isOverdue ? "text-red-400 bg-red-500/10" : "text-brand-500 bg-brand-800"
            )}>
              {task.due_date}
            </span>
          )}
        </div>

        {/* Action buttons — appear on hover */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <AssigneeMenu taskId={task.id} projectId={projectId} assigneeId={task.assignee_id} members={members} />
          <DueDateButton taskId={task.id} projectId={projectId} dueDate={task.due_date} />
          <button
            onClick={() => setAddingSub(true)}
            className="p-1.5 text-brand-500 hover:text-brand-300 rounded"
            title="Add subtask"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-brand-500 hover:text-red-400 rounded"
            title="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {expanded && subtasks.length > 0 && (
        <div className="ml-9 border-l-2 border-brand-800 pl-3 mt-1 space-y-0.5">
          {subtasks.map((sub) => (
            <TaskRow key={sub.id} task={sub} projectId={projectId} subtasks={[]} members={members} />
          ))}
        </div>
      )}

      {addingSub && (
        <div className="ml-9 pl-3 mt-2 mb-1">
          <input
            autoFocus
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") { setAddingSub(false); setSubTitle(""); }
            }}
            placeholder="Subtask name…"
            className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-lg text-white placeholder-brand-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}
    </div>
  );
}

function SectionColumn({
  section,
  tasks,
  projectId,
  members,
}: {
  section: Section;
  tasks: Task[];
  projectId: string;
  members: Member[];
}) {
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [, startTransition] = useTransition();

  const topLevelTasks = tasks.filter((t) => !t.parent_task_id);
  const subtasksOf = (taskId: string) => tasks.filter((t) => t.parent_task_id === taskId);
  const done = topLevelTasks.filter((t) => t.status === "done").length;

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    startTransition(() => {
      createTask(section.id, projectId, taskTitle.trim());
      setTaskTitle("");
      setAddingTask(false);
    });
  };

  return (
    <div className="bg-brand-900 border border-brand-800 rounded-2xl min-w-80 w-80 shrink-0 flex flex-col">
      <div className="px-5 py-4 border-b border-brand-800 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{section.name}</h3>
          <p className="text-xs text-brand-500 mt-1">{done} / {topLevelTasks.length} done</p>
        </div>
        <div className="h-1.5 w-20 bg-brand-800 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{
              width: topLevelTasks.length > 0
                ? `${(done / topLevelTasks.length) * 100}%`
                : "0%",
            }}
          />
        </div>
      </div>

      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto max-h-[60vh]">
        {topLevelTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            projectId={projectId}
            subtasks={subtasksOf(task.id)}
            members={members}
          />
        ))}

        {addingTask && (
          <div className="px-1 py-1">
            <input
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
                if (e.key === "Escape") { setAddingTask(false); setTaskTitle(""); }
              }}
              placeholder="Task name…"
              className="w-full px-3 py-2 text-sm bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-brand-800">
        <button
          onClick={() => setAddingTask(true)}
          className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-300 transition-colors w-full px-2 py-2 rounded-xl hover:bg-brand-800"
        >
          <Plus size={15} /> Add task
        </button>
      </div>
    </div>
  );
}

export function BoardView({ projectId, sections, tasks, members }: BoardViewProps) {
  const [addingSection, setAddingSection] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [, startTransition] = useTransition();

  const handleAddSection = () => {
    if (!sectionName.trim()) return;
    startTransition(() => {
      createSection(projectId, sectionName.trim());
      setSectionName("");
      setAddingSection(false);
    });
  };

  const tasksBySection = (sectionId: string) =>
    tasks.filter((t) => t.section_id === sectionId);

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {sections.map((section) => (
        <SectionColumn
          key={section.id}
          section={section}
          tasks={tasksBySection(section.id)}
          projectId={projectId}
          members={members}
        />
      ))}

      <div className="min-w-64 shrink-0">
        {addingSection ? (
          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-5">
            <input
              autoFocus
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSection();
                if (e.key === "Escape") { setAddingSection(false); setSectionName(""); }
              }}
              placeholder="Section name…"
              className="w-full px-3 py-2.5 text-sm bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:border-brand-500 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddSection}
                className="flex-1 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium"
              >
                Add
              </button>
              <button
                onClick={() => { setAddingSection(false); setSectionName(""); }}
                className="flex-1 py-2 text-sm border border-brand-700 text-brand-400 rounded-xl hover:bg-brand-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingSection(true)}
            className="flex items-center gap-2 px-5 py-4 border-2 border-dashed border-brand-800 rounded-2xl text-brand-500 hover:text-brand-300 hover:border-brand-600 transition-colors text-sm w-full"
          >
            <Plus size={16} /> Add section
          </button>
        )}
      </div>
    </div>
  );
}
