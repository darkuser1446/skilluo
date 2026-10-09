"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Layers,
  Trophy,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
type WorkshopStatus = "ACTIVE" | "COMPLETED" | "UPCOMING";

interface Workshop {
  id: string;
  name: string;
  year: number;
  slug: string;
  startDate: string | null;
  endDate: string | null;
  status: WorkshopStatus;
  _count: {
    labs: number;
    enrollments: number;
    assignments: number;
    notes: number;
  };
}

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
function statusConfig(status: WorkshopStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        text: "[ ACTIVE // IN SESSION ]",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-900",
      };
    case "COMPLETED":
      return {
        text: "[ COMPLETED // ARCHIVED ]",
        badgeBg: "bg-slate-200 text-slate-800 border-[#111111]",
      };
    case "UPCOMING":
      return {
        text: "[ UPCOMING // STAGING ]",
        badgeBg: "bg-sky-100 text-sky-800 border-sky-900",
      };
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
}

/* ──────────────────────────────────────────────
   Workshop Card Component
────────────────────────────────────────────── */
function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const cfg = statusConfig(workshop.status);
  const isActive = workshop.status === "ACTIVE";

  return (
    <div
      className={`bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_#111111] transition-all flex flex-col justify-between ${
        isActive ? "ring-2 ring-[#F07C27]" : ""
      }`}
    >
      <div>
        {/* Card Header Ribbon */}
        <div className="p-4 sm:p-5 border-b-[2px] border-[#111111] bg-slate-50 flex items-start justify-between gap-3">
          <div>
            <span
              className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] mb-2 uppercase ${cfg.badgeBg}`}
            >
              {cfg.text}
            </span>
            <h3 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight">
              {workshop.name}
            </h3>
          </div>
          <div className="bg-[#111111] text-white font-mono font-black text-xl px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
            {workshop.year}
          </div>
        </div>

        {/* Date Window */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-[#FFF0E5] p-2.5 border-[2px] border-[#111111] font-bold">
            <Calendar className="w-4 h-4 text-[#F07C27] flex-shrink-0" />
            <span>
              RUNTIME: {formatDate(workshop.startDate)} → {formatDate(workshop.endDate)}
            </span>
          </div>

          {/* Telemetry Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            {[
              { label: "LABS", val: workshop._count.labs },
              { label: "STUDENTS", val: workshop._count.enrollments },
              { label: "TASKS", val: workshop._count.assignments },
            ].map((st) => (
              <div
                key={st.label}
                className="bg-[#F4F3F3] border-[2px] border-[#111111] p-2.5 text-center"
              >
                <div className="font-display font-black text-lg text-[#111111] leading-none">
                  {st.val}
                </div>
                <div className="font-mono text-[9px] font-bold text-slate-600 mt-1 uppercase tracking-wider">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0">
        {isActive ? (
          <Link
            href="/register"
            className="neo-btn w-full bg-[#F07C27] text-white py-2.5 text-xs font-black uppercase text-center flex items-center justify-center gap-2"
          >
            <span>JOIN ACTIVE COHORT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : workshop.status === "COMPLETED" ? (
          <div className="w-full bg-slate-100 border-[2px] border-[#111111] py-2 text-center font-mono text-xs font-bold text-slate-500 uppercase flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>COHORT CONCLUDED</span>
          </div>
        ) : (
          <div className="w-full bg-sky-50 border-[2px] border-[#111111] py-2 text-center font-mono text-xs font-bold text-sky-800 uppercase flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>APPLICATIONS OPENING SOON</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Workshops Page
────────────────────────────────────────────── */
export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workshops");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to load workshops");
        setWorkshops(data.data?.workshops ?? []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch workshops");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const active = workshops.filter((w) => w.status === "ACTIVE");
  const rest = workshops.filter((w) => w.status !== "ACTIVE");

  return (
    <div className="relative min-h-screen bg-[#F9F9F9] text-[#111111] overflow-x-hidden">
      {/* Top Ticker Marquee */}
      <div className="bg-[#111111] text-white py-2 px-4 border-b-[2px] border-[#111111] overflow-hidden whitespace-nowrap text-[11px] font-mono font-bold tracking-widest uppercase flex items-center select-none">
        <div className="inline-flex animate-marquee-smooth items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F07C27]" />
            [ SKILL UP // COHORT ARCHIVE & RUNTIME EDITIONS ]
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400" />
            ANNUAL PRODUCTION SPRINT • 60 SELECTED CANDIDATES PER YEAR
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#F07C27]" />
            LIVE LAB PODS • INDUSTRY MENTORS • VERIFIED CREDENTIALS
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b-[3px] border-[#111111] shadow-[0px_4px_0px_#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#111111] text-white font-display font-black text-xl px-3 py-1.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-wider">
              SUPER 60
            </div>
            <div className="bg-[#F07C27] text-white font-mono text-xs font-black px-2 py-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
              C++
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 font-display font-bold text-xs uppercase tracking-wider">
            <Link href="/" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/curriculum" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              Curriculum
            </Link>
            <Link href="/workshops" className="text-[#F07C27] underline underline-offset-8 decoration-[3px]">
              Editions
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="neo-btn-sm bg-white text-[#111111] px-4 py-2 text-xs font-bold uppercase"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="neo-btn-sm bg-[#F07C27] text-white px-5 py-2 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="flex flex-col items-start gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-[#111111] text-white font-mono text-xs font-bold px-3 py-1.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest">
            <Trophy className="w-3.5 h-3.5 text-[#F07C27]" />
            [ ARCHIVE // ANNUAL WORKSHOP EDITIONS ]
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#111111] tracking-tight uppercase leading-[1.05]">
            EVERY YEAR, A NEW{" "}
            <span className="bg-[#F07C27] text-white px-3 py-0.5 border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] inline-block -rotate-1">
              COHORT
            </span>{" "}
            OF ENGINEERS
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium mt-1">
            Skill Up operates as an annual intensive systems workshop. Each cohort brings
            the next generation of top engineering minds through our structured, low-latency C++
            curriculum and live testbench challenges.
          </p>
        </div>
      </section>

      {/* Workshop Roster Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] animate-pulse p-6"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border-[3px] border-rose-900 shadow-[6px_6px_0px_#111111] p-8 text-center">
            <p className="font-mono text-sm text-rose-800 font-bold uppercase">{error}</p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-12 text-center max-w-md mx-auto">
            <Trophy className="w-12 h-12 text-[#F07C27] mx-auto mb-4" />
            <h3 className="font-display font-black text-xl text-[#111111] uppercase mb-2">
              NO WORKSHOPS FOUND
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Workshop cohorts will appear here as soon as they are scheduled by the admin engine.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Active Workshop Highlight */}
            {active.length > 0 && (
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#111111] uppercase tracking-wider mb-4 border-b-[2px] border-[#111111] pb-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 border-[1px] border-[#111111]" />
                  CURRENT ACTIVE SPRINT ({active.length})
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.map((w) => (
                    <WorkshopCard key={w.id} workshop={w} />
                  ))}
                </div>
              </div>
            )}

            {/* Past and Upcoming Editions */}
            {rest.length > 0 && (
              <div>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 border-b-[2px] border-[#111111] pb-2">
                  <span className="w-2.5 h-2.5 bg-slate-400 border-[1px] border-[#111111]" />
                  HISTORICAL & UPCOMING EDITIONS ({rest.length})
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((w) => (
                    <WorkshopCard key={w.id} workshop={w} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA Block */}
        <div className="mt-16 bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
              [ NEXT COHORT ADMISSIONS ]
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#111111] uppercase tracking-tight">
              READY TO JOIN SKILL UP 2026?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-xl">
              Registrations for the upcoming sprint are currently live. Complete your application
              and take the screening assessment to compete for one of 60 incubator seats.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/register"
              className="neo-btn bg-[#F07C27] text-white px-7 py-3 text-xs font-black uppercase flex items-center gap-2"
            >
              <span>APPLY NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] text-white border-t-[4px] border-[#111111] py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#F07C27] text-white px-2 py-0.5 border-[2px] border-white font-bold">
              S60
            </span>
            <span>© 2026 Skill Up · Powered by Super 60</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/curriculum" className="hover:text-white">Curriculum</Link>
            <Link href="/workshops" className="text-[#F07C27]">Workshops</Link>
            <Link href="/about" className="hover:text-white">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
