import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { User, MessageSquare } from "lucide-react";

export const metadata = { title: "Messages — Facilitation" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all DMs involving this user
  const { data: dms } = await supabase
    .from("messages")
    .select("id, body, sender_id, recipient_id, created_at")
    .not("recipient_id", "is", null)
    .is("project_id", null)
    .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  // Group by conversation partner
  const conversationMap = new Map<string, { partnerId: string; lastMessage: string; lastAt: string }>();
  for (const msg of dms ?? []) {
    const partnerId = msg.sender_id === user!.id ? msg.recipient_id : msg.sender_id;
    if (!partnerId) continue;
    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        partnerId,
        lastMessage: msg.body,
        lastAt: msg.created_at,
      });
    }
  }
  const conversations = [...conversationMap.values()];

  // Fetch partner profiles
  const partnerIds = conversations.map((c) => c.partnerId);
  const { data: profiles } = partnerIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", partnerIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  // Also fetch all project members to allow starting new DMs
  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user!.id);
  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  const { data: allMembers } = projectIds.length > 0
    ? await supabase
        .from("project_members")
        .select("user_id")
        .in("project_id", projectIds)
        .neq("user_id", user!.id)
    : { data: [] };
  const uniqueMemberIds = [...new Set((allMembers ?? []).map((m) => m.user_id))];
  const newConversationIds = uniqueMemberIds.filter((id) => !conversationMap.has(id));

  const { data: newProfiles } = newConversationIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", newConversationIds)
    : { data: [] };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Direct Messages</h1>

      {conversations.length === 0 && newConversationIds.length === 0 && (
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-12 text-center">
          <MessageSquare size={32} className="text-brand-600 mx-auto mb-4" />
          <p className="text-brand-300 font-medium">No messages yet</p>
          <p className="text-brand-500 text-sm mt-2">Join a project to message teammates.</p>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3">Recent</h2>
          <div className="space-y-2">
            {conversations.map((conv) => {
              const profile = profileMap[conv.partnerId];
              return (
                <Link
                  key={conv.partnerId}
                  href={`/messages/${conv.partnerId}`}
                  className="flex items-center gap-4 bg-brand-900 border border-brand-800 rounded-2xl px-5 py-4 hover:bg-brand-800/50 hover:border-brand-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User size={18} className="text-brand-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{profile?.display_name ?? "Unknown"}</p>
                    <p className="text-brand-500 text-xs truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  <span className="text-brand-600 text-xs shrink-0">
                    {new Date(conv.lastAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {newProfiles && newProfiles.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3">Teammates</h2>
          <div className="space-y-2">
            {newProfiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/messages/${profile.id}`}
                className="flex items-center gap-4 bg-brand-900 border border-brand-800 rounded-2xl px-5 py-4 hover:bg-brand-800/50 hover:border-brand-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User size={18} className="text-brand-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{profile.display_name ?? "Unknown"}</p>
                  <p className="text-brand-500 text-xs mt-0.5">Start a conversation</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
