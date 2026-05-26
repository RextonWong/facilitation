import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata = { title: "Login — Facilitation" };

export default function LoginPage() {
  return (
    <div className="bg-brand-900 border border-brand-700 rounded-2xl p-12 shadow-2xl">
      <h2 className="text-2xl font-semibold text-white mb-10">Sign in</h2>
      <LoginForm />
      <p className="text-center text-brand-300 text-sm mt-10">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-brand-400 hover:text-white transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
