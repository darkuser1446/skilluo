import Link from "next/link";
import Image from "next/image";
import {
  Target,
  BookOpen,
  Users,
  Award,
  Code2,
  Layers,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Static data
────────────────────────────────────────────── */
const CPP_TOPICS = [
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "C++ Foundations",
    desc: "Data types, pointers, memory layout, compile-time reasoning.",
    phase: "Phase 1",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "OOP & Design",
    desc: "Classes, inheritance, polymorphism, RAII, smart pointers.",
    phase: "Phase 2",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "STL Mastery",
    desc: "Containers, iterators, algorithms, ranges, complexity trade-offs.",
    phase: "Phase 3",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Systems Programming",
    desc: "File I/O, processes, sockets, OS interfaces, low-level APIs.",
    phase: "Phase 4",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Advanced Concurrency",
    desc: "Threads, atomics, lock-free structures, async patterns.",
    phase: "Phase 5",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: "Capstone Project",
    desc: "Build a real low-latency system end-to-end with mentor review.",
    phase: "Final",
  },
];

const ASSESSMENT_BREAKDOWN = [
  { label: "Tests & Quizzes", pct: 35, color: "bg-brand-orange" },
  { label: "Assignments", pct: 30, color: "bg-[#FFA048]" },
  { label: "Attendance", pct: 15, color: "bg-sky-500" },
  { label: "Lab Exercises", pct: 10, color: "bg-emerald-500" },
  { label: "Participation", pct: 5, color: "bg-violet-400" },
];

const BENEFITS = [
  "Real-world mentorship from industry engineers",
  "Hands-on systems programming curriculum",
  "Career-ready low-latency C++ skills",
  "Super 60 Certificate of Excellence",
  "Access to an elite peer network",
  "Project portfolio for placements",
  "Performance-tracked learning path",
  "Lifetime alumni community membership",
];

const TIMELINE = [
  {
    month: "Month 1",
    title: "Bootcamp Phase",
    desc: "Foundations, OOP, memory model — three intensive lab sessions per week.",
  },
  {
    month: "Month 2",
    title: "Intermediate Labs",
    desc: "STL, algorithms, systems programming — paired exercises with mentor review.",
  },
  {
    month: "Month 3",
    title: "Advanced & Project",
    desc: "Concurrency, low-latency design, capstone project delivery and evaluation.",
  },
];

