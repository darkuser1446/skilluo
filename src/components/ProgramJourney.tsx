"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Terminal,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCode2,
  FolderGit2,
} from "lucide-react";

interface WorkshopDay {
  day: string;
  date: string;
  isOptional?: boolean;
  topic: string;
  focus: string;
  deliverables: string[];
  codeTag: string;
}

const WORKSHOP_DAYS: WorkshopDay[] = [
  {
    day: "DAY 1",
    date: "12 OCT",
    topic: "C++ Fundamentals",
    focus: "Syntax, variables, data types, I/O and operators",
    deliverables: ["Compiler setup & main()", "cin / cout fast streams", "Arithmetic & logic operators"],
    codeTag: "std::cout << \"Hello World\";",
  },
  {
    day: "DAY 2",
    date: "13 OCT",
    topic: "Conditional Statements",
    focus: "if/else, switch and decision-making problems",
    deliverables: ["Branching & truth tables", "Switch-case dispatch", "Decision-making algorithms"],
    codeTag: "if (score >= 90) { ... }",
  },
  {
    day: "DAY 3",
    date: "14 OCT",
    topic: "Loops",
    focus: "for, while, do-while, break, continue and logic problems",
    deliverables: ["Iterative execution models", "Loop break & continue control", "Series & mathematical logic"],
    codeTag: "while (running) { loop(); }",
  },
  {
    day: "DAY 4",
    date: "15 OCT",
    topic: "Patterns & Basic CLI",
    focus: "Nested loops, pattern printing and menu-driven programs",
    deliverables: ["2D coordinate nested loops", "Pyramid & diamond patterns", "Interactive console menus"],
    codeTag: "for(int i=0; i<n; i++) for(...)",
  },
  {
    day: "DAY 5",
    date: "16 OCT",
    topic: "Advanced CLI & Project",
    focus: "Calculator, ATM, quiz, converter or pattern generator",
    deliverables: ["Flagship CLI architecture", "State management & input loop", "Real-world terminal deployment"],
    codeTag: "ATM::processTransaction()",
  },
  {
    day: "DAY 6",
    date: "OPTIONAL",
    isOptional: true,
    topic: "Doubt Solving & Real-World Practice",
    focus: "Revision, debugging, project practice and project guidance",
    deliverables: ["1-on-1 mentor code audits", "Compiler error & bug clinic", "Final project certification"],
    codeTag: "gdb --tui ./project_bin",
  },
];

const PEDAGOGY_PILLARS = [
  {
    num: "01",
    title: "Core Foundations",
    desc: "Syntax, variables, type memory models, and standard I/O streams.",
  },
  {
    num: "02",
    title: "Revision & Practice",
    desc: "Daily problem-solving drills, logic problems, and loop invariants.",
  },
  {
    num: "03",
    title: "Real-World Project Practice",
    desc: "Hands-on CLI engineering: Calculator, ATM, Quiz, Converter & Patterns.",
  },
  {
    num: "04",
    title: "Project Review & Guidance",
    desc: "1-on-1 mentor reviews, live debugging, and individual project guidance.",
  },
];

