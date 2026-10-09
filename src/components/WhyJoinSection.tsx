"use client";

import React from "react";
import { Video, FileText, Users, BookOpen, Target, Award, Sparkles, CheckCircle2 } from "lucide-react";

const REASONS = [
  {
    icon: Video,
    title: "LIVE INTERACTION",
    description: "Engage directly with lab mentors to conduct live debugging and code reviews.",
    badge: "1:1 SYNC // SLA < 15M",
  },
  {
    icon: FileText,
    title: "SYSTEMS ASSIGNMENTS",
    description: "Solve low-level challenges checked by strict automated test assertion suites.",
    badge: "VALGRIND & ASAN STRICT",
  },
  {
    icon: Users,
    title: "SUPER 60 PEER CADRE",
    description: "Surround yourself with the top aspiring software engineers in your cohort.",
    badge: "500+ COHORT NETWORK",
  },
  {
    icon: BookOpen,
    title: "STRUCTURED ARCHITECTURE",
    description: "Curated lecture blueprints, memory diagrams, and C++20 standard guides.",
    badge: "ISO C++20 / 23 SPEC",
  },
  {
    icon: Target,
    title: "LOW-LATENCY LABS",
    description: "Benchmark your code against hardware constraints and algorithmic Big-O goals.",
    badge: "HARDWARE ALIGNED O(1)",
  },
  {
    icon: Award,
    title: "SUPER 60 SELECTION",
    description: "Top rankers secure direct induction into the Super 60 systems incubator.",
    badge: "SELECTION QUOTA: 10 SEATS",
  },
];

export default function WhyJoinSection() {
  return (
    <section
      id="why-join"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Heading & Manifesto */}
          <div className="lg:col-span-4 flex flex-col items-start gap-3">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest inline-block">
              [ SECTION 06 // VALUE SPEC ]
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              MORE THAN{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                JUST A COURSE
              </span>
            </h2>

            <p className="font-body text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
              Skill Up is engineered as a talent forge. It tests your persistence, builds engineering discipline, and prepares you for premier systems programming benchmarks.
            </p>

            {/* Decal Block */}
            <div className="mt-2 bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] p-3 w-full">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]" />
                <span className="font-mono text-xs font-bold text-[#111111] uppercase">
                  100% AUDITED LAB RUNS
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600">
                Rigorous 4-week sprint evaluated against standard industry metrics.
              </p>
            </div>
          </div>

          {/* Right Column: 6 Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {REASONS.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-4 sm:p-5 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] transition-all group"
                >
                  <div>
                    {/* Header Strip */}
                    <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5 mb-3">
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        SPEC 0{idx + 1}
                      </span>
                      <div className="w-8 h-8 bg-[#FFF0E5] border-[2px] border-[#111111] flex items-center justify-center text-[#F07C27]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-display font-black text-sm text-[#111111] uppercase tracking-tight mb-2">
                      {reason.title}
                    </h3>

                    <p className="font-body text-slate-700 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                      {reason.description}
                    </p>
                  </div>

                  <div className="mt-auto bg-[#F4F3F3] border-[2px] border-[#111111] p-2 text-[10px] font-mono font-bold text-[#111111] truncate">
                    {reason.badge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
