"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import InteractiveTileGrid from "@/components/InteractiveTileGrid";
import Super60Logo from "@/components/Super60Logo";

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

  const handleSelectRole = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("");
    setError(null);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-foreground flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      {/* Interactive Square Tiles Canvas Background */}
      <InteractiveTileGrid tileSize={44} />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <Super60Logo size="lg" subtitleText="PORTAL" />
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
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-1">
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-slate-400 hover:text-brand-orange transition-colors underline underline-offset-2"
              >
                Forgot password?
              </Link>
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

          {/* Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-mono text-slate-400 block mb-2 text-center uppercase tracking-wider">
              Demo Accounts (Click to Fill Email)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole("admin@super60.org")}
                className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
                title="Click to fill admin email"
              >
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                <span className="font-semibold text-white">Admin</span>
                <span className="text-[9px] text-slate-400 font-mono">admin123</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole("vikram@super60.org")}
                className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
                title="Click to fill mentor email"
              >
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-white">Mentor</span>
                <span className="text-[9px] text-slate-400 font-mono">mentor123</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole("aditya@student.super60.org")}
                className="px-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-orange/40 text-[11px] font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all"
                title="Click to fill student email"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white">Student</span>
                <span className="text-[9px] text-slate-400 font-mono">student123</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center font-mono">
              Click a role to fill email, enter the password, then click Sign In.
            </p>
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
