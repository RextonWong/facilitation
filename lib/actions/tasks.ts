"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSection(projectId: string, name: string) {
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("sections")
    .select("order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const nextIndex = (last?.order_index ?? -1) + 1;

  const { error } = await supabase
    .from("sections")
    .insert({ project_id: projectId, name, order_index: nextIndex });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/board`);
}

export async function createTask(
  sectionId: string,
  projectId: string,
  title: string,
  assigneeId?: string,
  parentTaskId?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").insert({
    section_id: sectionId,
    title,
    assignee_id: assigneeId ?? null,
    parent_task_id: parentTaskId ?? null,
    status: "todo",
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/board`);
}

export async function updateTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "done",
  projectId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/board`);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath(`/projects/${projectId}/board`);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskAssignee(taskId: string, assigneeId: string | null, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/board`);
}

export async function updateTaskDueDate(taskId: string, dueDate: string | null, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ due_date: dueDate })
    .eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/board`);
  revalidatePath(`/projects/${projectId}/calendar`);
}