/* ──────────────────────────────────────────────
   Sub-components
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
          <Link href="/" className="text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-brand-orange font-semibold">
            About
          </Link>
          <Link href="/workshops" className="text-slate-300 hover:text-white transition-colors">
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-orange bg-[#F07C27]/10 border border-[#F07C27]/25 mb-4">
      {children}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Page
────────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#070B14] text-foreground">
      <PublicNavbar />

      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden pt-24 pb-20 px-5">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#F07C27]/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-sky-600/5 blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <SectionLabel>
            <Star className="w-3 h-3" /> Super 60 · Skill Up
          </SectionLabel>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1] mb-6">
            About{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA048] via-[#F07C27] to-[#FFA048]">
              Skill Up
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            A high-intensity C++ workshop by Super&nbsp;60 that transforms
            engineering students into systems programmers through structured labs,
            expert mentorship, and real project work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(240,124,39,0.5)] hover:shadow-[0_0_40px_rgba(240,124,39,0.7)] hover:scale-105 active:scale-95 transition-all"
            >
              Apply for 2026 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-slate-200 font-semibold text-sm hover:bg-white/5 transition-all"
            >
              View Editions
            </Link>
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <section className="py-20 px-5 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>
                <Target className="w-3 h-3" /> Mission
              </SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-5 leading-tight">
                Engineering Excellence Through Depth
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Skill Up is Super&nbsp;60's flagship C++ workshop. We believe that
                mastering systems programming isn't a side skill — it's the foundation
                of engineering excellence. Our workshop is designed to push students
                beyond surface-level code into the world of memory-aware, low-latency,
                production-quality software.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Every cohort works through a carefully curated curriculum, from
                first-principles C++ to advanced concurrency — all under the guidance
                of experienced industry mentors who have built real systems.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: <Target className="w-5 h-5 text-brand-orange" />,
                  title: "Systems Programming",
                  desc: "Deep-dive into OS interfaces, memory, and low-level APIs.",
                },
                {
                  icon: <Code2 className="w-5 h-5 text-brand-orange" />,
                  title: "Low-Latency C++",
                  desc: "Write code that performs at microsecond timescales.",
                },
                {
                  icon: <Users className="w-5 h-5 text-brand-orange" />,
                  title: "Mentored Learning",
                  desc: "1 expert mentor per lab, guiding every student personally.",
                },
                {
                  icon: <Award className="w-5 h-5 text-brand-orange" />,
                  title: "Certified Excellence",
                  desc: "Super 60 certificate recognised by top tech companies.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-[#111827] border border-white/8 hover:border-brand-orange/30 transition-colors"
                >
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="font-display font-semibold text-sm text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Learning Journey (Timeline) ── */}
      <section className="py-20 px-5 bg-[#080D1A] border-t border-white/6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <SectionLabel>
            <BookOpen className="w-3 h-3" /> Methodology
          </SectionLabel>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
            The Learning Journey
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            A 3-month intensive program structured around weekly labs, mentor check-ins,
            and cumulative project milestones.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative flex flex-col gap-0">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-brand-orange via-[#F07C27]/40 to-transparent" />

            {TIMELINE.map((step, i) => (
              <div key={step.month} className="flex gap-6 pb-10 last:pb-0">
                {/* Node */}
                <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-[#F07C27]/15 border-2 border-brand-orange flex items-center justify-center z-10">
                  <span className="font-mono font-bold text-brand-orange text-xs">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 pt-1.5">
                  <span className="text-[11px] font-mono text-brand-orange uppercase tracking-widest">
                    {step.month}
                  </span>
                  <h3 className="font-display font-bold text-white text-lg mt-0.5 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Learn — C++ Topics Grid ── */}
      <section className="py-20 px-5 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>
              <Layers className="w-3 h-3" /> Curriculum
            </SectionLabel>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              What You Learn
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              A progressive C++ learning path that takes you from fundamentals
              to production-grade systems engineering.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CPP_TOPICS.map((topic) => (
              <div
                key={topic.title}
                className="group p-6 rounded-2xl bg-[#0E1520] border border-white/8 hover:border-brand-orange/40 hover:bg-[#111827] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F07C27]/10 border border-[#F07C27]/20 flex items-center justify-center text-brand-orange group-hover:bg-[#F07C27]/20 transition-colors">
                    {topic.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                    {topic.phase}
                  </span>
                </div>
                <h3 className="font-display font-bold text-white text-base mb-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assessment Formula ── */}
      <section className="py-20 px-5 bg-[#080D1A] border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>
              <Trophy className="w-3 h-3" /> Evaluation
            </SectionLabel>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Assessment Formula
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Your final score is calculated across five dimensions to reward
              consistent effort, not just exam performance.
            </p>
          </div>

          <div className="space-y-4">
            {ASSESSMENT_BREAKDOWN.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="w-36 text-right text-sm font-medium text-slate-300 flex-shrink-0">
                  {item.label}
                </span>
                <div className="flex-1 h-3 bg-white/6 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="w-10 text-sm font-mono font-bold text-white flex-shrink-0">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] font-mono text-slate-500 mt-8">
            Total = 100% · Minimum passing score: 60% · Certificate threshold: 75%
          </p>
        </div>
      </section>

      {/* ── Mentoring System ── */}
      <section className="py-20 px-5 border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>
              <Users className="w-3 h-3" /> Mentors
            </SectionLabel>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              The Mentoring System
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Each lab operates under the dedicated guidance of one expert mentor —
              ensuring no student is left behind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stat: "1",
                unit: "Mentor / Lab",
                desc: "Every lab has a dedicated expert who monitors all student progress personally.",
                color: "text-brand-orange",
              },
              {
                stat: "15–30",
                unit: "Students / Lab",
                desc: "Small cohorts guarantee hands-on attention and immediate doubt resolution.",
                color: "text-sky-400",
              },
              {
                stat: "3",
                unit: "Months Intensive",
                desc: "Weekly labs, mentor check-ins, and milestone reviews keep everyone on track.",
                color: "text-emerald-400",
              },
            ].map((card) => (
              <div
                key={card.unit}
                className="p-7 rounded-2xl bg-[#0E1520] border border-white/8 text-center"
              >
                <div className={`font-display font-extrabold text-5xl mb-1 ${card.color}`}>
                  {card.stat}
                </div>
                <div className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-4">
                  {card.unit}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selection Process ── */}
      <section className="py-20 px-5 bg-[#080D1A] border-t border-white/6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionLabel>
                <Award className="w-3 h-3" /> Selection
              </SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-5 leading-tight">
                How Candidates Are Selected
              </h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Skill Up is not open to everyone — it's designed for the top
                performers. After applications open, candidates go through a
                structured evaluation that tests aptitude, logical thinking, and
                basic programming concepts.
              </p>
              <p className="text-slate-400 leading-relaxed">
                The <span className="text-white font-semibold">Top 60</span> candidates
                ranked by evaluation score are admitted into the workshop. Labs are
                formed from these 60 students based on performance bands.
              </p>

              <div className="mt-8 flex items-center gap-4 p-5 rounded-2xl bg-[#F07C27]/8 border border-[#F07C27]/25">
                <Trophy className="w-8 h-8 text-brand-orange flex-shrink-0" />
                <div>
                  <div className="font-display font-bold text-white text-lg">Top 60</div>
                  <div className="text-sm text-slate-300">
                    Selected by evaluation score from all applicants
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <SectionLabel>
                <CheckCircle className="w-3 h-3" /> Benefits
              </SectionLabel>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-6 leading-tight">
                What You Gain
              </h2>
              <ul className="space-y-3">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-4.5 h-4.5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300 leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24 px-5 border-t border-white/6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F07C27]/6 via-transparent to-sky-900/5" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#F07C27]/10 border border-[#F07C27]/30 text-brand-orange text-[11px] font-mono font-bold uppercase tracking-widest">
            <Star className="w-3 h-3" /> Registrations Open
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-4">
            Register for Skill Up 2026
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            Applications are reviewed by the admin team. Top candidates are admitted
            into the workshop. Don't miss your shot at the most rigorous C++ program
            for students.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-[0_0_30px_rgba(240,124,39,0.5)] hover:shadow-[0_0_50px_rgba(240,124,39,0.7)] hover:scale-105 active:scale-95 transition-all"
            >
              Apply Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-slate-200 font-semibold text-sm hover:bg-white/5 transition-all"
            >
              Already applied? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-5 text-center">
        <p className="text-xs font-mono text-slate-500">
          © 2026 Skill Up · Powered by{" "}
          <span className="text-brand-orange">Super 60</span> · All rights reserved.
        </p>
      </footer>
    </div>
  );
}
