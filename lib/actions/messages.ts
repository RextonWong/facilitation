"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendProjectMessage(projectId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!body.trim()) return { error: "Message cannot be empty" };

  const { error } = await supabase.from("messages").insert({
    project_id: projectId,
    sender_id: user.id,
    body: body.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}/chat`);
}

export async function sendDirectMessage(recipientId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  if (!body.trim()) return { error: "Message cannot be empty" };

  const { error } = await supabase.from("messages").insert({
    recipient_id: recipientId,
    sender_id: user.id,
    body: body.trim(),
  });

  if (error) return { error: error.message };
  revalidatePath(`/messages/${recipientId}`);
}
