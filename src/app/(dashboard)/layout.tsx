"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Calendar,
  Layers,
  FileCode2,
  BookOpen,
  CheckSquare,
  HelpCircle,
  MessageSquareHeart,
  BarChart3,
  Users,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Sliders,
  Award,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [activeWorkshopId, setActiveWorkshopId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe(retries = 3): Promise<Response | null> {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch("/api/auth/me");
          // Only treat a definitive 401 as "not logged in" — not 5xx or network errors
          if (res.status === 401) return res;
          if (res.ok) return res;
          // On 5xx or other transient errors, wait and retry
          await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        } catch {
          // Network error — wait and retry
          await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        }
      }
      return null; // all retries failed — don't force logout, just show loading error
    }

    async function loadData() {
      try {
        const meRes = await fetchMe();

        if (!meRes) {
          // Network/server issue — don't redirect, show error state
          setLoading(false);
          return;
        }

        if (meRes.status === 401) {
          // Definitively not authenticated
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData.data.user);

        // Load workshops in background — don't block on failure
        try {
          const wsRes = await fetch("/api/workshops");
          if (wsRes.ok) {
            const wsData = await wsRes.json();
            const wsList = wsData.data.workshops || [];
            setWorkshops(wsList);
            if (wsList.length > 0) {
              setActiveWorkshopId(wsList[0].id);
            }
          }
        } catch {
          // workshops failing is non-fatal
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);


  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-400 flex flex-col items-center justify-center font-mono text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-[#0F172A]/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div className="w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-1">
            <span className="font-display font-bold text-white text-base block tracking-tight">Super 60</span>
            <span className="text-xs text-slate-400">Loading your workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  const role = user?.role || "STUDENT";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const activeWorkshop = workshops.find((w) => w.id === activeWorkshopId) || workshops[0];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-1/4 w-[600px] h-[400px] bg-brand-orange/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-brand-navy/30 blur-[150px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-9 w-8 flex-shrink-0 transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_rgba(240,124,39,0.35)]">
                <Image src="/emblem.png" alt="Super 60" fill className="object-contain" priority />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-xl tracking-tight text-brand-orange">
                    Super 60
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-orange/15 text-brand-orange border border-brand-orange/30 tracking-wide uppercase">
                    SKILL UP
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-medium tracking-wide">
                  Workshop Engineering Platform
                </span>
              </div>
            </Link>

            {/* Workshop Switcher Dropdown */}
            {workshops.length > 0 && (
              <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                <div className="relative">
                  <select
                    value={activeWorkshopId}
                    onChange={(e) => setActiveWorkshopId(e.target.value)}
                    className="bg-[#111A33]/90 hover:bg-[#152244] border border-slate-700/70 text-slate-200 hover:text-white rounded-lg pl-2.5 pr-7 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-brand-orange transition-all cursor-pointer appearance-none shadow-sm"
                  >
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id} className="bg-[#0B1120] text-white">
                        {w.name} ({w.year}) — {w.status}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/90 border border-slate-800 shadow-inner">
              <span
                className={`w-2 h-2 rounded-full ${
                  role === "ADMIN"
                    ? "bg-brand-orange animate-pulse"
                    : role === "MENTOR"
                    ? "bg-sky-400"
                    : "bg-emerald-400"
                }`}
              />
              <span
                className={
                  role === "ADMIN"
                    ? "text-brand-orange"
                    : role === "MENTOR"
                    ? "text-sky-300"
                    : "text-emerald-300"
                }
              >
                {role}
              </span>
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2.5 pl-1 sm:pl-3 sm:border-l sm:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-orange/30 to-brand-navy border border-brand-orange/40 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm flex-shrink-0">
                {userInitials}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 truncate max-w-[150px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign out of Super 60"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <nav className="sticky top-[57px] z-30 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            {role === "STUDENT" && (
              <>
                <Link
                  href="/student"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/student"
                      ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shadow-[0_0_15px_rgba(240,124,39,0.15)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </Link>
                <Link
                  href="/student/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/student/profile"
                      ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shadow-[0_0_15px_rgba(240,124,39,0.15)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
              </>
            )}

            {role === "MENTOR" && (
              <Link
                href="/mentor"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  pathname === "/mentor"
                    ? "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Mentor Workspace</span>
              </Link>
            )}

            {role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/admin"
                      ? "bg-brand-orange/15 text-brand-orange border border-brand-orange/30 shadow-[0_0_15px_rgba(240,124,39,0.15)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Center</span>
                </Link>
                <Link
                  href="/mentor"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/mentor"
                      ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Mentor Workspace</span>
                </Link>
                <Link
                  href="/student"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    pathname === "/student"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student View</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Edition: <strong className="text-slate-200">{activeWorkshop?.name || "Active"}</strong>
            </span>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-brand-orange transition-colors font-mono py-1 px-2.5 rounded-md bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-brand-orange/40 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <span>Public Page</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-6 text-center text-xs font-mono text-slate-500 relative z-10">
        Skill Up Workshop Platform · An initiative of Super 60 · Production Grade
      </footer>
    </div>
  );
}
