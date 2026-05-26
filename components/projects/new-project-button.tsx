"use client";

import { useState } from "react";
import { Plus, X, User, Users } from "lucide-react";
import { createProject } from "@/lib/actions/projects";
import { useActionState } from "react";
import { cn } from "@/lib/utils";

type ProjectType = "individual" | "paired";

export function NewProjectButton() {
  const [open, setOpen] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType>("individual");

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createProject(formData);
      return result ?? null;
    },
    null
  );

  const typeOptions: { value: ProjectType; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      value: "individual",
      label: "Individual",
      sub: "Solo project just for you",
      icon: <User size={22} />,
    },
    {
      value: "paired",
      label: "Team",
      sub: "Collaborate with others",
      icon: <Users size={22} />,
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Plus size={17} />
        New project
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-brand-900 border border-brand-700 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Create a new project</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 text-brand-400 hover:text-white hover:bg-brand-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} className="space-y-6">
              {/* Project name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-200">
                  Project name
                </label>
                <input
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white text-base placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="e.g. Final Year Project"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-200">
                  Description <span className="text-brand-500 font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white text-base placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              {/* Project type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-brand-200">
                  Project type
                </label>
                <input type="hidden" name="type" value={projectType} />
                <div className="grid grid-cols-2 gap-3">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProjectType(opt.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 px-4 py-5 rounded-xl border-2 transition-all text-center",
                        projectType === opt.value
                          ? "border-brand-500 bg-brand-500/10 text-white"
                          : "border-brand-700 bg-brand-800 text-brand-400 hover:border-brand-600 hover:text-brand-200"
                      )}
                    >
                      <span className={projectType === opt.value ? "text-brand-400" : "text-brand-500"}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs mt-0.5 text-brand-500">{opt.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {state?.error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {state.error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
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
                  {pending ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
