"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0" style={{ background: "linear-gradient(180deg, #0d1526 0%, #0a1020 100%)", borderRight: "1px solid #1a3160" }}>
        {/* Logo */}
        <div className="px-6 py-7 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(26,49,96,0.6)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-base text-white" style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}>
            F
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ background: "linear-gradient(135deg, #bfdbfe, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Facilitation
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150",
                  active
                    ? "text-white"
                    : "text-brand-400 hover:text-white hover:bg-brand-800/60"
                )}
                style={active ? {
                  background: "linear-gradient(135deg, rgba(37,99,235,0.3) 0%, rgba(30,64,175,0.12) 100%)",
                  borderLeft: "2px solid #3b82f6",
                  boxShadow: "0 0 12px rgba(37,99,235,0.12)",
                } : {}}
              >
                <Icon size={18} className={active ? "text-brand-400" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer hint */}
        <div className="px-6 py-5" style={{ borderTop: "1px solid rgba(26,49,96,0.6)" }}>
          <p className="text-xs text-brand-600">Facilitation v1.0</p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around px-2 py-2" style={{ background: "rgba(13,21,38,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(26,49,96,0.7)" }}>
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all duration-150",
                active ? "text-brand-400" : "text-brand-600 hover:text-brand-400"
              )}
              style={active ? { background: "rgba(37,99,235,0.15)" } : {}}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
