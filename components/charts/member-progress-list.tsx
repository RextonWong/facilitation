interface MemberData {
  display_name: string | null;
  progress_pct: number | null;
  completed_tasks: number | null;
  total_tasks: number | null;
}

export function MemberProgressList({ data }: { data: MemberData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-brand-500 text-sm text-center py-12">
        No members yet
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((member, i) => {
        const pct = member.progress_pct ?? 0;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-brand-200 font-medium text-sm">
                {member.display_name ?? "Unknown"}
              </span>
              <span className="text-brand-400 text-xs">
                {member.completed_tasks ?? 0}/{member.total_tasks ?? 0} tasks · {pct}%
              </span>
            </div>
            <div className="h-2.5 bg-brand-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct === 100 ? "#22c55e" : "#2563eb",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
