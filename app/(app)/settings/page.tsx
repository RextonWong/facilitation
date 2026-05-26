import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { logout } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export const metadata = { title: "Settings — Facilitation" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-brand-400 text-sm mt-2">Manage your account and preferences.</p>
      </div>

      {/* Profile section */}
      <section className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
        <h2 className="text-base font-semibold text-white mb-6">Profile</h2>
        <ProfileForm
          profile={{ display_name: profile?.display_name ?? null, avatar_url: profile?.avatar_url ?? null }}
          email={user!.email ?? ""}
        />
      </section>

      {/* Account section */}
      <section className="bg-brand-900 border border-brand-800 rounded-2xl p-7">
        <h2 className="text-base font-semibold text-white mb-2">Account</h2>
        <p className="text-brand-400 text-sm mb-6">
          Signed in as <span className="text-brand-200">{user!.email}</span>
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 border border-brand-700 text-brand-300 hover:text-white hover:border-brand-500 rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="bg-brand-900 border border-red-900/40 rounded-2xl p-7">
        <h2 className="text-base font-semibold text-red-400 mb-2">Danger zone</h2>
        <p className="text-brand-400 text-sm mb-6">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          disabled
          className="px-5 py-2.5 border border-red-800/50 text-red-500 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed"
          title="Contact support to delete your account"
        >
          Delete account
        </button>
        <p className="text-brand-600 text-xs mt-2">Contact support to request account deletion.</p>
      </section>
    </div>
  );
}
