"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as "individual" | "paired" | "specialisation";

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ name, description, type, owner_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };

  // Auto-add owner as a member
  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function createInvite(projectId: string, email?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const code = nanoid(10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("project_invites")
    .insert({
      project_id: projectId,
      code,
      email: email ?? null,
      created_by: user.id,
      expires_at: expiresAt,
      max_uses: 1,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { code: data.code };
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Project name is required" };

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      description: (formData.get("description") as string)?.trim() || null,
      type: formData.get("type") as "individual" | "paired" | "specialisation",
    })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/settings`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinProject(code: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: invite, error: inviteError } = await supabase
    .from("project_invites")
    .select("*")
    .eq("code", code)
    .single();

  if (inviteError || !invite) return { error: "Invalid invite code" };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: "Invite has expired" };
  }
  if (invite.use_count >= invite.max_uses) {
    return { error: "Invite has already been used" };
  }

  // Add member
  const { error: memberError } = await supabase
    .from("project_members")
    .insert({ project_id: invite.project_id, user_id: user.id, role: "member" });

  if (memberError) {
    if (memberError.code === "23505") return { error: "Already a member" };
    return { error: memberError.message };
  }

  // Increment use count
  await supabase
    .from("project_invites")
    .update({ use_count: invite.use_count + 1 })
    .eq("id", invite.id);

  revalidatePath("/dashboard");
  redirect(`/projects/${invite.project_id}`);
}
