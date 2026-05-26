"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, User, ArrowLeft } from "lucide-react";
import { sendDirectMessage } from "@/lib/actions/messages";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Message = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

type Profile = { id: string; display_name: string | null; avatar_url: string | null };

export function DmView({
  partnerId,
  currentUserId,
  initialMessages,
  partnerProfile,
  myProfile,
}: {
  partnerId: string;
  currentUserId: string;
  initialMessages: Message[];
  partnerProfile: Profile | null;
  myProfile: Profile | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dm-${[currentUserId, partnerId].sort().join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as Message & { recipient_id: string };
          const isRelevant =
            (msg.sender_id === currentUserId && msg.recipient_id === partnerId) ||
            (msg.sender_id === partnerId && msg.recipient_id === currentUserId);
          if (isRelevant) setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, partnerId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    const body = text.trim();
    setText("");
    startTransition(() => { sendDirectMessage(partnerId, body); });
  };

  const grouped = messages.reduce<{ senderId: string; msgs: Message[] }[]>((acc, msg) => {
    const last = acc[acc.length - 1];
    if (last && last.senderId === msg.sender_id) {
      last.msgs.push(msg);
    } else {
      acc.push({ senderId: msg.sender_id, msgs: [msg] });
    }
    return acc;
  }, []);

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/messages" className="p-2 rounded-xl text-brand-400 hover:text-white hover:bg-brand-800 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-9 h-9 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
          {partnerProfile?.avatar_url ? (
            <img src={partnerProfile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <User size={16} className="text-brand-300" />
          )}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{partnerProfile?.display_name ?? "Unknown"}</p>
          <p className="text-brand-500 text-xs">Direct message</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-brand-900 border border-brand-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-brand-800 flex items-center justify-center mb-4">
                <User size={20} className="text-brand-500" />
              </div>
              <p className="text-brand-300 font-medium text-sm">
                Start a conversation with {partnerProfile?.display_name ?? "this person"}
              </p>
            </div>
          )}

          {grouped.map((group, gi) => {
            const isMe = group.senderId === currentUserId;
            const profile = isMe ? myProfile : partnerProfile;

            return (
              <div key={gi} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center shrink-0 mt-1">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <User size={14} className="text-brand-300" />
                  )}
                </div>
                <div className={cn("flex flex-col gap-1 max-w-[70%]", isMe && "items-end")}>
                  {group.msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isMe
                          ? "bg-brand-500 text-white rounded-tr-sm"
                          : "bg-brand-800 text-brand-100 rounded-tl-sm"
                      )}
                    >
                      {msg.body}
                      <span className={cn(
                        "block text-[10px] mt-0.5",
                        isMe ? "text-brand-200/70" : "text-brand-500"
                      )}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-brand-800 p-4 flex gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message ${partnerProfile?.display_name ?? ""}…`}
            className="flex-1 bg-brand-800 border border-brand-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
