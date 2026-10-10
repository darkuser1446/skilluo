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
  Check,
  ArrowRight,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Calendar,
  Sparkles,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Workshop 6-Day Roadmap & Pillars
────────────────────────────────────────────── */
const WORKSHOP_PILLARS = [
  {
    step: "01",
    title: "Core Foundations",
    desc: "Syntax, variables, primitive types, operators, and standard I/O streams.",
    icon: Code2,
  },
  {
    step: "02",
    title: "Revision & Practice",
    desc: "Daily problem solving, decision-making drills, loop invariants, and logic puzzles.",
    icon: Target,
  },
  {
    step: "03",
    title: "Real-World Project Practice",
    desc: "Hands-on CLI systems: ATM machines, calculators, quiz engines, converters, and patterns.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Project Review & Guidance",
    desc: "Line-by-line code audits, compiler error clinics, and 1-on-1 guidance from lead mentors.",
    icon: Award,
  },
];

const WORKSHOP_SCHEDULE_DAYS = [
  {
    day: "Day 1",
    date: "12 Oct",
    title: "C++ Fundamentals",
    focus: "Syntax, variables, data types, I/O and operators",
    tag: "FOUNDATION",
  },
  {
    day: "Day 2",
    date: "13 Oct",
    title: "Conditional Statements",
    focus: "if/else, switch and decision-making problems",
    tag: "BRANCHING",
  },
  {
    day: "Day 3",
    date: "14 Oct",
    title: "Loops",
    focus: "for, while, do-while, break, continue and logic problems",
    tag: "ITERATION",
  },
  {
    day: "Day 4",
    date: "15 Oct",
    title: "Patterns & Basic CLI",
    focus: "Nested loops, pattern printing and menu-driven programs",
    tag: "2D MATRICES",
  },
  {
    day: "Day 5",
    date: "16 Oct",
    title: "Advanced CLI & Project",
    focus: "Calculator, ATM, quiz, converter or pattern generator",
    tag: "CAPSTONES",
  },
  {
    day: "Day 6",
    date: "Optional",
    title: "Doubt Solving & Real-World Practice",
    focus: "Revision, debugging, project practice and project guidance",
    tag: "CLINIC & REVIEW",
  },
];

const LEAD_MENTORS = [
  { name: "Ayush Mitra", role: "Lead Systems Architect", lab: "Lab 1", focus: "Architecture & I/O", image: "/mentors/ayush.webp" },
  { name: "Ranjeet", role: "Algorithm & Memory Specialist", lab: "Lab 2", focus: "Conditionals & Logic", image: "/mentors/ranjeet.webp" },
  { name: "Ramanand", role: "Systems Engineer", lab: "Lab 3", focus: "Loops & Accumulators", image: "/mentors/ramanand.webp" },
  { name: "Sontu", role: "Console Software Engineer", lab: "Lab 4", focus: "Pattern Matrices & CLI", image: "/mentors/sontu.webp" },
  { name: "Kamal", role: "Virtual Lab Coordinator", lab: "Online Track", focus: "Live Debugging & Review", image: "/mentors/kamal.webp" },
];

const ASSESSMENT_BREAKDOWN = [
  { label: "Technical Assessments & Tests", pct: 35, barColor: "bg-[#F07C27]" },
  { label: "Graded Assignments & Projects", pct: 30, barColor: "bg-[#111111]" },
  { label: "Attendance & Lab Pod Hours", pct: 15, barColor: "bg-sky-600" },
  { label: "Daily Problem-Solving Exercises", pct: 10, barColor: "bg-emerald-600" },
  { label: "Doubt Resolution & Engagement", pct: 10, barColor: "bg-violet-600" },
];

