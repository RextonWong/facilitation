"use client";

import { logout } from "@/lib/actions/auth";
import { LogOut, User } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import { NotificationBell } from "./notification-bell";

interface TopBarProps {
  user: Tables<"profiles"> | null;
  userId: string;
  unreadCount: number;
}

export function TopBar({ user, userId, unreadCount }: TopBarProps) {
  return (
    <header
      className="h-[68px] flex items-center justify-between px-10 shrink-0"
      style={{
        background: "rgba(13,21,38,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,49,96,0.6)",
        boxShadow: "0 1px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Left: subtle brand accent line */}
      <div
        className="hidden md:block h-5 w-px"
        style={{ background: "linear-gradient(180deg, transparent, #3b82f6, transparent)" }}
      />

      <div className="flex items-center gap-3">
        <NotificationBell userId={userId} initialUnread={unreadCount} />

        {/* Divider */}
        <div className="w-px h-5 bg-brand-800" />

        <div className="flex items-center gap-3 text-sm text-brand-300">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #1e40af, #1a3160)",
              boxShadow: "0 0 0 2px rgba(37,99,235,0.25)",
            }}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name ?? "User"}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <User size={16} className="text-brand-300" />
            )}
          </div>
          <span className="font-semibold text-white">{user?.display_name ?? "User"}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-brand-800" />

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 text-sm text-brand-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-brand-800"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
