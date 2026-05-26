"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SectionData {
  name: string | null;
  progress_pct: number | null;
  total_tasks: number | null;
  completed_tasks: number | null;
}

export function SectionProgressChart({ data }: { data: SectionData[] }) {
  if (data.length === 0) {
    return (
      <p className="text-brand-500 text-sm text-center py-8">
        No sections yet
      </p>
    );
  }

  const chartData = data.map((s) => {
    const name = s.name ?? "Unnamed";
    return {
      name: name.length > 12 ? name.slice(0, 12) + "…" : name,
      fullName: name,
      pct: s.progress_pct ?? 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barSize={28}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#93c5fd", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#60a5fa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          width={36}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-brand-800 border border-brand-700 rounded-lg px-3 py-2 text-xs text-white">
                <p className="font-medium mb-0.5">{d.fullName}</p>
                <p className="text-brand-300">{d.pct}% complete</p>
              </div>
            );
          }}
        />
        <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pct === 100 ? "#22c55e" : "#2563eb"}
              opacity={0.9}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
