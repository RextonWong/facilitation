"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { joinProject } from "@/lib/actions/projects";
import { useActionState } from "react";

export function JoinProjectButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const code = formData.get("code") as string;
      const result = await joinProject(code.trim());
      return result ?? null;
    },
    null
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 px-5 py-2.5 border border-brand-700 text-brand-300 hover:text-white hover:border-brand-500 text-sm font-semibold rounded-xl transition-colors"
      >
        <Users size={17} />
        Join project
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Join a project</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 text-brand-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-200">
                  Invite code
                </label>
                <input
                  name="code"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white text-base placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors font-mono tracking-widest uppercase text-center"
                  placeholder="XXXXXXXXXX"
                />
                <p className="text-xs text-brand-500">Ask the project owner for their invite code.</p>
              </div>

              {state?.error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                  {state.error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 flex items-center justify-center py-3 border border-brand-700 text-brand-300 rounded-xl text-sm font-medium hover:bg-brand-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 flex items-center justify-center py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {pending ? "Joining…" : "Join project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
