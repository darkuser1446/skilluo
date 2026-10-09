"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
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
  Terminal,
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
          if (res.status === 401) return res;
          if (res.ok) return res;
          await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        } catch {
          await new Promise((r) => setTimeout(r, 1200 * (i + 1)));
        }
      }
      return null;
    }

    async function loadData() {
      try {
        const meRes = await fetchMe();

        if (!meRes) {
          setLoading(false);
          return;
        }

        if (meRes.status === 401) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData.data.user);

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
          // ignore
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Role guard
  useEffect(() => {
    if (!user) return;
    const home =
      user.role === "ADMIN" ? "/admin" : user.role === "MENTOR" ? "/mentor" : "/student";
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      router.replace(home);
    } else if (pathname.startsWith("/mentor") && user.role === "STUDENT") {
      router.replace("/student");
    } else if (pathname.startsWith("/student") && user.role === "MENTOR") {
      router.replace("/mentor");
    }
  }, [user, pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] text-[#111111] flex flex-col items-center justify-center font-mono text-sm p-4">
        <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-8 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <div className="w-10 h-10 bg-[#F07C27] border-[3px] border-[#111111] animate-spin" />
          <div className="space-y-1">
            <div className="bg-[#111111] text-white font-mono text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block">
              [ INITIALIZING WORKSPACE ]
            </div>
            <div className="font-display font-black text-xl text-[#111111] uppercase mt-1">
              SUPER 60 PLATFORM
            </div>
            <p className="text-xs text-slate-600 font-mono">Loading cohort telemetry & session...</p>
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
    <div className="min-h-screen bg-[#F9F9F9] text-[#111111] flex flex-col selection:bg-[#F07C27] selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b-[3px] border-[#111111] shadow-[0px_4px_0px_#111111] px-4 sm:px-8 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand & Cohort Mode */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 select-none">
              <Image
                src="/s60-official-logo.png"
                alt="Super 60"
                width={90}
                height={36}
                priority
                className="h-8 w-auto object-contain"
              />
              <div className="bg-[#111111] text-white font-display font-black text-base px-2.5 py-0.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] uppercase tracking-wider">
                SUPER 60
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 font-mono text-xs font-bold text-[#111111] bg-[#FFF0E5] px-2.5 py-1 border-[2px] border-[#111111]">
              <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
              <span>[ MODE: COHORT RUNTIME // S60-CPP ]</span>
            </div>

            {/* Workshop Dropdown Switcher */}
            {workshops.length > 0 && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l-[2px] border-[#111111]">
                <Calendar className="w-3.5 h-3.5 text-[#F07C27] flex-shrink-0" />
                <div className="relative">
                  <select
                    value={activeWorkshopId}
                    onChange={(e) => setActiveWorkshopId(e.target.value)}
                    className="bg-[#F4F3F3] hover:bg-white border-[2px] border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111] pl-2.5 pr-7 py-1 text-xs font-mono font-bold focus:outline-none focus:shadow-none transition-all cursor-pointer appearance-none"
                  >
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id} className="bg-white text-[#111111]">
                        {w.name} ({w.year}) — {w.status}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#111111] text-[10px] font-bold">
                    ▼
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <div
              className={`px-2.5 py-1 text-[11px] font-mono font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] ${
                role === "ADMIN"
                  ? "bg-[#F07C27] text-white"
                  : role === "MENTOR"
                  ? "bg-sky-100 text-sky-950"
                  : "bg-emerald-100 text-emerald-950"
              }`}
            >
              [ {role} ]
            </div>

            {/* User Square Identifier */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-mono font-black text-xs text-[#111111]">
                {userInitials}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-black text-[#111111] uppercase truncate max-w-[140px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-600 font-mono truncate max-w-[140px]">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Sign out of Super 60"
              className="p-1.5 bg-white hover:bg-rose-50 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none text-[#111111] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Sub Navigation Bar */}
      <nav className="sticky top-[61px] z-30 bg-[#F4F3F3] border-b-[3px] border-[#111111] px-4 sm:px-8 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            {role === "STUDENT" && (
              <>
                <Link
                  href="/student"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/student"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>STUDENT PORTAL</span>
                </Link>
                <Link
                  href="/student/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/student/profile"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>MY STANDING</span>
                </Link>
              </>
            )}

            {role === "MENTOR" && (
              <>
                <Link
                  href="/mentor"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/mentor"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>MENTOR WORKSPACE</span>
                </Link>
                <Link
                  href="/mentor/profile"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/mentor/profile"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>MENTOR PROFILE</span>
                </Link>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/admin"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ADMIN CONTROL CENTER</span>
                </Link>
                <Link
                  href="/mentor"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/mentor"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>MENTOR VIEW</span>
                </Link>
                <Link
                  href="/student"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all ${
                    pathname === "/student"
                      ? "bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111]"
                      : "bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-slate-100"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>STUDENT VIEW</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#111111] bg-white px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
              <span className="w-2 h-2 bg-emerald-500 border-[1px] border-[#111111]" />
              EDITION: <strong>{activeWorkshop?.name || "ACTIVE"}</strong>
            </span>
            <Link
              href="/"
              className="text-xs text-[#111111] hover:bg-[#F07C27] hover:text-white transition-colors font-mono font-bold py-1 px-2.5 bg-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>PUBLIC PORTAL</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full relative z-10">
        {children}
      </main>

      {/* Technical Footer */}
      <footer className="border-t-[3px] border-[#111111] bg-white py-4 px-6 text-center text-xs font-mono text-slate-700">
        SKILL UP // SUPER 60 INCUBATOR RUNTIME · ISO C++20/23 SPECIFICATION · NO COMPROMISE
      </footer>
    </div>
  );
}
