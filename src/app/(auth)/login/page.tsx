"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid credentials. Please check your email and password.");
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
      setError(err.message || "Failed to login. Please verify your credentials.");
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
        {/* Brand Header */}
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
            [ PORTAL ACCESS // AUTHENTICATION PROTOCOL ]
          </div>
          <h2 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight mt-1">
            SIGN IN TO YOUR PORTAL
          </h2>
          <p className="font-mono text-xs text-slate-600 mt-1">
            Access C++ labs, live code testbenches, and ranking telemetry
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 bg-rose-50 border-[2px] border-rose-900 text-rose-900 text-xs font-mono font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                Email Address
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

            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-slate-700 tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-[#F9F9F9] border-[2px] border-[#111111] text-[#111111] placeholder-slate-400 text-xs font-mono font-medium focus:bg-white focus:shadow-[3px_3px_0px_#111111] focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-[#111111] cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-1">
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-slate-600 hover:text-[#111111] font-bold underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neo-btn w-full bg-[#F07C27] text-white py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "AUTHENTICATING..." : "SIGN IN TO PORTAL"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t-[2px] border-[#111111] text-center text-xs font-mono font-bold text-slate-700">
            Need an account?{" "}
            <Link href="/register" className="text-[#F07C27] hover:underline underline-offset-4">
              Register application here
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          © 2026 Skill Up · Powered by <strong className="text-[#111111]">Super 60</strong>
        </div>
      </div>
    </div>
  );
}
