"use client";

import { useState, useTransition } from "react";
import { UserPlus, Copy, Check, X } from "lucide-react";
import { createInvite } from "@/lib/actions/projects";

export function InviteButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await createInvite(projectId);
      if (result.error) {
        setError(result.error);
      } else if (result.code) {
        setCode(result.code);
      }
    });
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setCode(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <UserPlus size={16} />
        Invite
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-brand-900 border border-brand-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Invite member</h2>
              <button onClick={handleClose} className="text-brand-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {!code ? (
              <>
                <p className="text-brand-300 text-sm mb-4">
                  Generate a one-time invite code valid for 7 days.
                </p>
                {error && (
                  <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2 mb-4">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={isPending}
                  className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isPending ? "Generating…" : "Generate invite code"}
                </button>
              </>
            ) : (
              <>
                <p className="text-brand-300 text-sm mb-3">Share this code:</p>
                <div className="flex items-center gap-2 bg-brand-800 border border-brand-700 rounded-lg px-4 py-3 mb-4">
                  <code className="flex-1 text-white font-mono text-lg tracking-widest">
                    {code}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-brand-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-brand-500 text-xs">Expires in 7 days · Single use</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
