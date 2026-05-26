"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", suffix: "" },
  { label: "Board", suffix: "/board" },
  { label: "Calendar", suffix: "/calendar" },
  { label: "Chat", suffix: "/chat" },
  { label: "Members", suffix: "/members" },
  { label: "Settings", suffix: "/settings" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav className="flex gap-2 border-b border-brand-800 overflow-x-auto">
      {tabs.map(({ label, suffix }) => {
        const href = `${base}${suffix}`;
        const active = suffix === ""
          ? pathname === base
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              active
                ? "border-brand-500 text-white"
                : "border-transparent text-brand-400 hover:text-brand-200"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
