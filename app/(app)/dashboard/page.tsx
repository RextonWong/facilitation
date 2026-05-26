import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/projects/project-card";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { JoinProjectButton } from "@/components/projects/join-project-button";
import { FolderKanban } from "lucide-react";

export const metadata = { title: "Dashboard — Facilitation" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id, role")
    .eq("user_id", user!.id);

  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds.length > 0 ? projectIds : ["none"])
    .order("created_at", { ascending: false });

  const { data: progress } = await supabase
    .from("project_progress")
    .select("*")
    .in("project_id", projectIds.length > 0 ? projectIds : ["none"]);

  const progressMap = Object.fromEntries(
    (progress ?? []).map((p) => [p.project_id, p])
  );

  const count = projects?.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-brand-400 mt-2">
            {count === 0 ? "No projects yet" : `${count} project${count !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-3">
          <JoinProjectButton />
          <NewProjectButton />
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              progress={progressMap[project.id] ?? null}
              role={memberships?.find((m) => m.project_id === project.id)?.role ?? "member"}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 rounded-3xl bg-brand-800 border border-brand-700 flex items-center justify-center mb-8">
            <FolderKanban size={40} className="text-brand-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">No projects yet</h2>
          <p className="text-brand-400 text-base mb-10 max-w-sm leading-relaxed">
            Create your first project to get started, or join an existing one with an invite code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
            <JoinProjectButton />
            <NewProjectButton />
          </div>
        </div>
      )}
    </div>
  );
}
