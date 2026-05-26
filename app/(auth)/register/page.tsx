import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata = { title: "Register — Facilitation" };

export default function RegisterPage() {
  return (
    <div className="bg-brand-900 border border-brand-700 rounded-2xl p-12 shadow-2xl">
      <h2 className="text-2xl font-semibold text-white mb-10">Create account</h2>
      <RegisterForm />
      <p className="text-center text-brand-300 text-sm mt-10">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-400 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
