"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile, uploadAvatar } from "@/lib/actions/profile";
import { Camera, Loader2, User } from "lucide-react";

type Profile = { display_name: string | null; avatar_url: string | null };

export function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateProfile(formData) ?? null;
    },
    null
  );

  const [avatarState, avatarAction, avatarPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await uploadAvatar(formData) ?? null;
    },
    null
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const fd = new FormData();
    fd.append("avatar", file);
    avatarAction(fd);
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-brand-700 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-brand-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={avatarPending}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {avatarPending ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
        <div>
          <p className="text-white text-sm font-medium">Profile photo</p>
          <p className="text-brand-500 text-xs mt-0.5">JPEG, PNG, WebP or GIF · Max 5 MB</p>
          {avatarState?.error && <p className="text-red-400 text-xs mt-1">{avatarState.error}</p>}
          {avatarState?.success && <p className="text-green-400 text-xs mt-1">Photo updated!</p>}
        </div>
      </div>

      {/* Profile form */}
      <form action={formAction} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-brand-200 mb-2">Display name</label>
          <input
            name="display_name"
            defaultValue={profile.display_name ?? ""}
            required
            className="w-full px-4 py-3 bg-brand-800 border border-brand-700 rounded-xl text-white placeholder-brand-500 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-200 mb-2">Email</label>
          <input
            value={email}
            disabled
            className="w-full px-4 py-3 bg-brand-800/50 border border-brand-800 rounded-xl text-brand-500 cursor-not-allowed"
          />
          <p className="text-brand-600 text-xs mt-1.5">Email cannot be changed here.</p>
        </div>

        {state?.error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            Profile updated successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors text-sm"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
