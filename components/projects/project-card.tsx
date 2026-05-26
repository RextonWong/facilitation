"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";

interface ProjectCardProps {
  project: Tables<"projects">;
  progress: { overall_pct: number | null; total_tasks: number | null; completed_tasks: number | null } | null;
  role: "owner" | "member";
}

const typeLabels = {
  individual: "Individual",
  paired: "Team",
  specialisation: "Team",
};

const typeAccent = {
  individual: { gradient: "linear-gradient(90deg, #2563eb, #1e40af)", badge: "rgba(37,99,235,0.15)", badgeText: "#60a5fa", border: "rgba(37,99,235,0.4)" },
  paired:     { gradient: "linear-gradient(90deg, #7c3aed, #4f46e5)", badge: "rgba(124,58,237,0.15)", badgeText: "#a78bfa", border: "rgba(124,58,237,0.4)" },
  specialisation: { gradient: "linear-gradient(90deg, #7c3aed, #4f46e5)", badge: "rgba(124,58,237,0.15)", badgeText: "#a78bfa", border: "rgba(124,58,237,0.4)" },
};

export function ProjectCard({ project, progress, role }: ProjectCardProps) {
  const pct = progress?.overall_pct ?? 0;
  const accent = typeAccent[project.type];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-2xl overflow-hidden transition-all duration-200 group"
      style={{
        background: "linear-gradient(160deg, #0d1526 0%, #0a1020 100%)",
        border: "1px solid rgba(26,49,96,0.7)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px ${accent.border}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
      }}
    >
      {/* Accent strip */}
      <div className="h-1 w-full" style={{ background: accent.gradient }} />

      <div className="p-7">
        <div className="flex items-start justify-between mb-5">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: accent.badge, color: accent.badgeText, border: `1px solid ${accent.border}` }}
          >
            {typeLabels[project.type]}
          </span>
          {role === "owner" && (
            <Crown size={15} className="text-yellow-400 mt-0.5" style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.4))" }} />
          )}
        </div>

        <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 transition-colors group-hover:text-brand-300">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-brand-400 text-sm line-clamp-2 mb-6 leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between text-xs text-brand-400 mb-2">
            <span>Progress</span>
            <span className="font-bold text-sm" style={{ color: accent.badgeText }}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-brand-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: accent.gradient, boxShadow: `0 0 6px ${accent.border}` }}
            />
          </div>
          {progress && (
            <p className="text-xs text-brand-500 mt-3">
              {progress.completed_tasks ?? 0} / {progress.total_tasks ?? 0} tasks done
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
