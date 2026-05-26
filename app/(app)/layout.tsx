import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={profile} userId={user.id} unreadCount={unreadCount ?? 0} />
        <main className="flex-1 overflow-y-auto p-4 md:p-14 pb-20 md:pb-14">{children}</main>
      </div>
    </div>
  );
}
