import { createClient } from "@/lib/supabase/server";
import { DmView } from "@/components/chat/dm-view";
import { notFound } from "next/navigation";

export default async function DmPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, body, sender_id, created_at")
    .is("project_id", null)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .limit(100);

  const [partnerRes, myRes] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url").eq("id", userId).single(),
    supabase.from("profiles").select("id, display_name, avatar_url").eq("id", user.id).single(),
  ]);

  return (
    <DmView
      partnerId={userId}
      currentUserId={user.id}
      initialMessages={messages ?? []}
      partnerProfile={partnerRes.data}
      myProfile={myRes.data}
    />
  );
}
