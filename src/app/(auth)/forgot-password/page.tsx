"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, Check, KeyRound } from "lucide-react";

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
            [ SECURITY PROTOCOL // CREDENTIAL RECOVERY ]
          </div>
          <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1 flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-[#F07C27]" /> PASSWORD RECOVERY
          </h2>
          <p className="font-mono text-xs text-slate-600 mt-1">
            We will dispatch a secure reset token link to your registered email
          </p>
        </div>

        <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border-[2px] border-rose-900 text-rose-900 text-xs font-mono font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 bg-emerald-500 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-display font-black text-xl text-[#111111] uppercase">
                CHECK YOUR INBOX
              </h3>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                If an account exists for <span className="font-mono font-bold text-[#111111]">{email}</span>, a
                password reset link valid for <strong>30 minutes</strong> has been dispatched.
              </p>
              <Link
                href="/login"
                className="neo-btn inline-flex items-center gap-2 px-6 py-2.5 bg-[#111111] text-white text-xs font-black uppercase tracking-wider"
              >
                BACK TO SIGN IN <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@super60.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full bg-[#F07C27] text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? "DISPATCHING LINK..." : "SEND RESET LINK"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {!sent && (
            <div className="mt-5 text-center text-xs font-mono font-bold text-slate-700">
              Remembered your credentials?{" "}
              <Link href="/login" className="text-[#F07C27] hover:underline underline-offset-4">
                Back to Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <strong className="text-[#111111]">Super 60</strong>
        </div>
      </div>
    </div>
  );
}