const BENEFITS = [
  "Direct 1-on-1 mentorship from 5 experienced systems guides",
  "Intensive hands-on C++ workshop curriculum (12–16 Oct + Optional Day 6)",
  "Ship complete CLI capstones: ATM System, Calculator, Quiz Engine, Converter",
  "Cryptographically verifiable Certificate of Completion issued by Super 60",
  "Merit qualification for the 10 coveted Super 60 incubator seats",
  "Live compiler error debugging clinic and automated test assertion feedback",
  "Access to an active peer network of 500+ historical cohort alumni",
  "Continuous transparent performance telemetry and cohort rank tracking",
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#F9F9F9] text-[#111111] overflow-x-hidden">
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
            <Link href="/workshops" className="text-slate-600 hover:text-[#111111] hover:underline underline-offset-4">
              Workshops
            </Link>
            <Link href="/about" className="text-[#F07C27] underline underline-offset-8 decoration-[3px]">
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
              <span>Join 2026</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-12">
        <div className="flex flex-col items-start gap-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#111111] text-white font-mono text-xs font-bold px-3 py-1.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest">
            <Star className="w-3.5 h-3.5 text-[#F07C27]" />
            [ DOSSIER // SKILL UP WORKSHOP INITIATIVE ]
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[#111111] tracking-tight uppercase leading-[1.05]">
            ABOUT <span className="bg-[#FFF0E5] px-2 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111]">SKILL UP</span> —{" "}
            <span className="bg-[#F07C27] text-white px-3 py-0.5 border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] inline-block -rotate-1">
              SYSTEMS RIGOR
            </span>
          </h1>

          <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl font-medium mt-1">
            Skill Up is Super 60&apos;s intensive 1-week C++ workshop (12–16 Oct + Optional Day 6).
            Designed to mentor engineering students through fundamental syntax, decision logic, loop invariants,
            and real-world CLI capstones (ATM, Calculator, Quiz, Converters) with direct guidance from 5 lead mentors.
          </p>

          {/* Quick Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mt-4">
            {[
              { label: "TRAINED ALUMNI", val: "500+ TRAINED" },
              { label: "COHORT CAPACITY", val: "10 SEATS" },
              { label: "WORKSHOP TIMELINE", val: "12 OCT – 16 OCT" },
              { label: "LEAD MENTORS", val: "5 EXPERT GUIDES" },
            ].map((t) => (
              <div
                key={t.label}
                className="bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-3 text-left"
              >
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">{t.label}</div>
                <div className="font-display font-black text-sm sm:text-base text-[#111111] mt-0.5">{t.val}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link
              href="/register"
              className="neo-btn bg-[#F07C27] text-white px-6 py-2.5 text-xs font-black uppercase flex items-center gap-2"
            >
              <span>APPLY FOR 2026</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/curriculum"
              className="neo-btn bg-white text-[#111111] px-6 py-2.5 text-xs font-black uppercase"
            >
              VIEW 6-DAY SYLLABUS
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & 4 Core Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t-[3px] border-[#111111]">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
              [ MISSION STATEMENT ]
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight leading-tight">
              ENGINEERING EXCELLENCE THROUGH DEPTH
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              We reject shallow surface-level coding tutorials. Mastering systems programming
              isn&apos;t a hobby — it is the bedrock of world-class software engineering. Our workshop is
              engineered to push candidates through core memory models, syntax precision, algorithmic
              control flow, and production-grade console application architecture.
            </p>
            <div className="bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4 font-mono text-xs font-bold text-[#111111]">
              &quot;If you understand fundamental logic down to byte boundaries, you can build anything.&quot;
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {WORKSHOP_PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-[#111111] text-[#F07C27] font-mono font-black text-xs px-2 py-0.5 border border-[#111111]">
                        PILLAR {p.step}
                      </span>
                      <div className="w-8 h-8 bg-[#FFF0E5] border-[2px] border-[#111111] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#F07C27]" />
                      </div>
                    </div>
                    <h3 className="font-display font-black text-sm text-[#111111] uppercase mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-700 font-semibold leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6-Day Workshop Schedule Timeline */}
      <section className="bg-slate-50 border-t-[3px] border-b-[3px] border-[#111111] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b-[3px] border-[#111111] pb-4">
            <div>
              <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
                [ WORKSHOP TIMELINE // 12–16 OCT ]
              </span>
              <h2 className="font-display font-black text-3xl text-[#111111] uppercase tracking-tight mt-2">
                6-DAY DAY-BY-DAY EXECUTION SPRINT
              </h2>
            </div>
            <Link
              href="/curriculum"
              className="neo-btn-sm bg-white text-[#111111] px-4 py-2 text-xs font-bold uppercase self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>INSPECT FULL LAB CODE</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F07C27]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WORKSHOP_SCHEDULE_DAYS.map((step) => (
              <div
                key={step.day}
                className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2 mb-3">
                    <span className="bg-[#111111] text-white font-mono font-black text-xs px-2 py-0.5 border border-[#111111]">
                      {step.day}
                    </span>
                    <span className="bg-[#FFF0E5] text-[#C2410C] font-mono text-xs font-bold px-2 py-0.5 border border-[#111111]">
                      {step.date}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base text-[#111111] uppercase mb-1">
                    {step.title}
                  </h3>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-2">
                    {step.tag}
                  </div>
                  <p className="text-xs font-mono text-slate-700 font-semibold leading-relaxed">
                    {step.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Lead Mentors Roster */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b-[3px] border-[#111111] pb-4">
          <div>
            <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
              [ FACULTY &amp; GUIDES ]
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-[#111111] uppercase tracking-tight mt-2">
              MEET OUR 5 LEAD MENTORS
            </h2>
          </div>
          <span className="font-mono text-xs font-bold bg-[#FFF0E5] text-[#C2410C] border-[2px] border-[#111111] px-3 py-1 shadow-[2px_2px_0px_#111111]">
            4 OFFLINE LABS + 1 ONLINE TRACK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {LEAD_MENTORS.map((m) => (
            <div
              key={m.name}
              className="bg-white border-[3px] border-[#111111] shadow-[5px_5px_0px_#111111] p-3.5 flex flex-col justify-between group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111111] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="bg-[#111111] text-[#F07C27] font-mono text-[10px] font-black px-2 py-0.5 border border-[#111111]">
                    {m.lab}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">
                    LEAD MENTOR
                  </span>
                </div>

                {/* Portrait Frame */}
                <div className="relative aspect-[4/5] w-full border-[2px] border-[#111111] overflow-hidden mb-3 bg-[#111111] shadow-[2px_2px_0px_#111111]">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h3 className="font-display font-black text-base text-[#111111] uppercase leading-tight">
                  {m.name}
                </h3>
                <div className="text-[11px] font-mono text-slate-600 font-bold mt-0.5">
                  {m.role}
                </div>
                <div className="mt-3 pt-2 border-t border-[#111111]/20 text-[10px] font-mono text-slate-700">
                  <span className="font-bold text-[#111111]">Focus:</span> {m.focus}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assessment Formula & 10 Seats Selection */}
      <section className="bg-[#FFF0E5] border-t-[3px] border-b-[3px] border-[#111111] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: Formula Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
                  [ EVALUATION METRIC ]
                </span>
                <h2 className="font-display font-black text-3xl text-[#111111] uppercase tracking-tight mt-2">
                  TRANSPARENT ASSESSMENT FORMULA
                </h2>
                <p className="text-xs sm:text-sm font-mono text-slate-700 font-bold mt-1">
                  Your workshop standing is calculated across 5 weighted dimensions to reward continuous
                  problem solving and active lab participation. Top performers secure the 10 coveted Super 60 seats.
                </p>
              </div>

              <div className="space-y-3 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6">
                {ASSESSMENT_BREAKDOWN.map((dim) => (
                  <div key={dim.label}>
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span className="text-[#111111]">{dim.label}</span>
                      <span className="text-[#111111]">{dim.pct}% WEIGHT</span>
                    </div>
                    <div className="h-4 bg-[#F4F3F3] border-[2px] border-[#111111] overflow-hidden">
                      <div
                        className={`h-full ${dim.barColor}`}
                        style={{ width: `${dim.pct}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t-[2px] border-[#111111] text-[11px] font-mono text-slate-700 font-bold flex justify-between">
                  <span>TOTAL WEIGHT: 100%</span>
                  <span className="text-[#F07C27]">SELECTION QUOTA: TOP 10 SEATS</span>
                </div>
              </div>
            </div>

            {/* Right: Benefits Checklist */}
            <div className="lg:col-span-5 bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-6 sm:p-8">
              <span className="bg-[#F07C27] text-white font-mono text-[10px] font-bold px-2 py-0.5 border-[2px] border-[#111111] uppercase tracking-wider">
                [ INDUCTION PERKS ]
              </span>
              <h3 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight my-2">
                WHAT YOU GAIN
              </h3>
              <ul className="space-y-2 mt-4">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium font-mono">
                    <span className="w-4 h-4 bg-[#FFF0E5] border-[1.5px] border-[#111111] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#111111] stroke-[3]" />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t-[2px] border-[#111111]">
                <Link
                  href="/register"
                  className="neo-btn w-full bg-[#111111] text-white py-2.5 text-xs font-black uppercase text-center block"
                >
                  SUBMIT APPLICATION FOR 2026
                </Link>
              </div>
            </div>
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
            <span>© 2026 Skill Up · 6-Day Intensive C++ Workshop (12–16 Oct)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/curriculum" className="hover:text-white">Curriculum</Link>
            <Link href="/workshops" className="hover:text-white">Workshops</Link>
            <Link href="/about" className="text-[#F07C27]">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
