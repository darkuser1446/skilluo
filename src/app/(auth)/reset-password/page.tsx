"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, ArrowRight, AlertCircle, Check, KeyRound } from "lucide-react";

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
      <div className="text-center space-y-4 py-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="font-display font-black text-lg text-[#111111] uppercase">
          INVALID RESET TOKEN
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          This security link requires a valid token from your dispatched reset email.
        </p>
        <Link
          href="/forgot-password"
          className="neo-btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] text-white text-xs font-black uppercase tracking-wider"
        >
          REQUEST NEW LINK <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-12 h-12 bg-emerald-500 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-white flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <h3 className="font-display font-black text-lg text-[#111111] uppercase">
          PASSWORD UPDATED!
        </h3>
        <p className="text-xs text-slate-600 font-medium">
          Your new portal password has been cryptographically applied.
        </p>
        <Link
          href="/login"
          className="neo-btn inline-flex items-center gap-2 px-6 py-2.5 bg-[#F07C27] text-white text-xs font-black uppercase tracking-wider"
        >
          SIGN IN NOW <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border-[2px] border-rose-900 text-rose-900 text-xs font-mono font-bold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
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
            className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
          />
          <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
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
            className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
          />
          <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="neo-btn w-full bg-[#F07C27] text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
      >
        <span>{loading ? "UPDATING CREDENTIAL..." : "RESET PASSWORD"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen bg-[#F9F9F9] text-[#111111] flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-[#F07C27] selection:text-white">
      {/* Background Dot Grid */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-60"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="bg-[#111111] text-white font-display font-black text-2xl px-3.5 py-1.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] uppercase tracking-wider">
              SUPER 60
            </div>
            <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2.5 py-2 border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111]">
              C++
            </div>
          </Link>
          <div className="bg-[#FFF0E5] text-[#111111] font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider inline-block mt-2">
            [ CREDENTIAL REFRESH // SET NEW PASSWORD ]
          </div>
          <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-[#F07C27]" /> SET NEW PASSWORD
          </h2>
          <p className="font-mono text-xs text-slate-600 mt-1">
            Choose a strong password to replace your existing credentials
          </p>
        </div>

        <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-8">
          <Suspense fallback={<p className="text-xs font-mono text-slate-500 text-center py-6">INITIALIZING CIPHER...</p>}>
            <ResetForm />
          </Suspense>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <strong className="text-[#111111]">Super 60</strong>
        </div>
      </div>
    </div>
  );
}
