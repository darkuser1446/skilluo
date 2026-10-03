"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Login failed");
      }

      const role = data.data?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "MENTOR") {
        router.push("/mentor");
      } else {
        router.push("/student");
      }
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    handleLogin(undefined, e, p);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-3 group">
            <div className="relative h-14 w-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image src="/emblem.png" alt="Super 60" fill className="object-contain" priority />
            </div>
            <div className="text-left">
              <span className="font-display font-extrabold text-3xl tracking-tight text-brand-orange block">
                Super 60
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
                SKILL UP WORKSHOP PLATFORM
              </span>
            </div>
          </Link>
          <h2 className="font-display font-bold text-xl text-white mt-4">
            Sign in to your portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access C++ labs, live code assessments, and performance tracking
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 sm:p-8 bg-[#131E3A] border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-medium">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@super60.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 text-center uppercase tracking-wider">
              One-Click Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin("admin@super60.org", "admin123")}
                className="px-2 py-2 rounded-lg bg-white/5 hover:bg-brand-orange/20 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("vikram@super60.org", "mentor123")}
                className="px-2 py-2 rounded-lg bg-white/5 hover:bg-brand-orange/20 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Mentor</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin("aditya@student.super60.org", "student123")}
                className="px-2 py-2 rounded-lg bg-white/5 hover:bg-brand-orange/20 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            Need an account?{" "}
            <Link href="/register" className="text-brand-orange font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <span className="text-brand-orange">Super 60</span>
        </div>
      </div>
    </div>
  );
}
