import { createClient } from "@/lib/supabase/server";
import { ChatView } from "@/components/chat/chat-view";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at")
    .eq("project_id", id)
    .is("recipient_id", null)
    .order("created_at", { ascending: true })
    .limit(100);

  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
  const { data: profiles } = senderIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", senderIds)
    : { data: [] };

  return (
    <ChatView
      projectId={id}
      initialMessages={messages ?? []}
      currentUserId={user!.id}
      profiles={profiles ?? []}
    />
  );
}
