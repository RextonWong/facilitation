"use client";

import { useActionState } from "react";
import { updateProject, deleteProject } from "@/lib/actions/projects";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  type: "individual" | "paired" | "specialisation";
};

export function ProjectSettingsForm({ project }: { project: Project }) {
  const [editState, editAction, editPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateProject(project.id, formData) ?? null;
    },
    null
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState(
    async (_prev: { error?: string } | null, _: FormData) => {
      return await deleteProject(project.id) ?? null;
    },
    null
  );

  return (
    <div className="space-y-10">
      {/* Edit form */}
      <section className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
        <h2 className="text-base font-semibold text-white mb-6">Project details</h2>
        <form action={editAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-200 mb-2">Project name</label>
            <input
              name="name"
              defaultValue={project.name}
              required
              className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-200 mb-2">Description</label>
            <textarea
              name="description"
              defaultValue={project.description ?? ""}
              rows={3}
              className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors resize-none"
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-200 mb-2">Project type</label>
            <select
              name="type"
              defaultValue={project.type}
              className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="individual">Individual</option>
              <option value="paired">Paired</option>
              <option value="specialisation">Specialisation</option>
            </select>
          </div>

          {editState?.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {editState.error}
            </p>
          )}
          {editState?.success && (
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              Project updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={editPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm"
          >
            {editPending && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="bg-brand-900 border border-red-900/40 rounded-2xl p-7">
        <h2 className="text-base font-semibold text-red-400 mb-2">Danger zone</h2>
        <p className="text-brand-400 text-sm mb-6">
          Deleting this project is permanent. All sections, tasks, and messages will be removed.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-5 py-2.5 border border-red-800/50 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors"
          >
            Delete project…
          </button>
        ) : (
          <form action={deleteAction} className="flex items-center gap-3">
            <p className="text-red-300 text-sm">Are you sure? This cannot be undone.</p>
            <button
              type="submit"
              disabled={deletePending}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
            >
              {deletePending && <Loader2 size={13} className="animate-spin" />}
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 border border-brand-700 text-brand-400 hover:text-white rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {deleteState?.error && (
          <p className="text-red-400 text-sm mt-3">{deleteState.error}</p>
        )}
      </section>
    </div>
  );
}
