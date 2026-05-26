import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectSettingsForm } from "@/components/projects/project-settings-form";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) return notFound();

  // Only owner can access settings
  const { data: membership } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", id)
    .eq("user_id", user!.id)
    .single();

  if (membership?.role !== "owner") return notFound();

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white">Project Settings</h2>
        <p className="text-brand-400 text-sm mt-1">Manage this project's details and access.</p>
      </div>
      <ProjectSettingsForm project={project} />
    </div>
  );
}