export default function ProgramJourney() {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const activeDay = WORKSHOP_DAYS[activeDayIdx];

  return (
    <section
      id="program"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-2.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#F07C27]" />
              <span>[ SECTION 03 // WORKSHOP OVERVIEW ]</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              6-DAY INTENSIVE{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                WORKSHOP ROADMAP
              </span>
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="font-mono text-xs font-bold bg-[#FFF0E5] text-[#C2410C] border-[2px] border-[#111111] px-3 py-1.5 shadow-[2px_2px_0px_#111111]">
              12 OCT – 16 OCT (+ OPTIONAL DAY 6)
            </span>
            <Link
              href="/curriculum"
              className="neo-btn-sm bg-[#111111] text-white px-4 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5"
            >
              <span>FULL SYLLABUS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F07C27]" />
            </Link>
          </div>
        </div>

        {/* 4 Core Pedagogical Pillars Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {PEDAGOGY_PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-4 flex items-start gap-3"
            >
              <span className="bg-[#111111] text-[#F07C27] font-mono font-black text-xs px-2 py-1 border border-[#111111]">
                {pillar.num}
              </span>
              <div>
                <h4 className="font-display font-black text-xs uppercase text-[#111111] tracking-tight">
                  {pillar.title}
                </h4>
                <p className="text-[11px] font-mono text-slate-600 mt-0.5 font-medium leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 6-Day Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORKSHOP_DAYS.map((d, idx) => {
            const isSelected = activeDayIdx === idx;
            return (
              <div
                key={d.day}
                onClick={() => setActiveDayIdx(idx)}
                className={`bg-white border-[3px] border-[#111111] p-5 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? "shadow-[8px_8px_0px_#F07C27] -translate-y-1 bg-[#FFFDF9]"
                    : "shadow-[6px_6px_0px_#111111] hover:shadow-[8px_8px_0px_#111111] hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Top Bar with Date & Day badge */}
                  <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#111111] text-white font-mono font-black text-xs px-2 py-0.5 border border-[#111111]">
                        {d.day}
                      </span>
                      <span
                        className={`font-mono text-xs font-black px-2 py-0.5 border-[2px] border-[#111111] ${
                          d.isOptional
                            ? "bg-amber-100 text-amber-900"
                            : "bg-[#FFF0E5] text-[#C2410C]"
                        }`}
                      >
                        {d.date}
                      </span>
                    </div>
                    {d.isOptional && (
                      <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 px-1.5 py-0.5 border border-[#111111]">
                        OPTIONAL
                      </span>
                    )}
                  </div>

                  {/* Topic Title */}
                  <h3 className="font-display font-black text-lg text-[#111111] uppercase tracking-tight mb-2">
                    {d.topic}
                  </h3>

                  {/* Practical Focus */}
                  <div className="bg-slate-50 border-[1.5px] border-[#111111] p-2.5 mb-3">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                      Practical Focus:
                    </div>
                    <p className="text-xs font-mono font-semibold text-slate-800 leading-snug">
                      {d.focus}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <ul className="space-y-1.5">
                    {d.deliverables.map((item) => (
                      <li
                        key={item}
                        className="text-xs text-slate-700 flex items-start gap-2 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F07C27] flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Code Stamp */}
                <div className="mt-5 pt-3 border-t-[2px] border-[#111111] flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500 truncate max-w-[200px]">
                    <code>{d.codeTag}</code>
                  </span>
                  <span className="font-bold text-[#F07C27] flex items-center gap-1">
                    DETAILS <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Day 5 Capstone Projects Spotlight Banner */}
        <div className="mt-12 bg-[#111111] text-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#F07C27] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-[2px] border-white/20 pb-4 mb-6">
            <div>
              <span className="bg-[#F07C27] text-white font-mono text-[11px] font-black px-2 py-0.5 uppercase tracking-wider inline-block mb-1.5">
                ★ DAY 5 CAPSTONE PROJECTS
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
                REAL-WORLD CLI APPLICATIONS
              </h3>
            </div>
            <p className="text-xs font-mono text-slate-300 max-w-md md:text-right">
              Students build and deploy standalone console applications with interactive menus and persistent states.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "ATM System", desc: "PIN auth, balance, deposits & withdrawals" },
              { name: "CLI Calculator", desc: "Multi-operation math engine & memory" },
              { name: "Quiz Engine", desc: "Scored interactive questions & timers" },
              { name: "Converter", desc: "Unit, temperature & currency conversions" },
              { name: "Pattern Generator", desc: "Dynamic coordinate 2D ASCII matrices" },
            ].map((proj) => (
              <div
                key={proj.name}
                className="bg-white/5 border border-white/20 p-3 hover:border-[#F07C27] hover:bg-white/10 transition-all"
              >
                <div className="font-display font-black text-xs uppercase text-[#F07C27]">
                  {proj.name}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 leading-snug">
                  {proj.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA & Link to full syllabus */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F07C27] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white font-black">
              C++
            </div>
            <div>
              <div className="font-display font-black text-sm uppercase text-[#111111]">
                WANT THE DEEP DIVE SYLLABUS WITH CODE TESTBENCHES?
              </div>
              <div className="font-mono text-xs text-slate-700">
                Explore the complete day-by-day interactive terminal specs and mentor review criteria.
              </div>
            </div>
          </div>
          <Link
            href="/curriculum"
            className="neo-btn bg-[#111111] text-white px-5 py-2.5 text-xs font-bold uppercase whitespace-nowrap flex items-center gap-2 hover:bg-[#F07C27] transition-colors"
          >
            <span>VIEW FULL CURRICULUM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
