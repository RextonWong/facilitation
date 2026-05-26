import { createClient } from "@/lib/supabase/server";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("sections")
    .select("id")
    .eq("project_id", id);

  const sectionIds = sections?.map((s) => s.id) ?? [];

  const { data: tasks } = sectionIds.length > 0
    ? await supabase
        .from("tasks")
        .select("id, title, status, due_date, completed_at")
        .in("section_id", sectionIds)
        .is("parent_task_id", null)
        .or("due_date.not.is.null,completed_at.not.is.null")
        .order("due_date", { ascending: true })
    : { data: [] };

  return <CalendarView tasks={tasks ?? []} />;
}
