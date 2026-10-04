"use client";

import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Code2,
  Cpu,
  Rocket,
  Trophy,
} from "lucide-react";
import InteractiveTileGrid from "@/components/InteractiveTileGrid";
import Super60Logo from "@/components/Super60Logo";

interface Module {
  n: number;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  summary: string;
  topics: string[];
  color: string;
}

/* Structured C++ learning path — FEATURES.md §13 */
const MODULES: Module[] = [
  {
    n: 1,
    title: "C++ Basics",
    level: "Beginner",
    hours: 4,
    summary: "How C++ programs run — from source to binary.",
    topics: ["Program structure & main()", "Input / Output (cin, cout)", "Compilation pipeline", "Comments & style"],
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  },
  {
    n: 2,
    title: "Variables, Data Types & Operators",
    level: "Beginner",
    hours: 5,
    summary: "Store and transform data safely.",
    topics: ["int, float, char, bool, string", "Type casting & ranges", "Arithmetic / relational / logical operators", "Scope & const"],
    color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  },
  {
    n: 3,
    title: "Conditionals & Loops",
    level: "Beginner",
    hours: 6,
    summary: "Control the flow of execution.",
    topics: ["if / else / switch", "for, while, do-while", "break & continue", "Nested loops & patterns"],
    color: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  },
  {
    n: 4,
    title: "Functions, Arrays & Strings",
    level: "Beginner",
    hours: 7,
    summary: "Build reusable logic and process collections.",
    topics: ["Function overloading", "Pass by value vs reference", "1D/2D arrays", "C-strings vs std::string"],
    color: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  },
  {
    n: 5,
    title: "Pointers & References",
    level: "Intermediate",
    hours: 8,
    summary: "The heart of systems programming.",
    topics: ["Pointer arithmetic", "Dynamic memory (new/delete)", "References & dereferencing", "Dangling pointers & memory leaks"],
    color: "from-brand-orange/20 to-brand-orange/5 border-brand-orange/40",
  },
  {
    n: 6,
    title: "Structures & Enums",
    level: "Intermediate",
    hours: 4,
    summary: "Group related data into custom types.",
    topics: ["struct & member access", "Nested structures", "enum & enum class", "typedef / using"],
    color: "from-brand-orange/20 to-brand-orange/5 border-brand-orange/40",
  },
  {
    n: 7,
    title: "Classes & Object-Oriented Programming",
    level: "Intermediate",
    hours: 10,
    summary: "Model real systems with objects.",
    topics: ["Class design & encapsulation", "Constructors & destructors", "this pointer", "Operator overloading", "Static members"],
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
  },
  {
    n: 8,
    title: "Inheritance & Polymorphism",
    level: "Intermediate",
    hours: 8,
    summary: "Reuse and extend behavior.",
    topics: ["Single & multiple inheritance", "Virtual functions & vtable", "Abstract classes", "Override / final", "Runtime vs compile-time polymorphism"],
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
  },
  {
    n: 9,
    title: "Templates & Generic Programming",
    level: "Advanced",
    hours: 6,
    summary: "Write once, work for any type.",
    topics: ["Function templates", "Class templates", "Template specialization", "Variadic basics"],
    color: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
  },
  {
    n: 10,
    title: "STL & Algorithms",
    level: "Advanced",
    hours: 12,
    summary: "The Standard Template Library toolkit.",
    topics: ["vector, deque, array", "map / unordered_map / set", "stack & queue", "iterators", "<algorithm>: sort, lower_bound, accumulate"],
    color: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
  },
  {
    n: 11,
    title: "Problem Solving",
    level: "Advanced",
    hours: 10,
    summary: "Turn problems into efficient C++ solutions.",
    topics: ["Complexity analysis (Big-O)", "Two pointers & sliding window", "Recursion & backtracking", "Basic graph & DP patterns"],
    color: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  },
  {
    n: 12,
    title: "Advanced C++",
    level: "Advanced",
    hours: 8,
    summary: "Modern C++ for production systems.",
    topics: ["Move semantics & rvalues", "Smart pointers (unique/shared)", "RAII & rule of zero/three/five", "Concurrency basics (threads)"],
    color: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  },
];

const LEVEL_ICON = { Beginner: BookOpen, Intermediate: Code2, Advanced: Cpu } as const;

export default function CurriculumPage() {
  const totalHours = MODULES.reduce((s, m) => s + m.hours, 0);

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-white overflow-x-hidden">
      <InteractiveTileGrid tileSize={48} />

      {/* header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Super60Logo size="sm" subtitleText="SKILL UP" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/workshops"
              className="hidden sm:inline text-xs uppercase tracking-wider font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Editions
            </Link>
            <Link
              href="/login"
              className="text-xs uppercase tracking-wider font-semibold text-white px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight shadow-[0_0_20px_rgba(240,124,39,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-orange bg-brand-orange/10 border border-brand-orange/25 mb-5">
          <Terminal className="w-3.5 h-3.5" /> C++ Learning Path
        </span>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-4">
          From first <span className="text-brand-orange">cout</span> to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange">
            smart pointers
          </span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          The complete Skill Up curriculum — {MODULES.length} modules, ~{totalHours} hours of
          mentored labs, exercises and graded assessments. Every topic maps to exercises and tests
          inside your dashboard.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-7 py-3 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(240,124,39,0.5)] hover:scale-105 transition-all flex items-center gap-2"
          >
            Join the workshop <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-7 py-3 rounded-full border border-white/20 hover:border-brand-orange/60 hover:bg-white/5 text-slate-200 font-display font-semibold text-sm transition-all"
          >
            Open my dashboard
          </Link>
        </div>
      </section>

      {/* modules */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map((m) => {
            const Icon = LEVEL_ICON[m.level];
            return (
              <div
                key={m.n}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${m.color} border backdrop-blur-sm hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center font-mono font-black text-brand-orange flex-shrink-0">
                      {String(m.n).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-white text-base leading-tight truncate">
                        {m.title}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        {m.level} · ~{m.hours}h
                      </span>
                    </div>
                  </div>
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-brand-orange transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mb-3">{m.summary}</p>
                <ul className="space-y-1.5">
                  {m.topics.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* how it works strip */}
        <div className="mt-12 rounded-2xl p-8 bg-[#0F172A]/70 border border-slate-800/80 text-center space-y-4">
          <h2 className="font-display font-bold text-2xl text-white flex items-center justify-center gap-2">
            <Rocket className="w-6 h-6 text-brand-orange" /> How you learn here
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            {[
              { step: "1", title: "Study notes", desc: "Mentor-published notes & code examples per topic" },
              { step: "2", title: "Solve exercises", desc: "Graded C++ exercises with instant status tracking" },
              { step: "3", title: "Ship assignments", desc: "Real systems tasks reviewed by mentors" },
              { step: "4", title: "Prove it in tests", desc: "Timed quizzes & exams feeding your scorecard" },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-brand-orange/15 border border-brand-orange/40 text-brand-orange text-xs font-mono font-black flex items-center justify-center mb-2">
                  {s.step}
                </span>
                <h4 className="font-display font-bold text-white text-sm">{s.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 text-xs font-mono text-slate-500">
            <Trophy className="w-4 h-4 text-amber-400" />
            Top performers are selected for <strong className="text-brand-orange">Super 60</strong>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs font-mono text-slate-500">
        © 2026 Skill Up · An initiative of <span className="text-brand-orange">Super 60</span>
      </footer>
    </div>
  );
}


