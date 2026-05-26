import { createClient } from "@/lib/supabase/server";
import { Crown, User, UserMinus, LogOut } from "lucide-react";
import { InviteButton } from "@/components/projects/invite-button";
import { leaveProject, removeMember } from "@/lib/actions/members";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: members } = await supabase
    .from("project_members")
    .select("user_id, role, joined_at")
    .eq("project_id", id);

  const memberIds = members?.map((m) => m.user_id) ?? [];
  const { data: profiles } = memberIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", memberIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.id, p])
  );

  const myRole = members?.find((m) => m.user_id === user?.id)?.role;
  const isOwner = myRole === "owner";

  async function handleLeave() {
    "use server";
    await leaveProject(id);
  }

  async function handleRemove(userId: string) {
    "use server";
    await removeMember(id, userId);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white">Members</h2>
          <p className="text-brand-400 text-sm mt-1">{members?.length ?? 0} people in this project</p>
        </div>
        {isOwner && <InviteButton projectId={id} />}
      </div>

      <div className="space-y-3">
        {members?.sort((a, b) => (a.role === "owner" ? -1 : 1)).map((member) => {
          const profile = profileMap[member.user_id];
          const isMe = member.user_id === user?.id;
          const isMemberOwner = member.role === "owner";

          return (
            <div
              key={member.user_id}
              className="flex items-center gap-4 bg-brand-900 border border-brand-800 rounded-2xl px-5 py-4"
            >
              <div className="w-10 h-10 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-brand-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium truncate">
                    {profile?.display_name ?? "Unknown user"}
                  </p>
                  {isMe && (
                    <span className="text-xs text-brand-500">(you)</span>
                  )}
                </div>
                <p className="text-brand-500 text-xs mt-0.5">
                  Joined {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {isMemberOwner && <Crown size={13} className="text-yellow-500" />}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isMemberOwner
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-brand-800 text-brand-400 border border-brand-700"
                  }`}>
                    {member.role}
                  </span>
                </div>

                {isMe && !isMemberOwner && (
                  <form action={handleLeave}>
                    <button
                      type="submit"
                      className="p-1.5 text-brand-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Leave project"
                    >
                      <LogOut size={15} />
                    </button>
                  </form>
                )}

                {isOwner && !isMe && (
                  <form action={handleRemove.bind(null, member.user_id)}>
                    <button
                      type="submit"
                      className="p-1.5 text-brand-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
