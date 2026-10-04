"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import InteractiveTileGrid from "@/components/InteractiveTileGrid";
import Super60Logo from "@/components/Super60Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Request failed");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      <InteractiveTileGrid tileSize={44} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <Super60Logo size="lg" subtitleText="PORTAL" />
          </Link>
          <h2 className="font-display font-bold text-xl text-white mt-4 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-orange" /> Forgot your password?
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            We&apos;ll send a secure reset link to your registered email
          </p>
        </div>

        <div className="rounded-2xl p-7 sm:p-8 bg-[#131E3A] border border-white/10 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-display font-bold text-white">Check your inbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an account exists for <span className="text-brand-orange">{email}</span>, a
                password reset link valid for <strong>30 minutes</strong> has been sent.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-md hover:brightness-110 transition-all"
              >
                Back to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {!sent && (
            <div className="mt-5 text-center text-xs text-slate-400">
              Remembered it?{" "}
              <Link href="/login" className="text-brand-orange font-semibold hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <span className="text-brand-orange">Super 60</span>
        </div>
      </div>
    </div>
  );
}