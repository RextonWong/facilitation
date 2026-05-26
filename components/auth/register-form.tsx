"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await register(formData) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-7">
      <div>
        <label
          htmlFor="display_name"
          className="block text-sm font-medium text-brand-200 mb-2"
        >
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          autoComplete="name"
          className="w-full px-4 py-3.5 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-brand-200 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3.5 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-brand-200 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="w-full px-4 py-3.5 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          placeholder="At least 8 characters"
        />
      </div>

      {state?.error && (
        <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-xl px-4 py-3">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors mt-2"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
