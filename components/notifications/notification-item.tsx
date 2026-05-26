"use client";

import { useTransition } from "react";
import { markNotificationRead } from "@/lib/actions/notifications";
import { CheckCircle, Bell, MessageSquare, Users, ClipboardList } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

type Notification = Tables<"notifications">;

const typeIcon: Record<string, React.ReactNode> = {
  task_assigned: <ClipboardList size={16} />,
  task_completed: <CheckCircle size={16} />,
  new_message: <MessageSquare size={16} />,
  member_joined: <Users size={16} />,
  project_invite: <Users size={16} />,
};

const typeLabel: Record<string, string> = {
  task_assigned: "Task assigned to you",
  task_completed: "Task completed",
  new_message: "New message",
  member_joined: "Member joined",
  project_invite: "Project invitation",
};

function payloadSummary(type: string, payload: Record<string, unknown>): string {
  if (type === "task_assigned" && payload.task_title) return `"${payload.task_title}"`;
  if (type === "task_completed" && payload.task_title) return `"${payload.task_title}"`;
  if (type === "new_message" && payload.sender_name) return `from ${payload.sender_name}`;
  if (type === "member_joined" && payload.user_name && payload.project_name)
    return `${payload.user_name} joined ${payload.project_name}`;
  if (type === "project_invite" && payload.project_name) return `to "${payload.project_name}"`;
  return "";
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const [pending, startTransition] = useTransition();
  const isUnread = !notification.read_at;
  const payload = (notification.payload ?? {}) as Record<string, unknown>;
  const summary = payloadSummary(notification.type, payload);

  function handleRead() {
    if (!isUnread) return;
    startTransition(() => markNotificationRead(notification.id));
  }

  return (
    <div
      className={`flex items-start gap-4 bg-brand-900 border rounded-xl px-4 py-3.5 transition-colors ${
        isUnread ? "border-brand-600" : "border-brand-800 opacity-70"
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${isUnread ? "text-brand-400" : "text-brand-600"}`}>
        {typeIcon[notification.type] ?? <Bell size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-brand-200 font-medium">
          {typeLabel[notification.type] ?? notification.type}
        </p>
        {summary && <p className="text-sm text-brand-400 mt-0.5 truncate">{summary}</p>}
        <p className="text-xs text-brand-600 mt-1">
          {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>

      {isUnread && (
        <button
          disabled={pending}
          onClick={handleRead}
          className="shrink-0 mt-0.5 text-brand-500 hover:text-brand-300 transition-colors disabled:opacity-50"
          title="Mark as read"
        >
          <CheckCircle size={16} />
        </button>
      )}
    </div>
  );
}
