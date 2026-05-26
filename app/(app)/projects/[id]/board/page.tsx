import { createClient } from "@/lib/supabase/server";
import { BoardView } from "@/components/board/board-view";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: sectionIds } = await supabase
    .from("sections")
    .select("id")
    .eq("project_id", id);

  const [{ data: sections }, { data: tasks }, { data: members }] =
    await Promise.all([
      supabase
        .from("sections")
        .select("*")
        .eq("project_id", id)
        .order("order_index"),
      supabase
        .from("tasks")
        .select("*")
        .in("section_id", sectionIds?.map((s) => s.id) ?? [])
        .order("created_at"),
      supabase
        .from("project_members")
        .select("user_id, role")
        .eq("project_id", id),
    ]);

  // Fetch profiles for all members
  const memberUserIds = members?.map((m) => m.user_id) ?? [];
  const { data: profiles } = memberUserIds.length > 0
    ? await supabase.from("profiles").select("id, display_name").in("id", memberUserIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p.display_name])
  );

  const membersWithNames = (members ?? []).map((m) => ({
    ...m,
    display_name: profileMap[m.user_id] ?? null,
  }));

  return (
    <BoardView
      projectId={id}
      sections={sections ?? []}
      tasks={tasks ?? []}
      members={membersWithNames}
      currentUserId={user!.id}
    />
  );
}
