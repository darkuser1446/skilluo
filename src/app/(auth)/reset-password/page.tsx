"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import InteractiveTileGrid from "@/components/InteractiveTileGrid";
import Super60Logo from "@/components/Super60Logo";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Reset failed");
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-6">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="font-display font-bold text-white">Invalid reset link</h3>
        <p className="text-xs text-slate-400">
          This page requires a valid token from your email link.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-md hover:brightness-110 transition-all"
        >
          Request a new link <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="font-display font-bold text-white">Password updated</h3>
        <p className="text-xs text-slate-400">You can now sign in with your new password.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-md hover:brightness-110 transition-all"
        >
          Sign In <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-medium">
          New Password
        </label>
        <div className="relative">
          <input
            type="password"
            required
            minLength={6}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
          />
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-medium">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type="password"
            required
            minLength={6}
            placeholder="••••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
        <span>{loading ? "Updating..." : "Reset Password"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      <InteractiveTileGrid tileSize={44} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <Super60Logo size="lg" subtitleText="PORTAL" />
          </Link>
          <h2 className="font-display font-bold text-xl text-white mt-4 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-orange" /> Set a new password
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a strong password — it replaces your old one immediately
          </p>
        </div>

        <div className="rounded-2xl p-7 sm:p-8 bg-[#131E3A] border border-white/10 shadow-2xl">
          <Suspense fallback={<p className="text-xs text-slate-500 text-center py-6">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <span className="text-brand-orange">Super 60</span>
        </div>
      </div>
    </div>
  );
}


