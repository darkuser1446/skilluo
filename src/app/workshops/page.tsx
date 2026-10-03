"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  Layers,
  Trophy,
  ExternalLink,
  ArrowRight,
  CheckCircle,
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
function statusLabel(status: WorkshopStatus) {
  switch (status) {
    case "ACTIVE":
      return {
        text: "Active",
        className:
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      };
    case "COMPLETED":
      return {
        text: "Completed",
        className: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
      };
    case "UPCOMING":
      return {
        text: "Upcoming",
        className: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
      };
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    day: "numeric",
  });
}

/* ──────────────────────────────────────────────
   Navbar
────────────────────────────────────────────── */
function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-9 flex-shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/emblem.png"
              alt="Super 60"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xl leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#F07C27] via-[#FFA048] to-[#F07C27]">
              Super 60
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">
              SKILL UP WORKSHOP
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-slate-300 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link href="/workshops" className="text-brand-orange font-semibold">
            Workshops
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs uppercase tracking-wider font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-xs uppercase tracking-wider font-semibold text-white px-4 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight shadow-[0_0_20px_rgba(240,124,39,0.4)] hover:shadow-[0_0_30px_rgba(240,124,39,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────
   Workshop Card
────────────────────────────────────────────── */
function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const badge = statusLabel(workshop.status);
  const isActive = workshop.status === "ACTIVE";

  return (
    <div
      className={`relative rounded-2xl border transition-all group overflow-hidden ${
        isActive
          ? "bg-[#0E1520] border-brand-orange/50 shadow-[0_0_40px_rgba(240,124,39,0.12)]"
          : "bg-[#0E1520] border-white/8 hover:border-white/20"
      }`}
    >
      {/* Active highlight stripe */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-orange via-brand-orangeLight to-brand-orange" />
      )}

      <div className="p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-tight mb-1.5">
              {workshop.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}
              >
                {badge.text}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Cohort {workshop.year}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display font-extrabold text-4xl text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 leading-none">
              {workshop.year}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 mb-5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span>
            {formatDate(workshop.startDate)} → {formatDate(workshop.endDate)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              icon: <Layers className="w-3.5 h-3.5" />,
              val: workshop._count.labs,
              label: "Labs",
            },
            {
              icon: <Users className="w-3.5 h-3.5" />,
              val: workshop._count.enrollments,
              label: "Students",
            },
            {
              icon: <Trophy className="w-3.5 h-3.5" />,
              val: workshop._count.assignments,
              label: "Tasks",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-3 rounded-xl bg-white/4 text-center"
            >
              <span className="text-slate-400 mb-1">{stat.icon}</span>
              <span className="font-display font-bold text-white text-lg leading-none">
                {stat.val}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {isActive ? (
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(240,124,39,0.35)] hover:shadow-[0_0_35px_rgba(240,124,39,0.6)] hover:brightness-110 active:scale-98 transition-all"
          >
            Join Now <ArrowRight className="w-4 h-4" />
          </Link>
        ) : workshop.status === "COMPLETED" ? (
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-slate-500 font-semibold text-sm cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" /> View History
          </button>
        ) : (
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-500/20 text-sky-400 font-semibold text-sm cursor-not-allowed bg-sky-500/5"
          >
            <ExternalLink className="w-4 h-4" /> Coming Soon
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Empty state
────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-5">
        <Trophy className="w-7 h-7 text-slate-500" />
      </div>
      <h3 className="font-display font-bold text-white text-lg mb-2">
        No workshops yet
      </h3>
      <p className="text-sm text-slate-400 max-w-xs mx-auto">
        Workshop editions will appear here once they are created by the admin team.
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Page
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
        if (!res.ok) throw new Error(data.error?.message || "Failed to load");
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
    <div className="min-h-screen bg-[#070B14] text-foreground">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-[#F07C27]/7 blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-orange bg-[#F07C27]/10 border border-[#F07C27]/25 mb-5">
            <Trophy className="w-3 h-3" /> Workshop Editions
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1] mb-5">
            Every Year, a New{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA048] via-[#F07C27] to-[#FFA048]">
              Cohort
            </span>{" "}
            of Engineers
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            Skill Up runs as an annual intensive C++ workshop. Each edition brings
            a new batch of top students through our structured systems-programming
            curriculum.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24 px-5">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-2xl bg-white/3 animate-pulse border border-white/6"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          ) : workshops.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-10">
              {/* Active workshop first — full-width highlight */}
              {active.length > 0 && (
                <div>
                  <h2 className="font-mono text-[11px] uppercase tracking-widest text-brand-orange mb-4 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Workshop
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {active.map((w) => (
                      <WorkshopCard key={w.id} workshop={w} />
                    ))}
                  </div>
                </div>
              )}

              {/* Previous / Upcoming */}
              {rest.length > 0 && (
                <div>
                  <h2 className="font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-4">
                    All Editions
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((w) => (
                      <WorkshopCard key={w.id} workshop={w} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/6 py-20 px-5 text-center">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
          Ready to join the next cohort?
        </h2>
        <p className="text-slate-400 text-sm mb-7 max-w-md mx-auto">
          Applications for Skill Up 2026 are open. Submit your application and
          compete for one of the 60 seats.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-[0_0_30px_rgba(240,124,39,0.5)] hover:shadow-[0_0_50px_rgba(240,124,39,0.7)] hover:scale-105 active:scale-95 transition-all"
        >
          Apply Now <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="border-t border-white/8 py-8 px-5 text-center">
        <p className="text-xs font-mono text-slate-500">
          © 2026 Skill Up · Powered by{" "}
          <span className="text-brand-orange">Super 60</span> · All rights reserved.
        </p>
      </footer>
    </div>
  );
}
