import { createClient } from "@/lib/supabase/server";
import { SectionProgressChart } from "@/components/charts/section-progress-chart";
import { MemberProgressList } from "@/components/charts/member-progress-list";
import { notFound } from "next/navigation";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: sectionProgress }, { data: memberProgress }, { data: overall }] =
    await Promise.all([
      supabase.from("section_progress").select("*").eq("project_id", id),
      supabase.from("member_progress").select("*").eq("project_id", id),
      supabase.from("project_progress").select("*").eq("project_id", id).single(),
    ]);

  if (!sectionProgress) notFound();

  const overallPct = overall?.overall_pct ?? 0;
  const totalTasks = overall?.total_tasks ?? 0;
  const completedTasks = overall?.completed_tasks ?? 0;

  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
          <p className="text-brand-400 text-xs font-medium uppercase tracking-widest mb-3">
            Overall Progress
          </p>
          <p className="text-4xl font-bold text-white mb-4">{overallPct}%</p>
          <div className="h-2 bg-brand-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
          <p className="text-brand-400 text-xs font-medium uppercase tracking-widest mb-3">
            Tasks Done
          </p>
          <p className="text-4xl font-bold text-white">
            {completedTasks}
            <span className="text-brand-500 text-2xl font-normal">
              /{totalTasks}
            </span>
          </p>
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-7 col-span-2 md:col-span-1">
          <p className="text-brand-400 text-xs font-medium uppercase tracking-widest mb-3">
            Sections
          </p>
          <p className="text-4xl font-bold text-white">
            {sectionProgress.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
          <h2 className="text-base font-semibold text-brand-200 mb-6">
            Progress by section
          </h2>
          <SectionProgressChart data={sectionProgress} />
        </div>

        <div className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
          <h2 className="text-base font-semibold text-brand-200 mb-6">
            Progress by member
          </h2>
          <MemberProgressList data={memberProgress ?? []} />
        </div>
      </div>
    </div>
  );
}
