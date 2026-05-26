"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function leaveProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (member?.role === "owner") {
    const { count } = await supabase
      .from("project_members")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    if ((count ?? 0) > 1) {
      return { error: "Transfer ownership before leaving." };
    }
  }

  await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  revalidatePath(`/projects/${projectId}/members`);
}
