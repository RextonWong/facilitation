"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";
import { CheckCheck, Loader2 } from "lucide-react";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsRead())}
      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-400 hover:text-white border border-brand-700 hover:border-brand-500 rounded-xl transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
      Mark all read
    </button>
  );
}
