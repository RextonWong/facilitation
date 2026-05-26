import { createClient } from "@/lib/supabase/server";
import { Bell } from "lucide-react";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { NotificationItem } from "@/components/notifications/notification-item";

export const metadata = { title: "Notifications — Facilitation" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const hasUnread = notifications?.some((n) => !n.read_at) ?? false;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      ) : (
        <div className="bg-brand-900 border border-brand-800 rounded-xl p-8 text-center">
          <Bell size={28} className="text-brand-600 mx-auto mb-3" />
          <p className="text-brand-400 text-sm">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
