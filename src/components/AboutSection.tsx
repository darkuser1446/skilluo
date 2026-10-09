"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Code, Users, BarChart3, ArrowRight, Cpu, Layers } from "lucide-react";

const ABOUT_FEATURES = [
  {
    tag: "MODULE 01",
    icon: BookOpen,
    title: "BEGINNER FRIENDLY",
    description: "Step-by-step syllabus covering fundamental syntax and structured problem solving.",
    graphic: "STEP 01 ➔ STEP 02 ➔ STEP 03",
  },
  {
    tag: "MODULE 02",
    icon: Code,
    title: "C++ SYSTEMS FOCUSED",
    description: "Deep dive into pointers, raw memory layout, compile-time flags, and zero-cost abstractions.",
    graphic: "int* ptr = &val; // Zero Overhead",
  },
  {
    tag: "MODULE 03",
    icon: Users,
    title: "EXPERT MENTORSHIP",
    description: "Hands-on guidance and code audits from Super 60 alumni and systems engineers.",
    graphic: "1:1 AUDITS // SLA < 15 MIN",
  },
  {
    tag: "MODULE 04",
    icon: BarChart3,
    title: "PRACTICAL LAB BENCH",
    description: "Daily interactive testbenches, automated test assertion runs, and live performance metrics.",
    graphic: "TESTS PASSED // 0 LEAKS",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header Block & Visual Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-12">
          {/* Left Column: Heading & Mission */}
          <div className="lg:col-span-7 flex flex-col items-start gap-3.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest inline-block">
              [ SECTION 02 // ABOUT SKILL UP ]
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              A STRONGER START{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1 mt-1 sm:mt-0">
                FOR BRIGHTER FUTURES
              </span>
            </h2>

            <p className="font-body text-slate-700 text-sm sm:text-base leading-relaxed max-w-2xl mt-2 font-medium">
              Skill Up is an initiative by Super 60 designed to mentor students through a rigorous, transparent systems programming crucible. We strip away superficial tutorials in favor of raw memory reasoning, low-level mechanics, and continuous competitive evaluations.
            </p>
          </div>

          {/* Right Column: Physical Poster with Classroom Stamp */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#FFF0E5] border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] p-3 sm:p-4 relative">
              <div className="flex justify-between items-center border-b-[2px] border-[#111111] pb-2 mb-3">
                <span className="font-mono text-[10px] font-bold bg-[#111111] text-white px-2 py-0.5 uppercase">
                  COHORT SESSIONS // LIVE
                </span>
                <span className="font-mono text-xs font-bold text-[#111111]">
                  LAB ID: DELTA-03
                </span>
              </div>

              {/* Photo Frame */}
              <div className="relative h-56 sm:h-64 w-full border-[3px] border-[#111111] overflow-hidden bg-slate-100">
                <Image
                  src="/img/session-3.jpg"
                  alt="Super 60 Classroom Mentorship Session — Lab Delta-03"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Decal Card */}
              <div className="mt-3 bg-[#FFFFFF] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-2.5 flex items-center justify-between text-xs font-mono font-bold text-[#111111]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#F07C27] inline-block" />
                  PEDAGOGY: 100% PRACTICAL
                </span>
                <span className="text-slate-600">ZERO GIMMICK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Pipeline Bar */}
        <div className="mb-10 p-3 sm:p-4 bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#111111] text-[#F07C27] flex items-center justify-center font-bold">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
              SYSTEMS ARCHITECTURE PIPELINE:
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono">
            <span className="bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] px-2 py-0.5 font-bold">
              01. SYNTAX &amp; MAIN()
            </span>
            <span className="font-bold text-[#111111]">➔</span>
            <span className="bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] px-2 py-0.5 font-bold">
              02. MEMORY &amp; POINTERS
            </span>
            <span className="font-bold text-[#111111]">➔</span>
            <span className="bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] px-2 py-0.5 font-bold">
              03. STL &amp; COMPLEXITY
            </span>
            <span className="font-bold text-[#111111]">➔</span>
            <span className="bg-[#F07C27] text-white border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] px-2 py-0.5 font-bold">
              04. LOW-LATENCY SYSTEMS
            </span>
          </div>
        </div>

        {/* 4 Feature Cards — Neo-Brutalist Stamped Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ABOUT_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5 mb-3.5">
                    <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      {feat.tag}
                    </span>
                    <div className="w-8 h-8 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-[#F07C27]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display font-black text-sm text-[#111111] tracking-tight mb-2">
                    {feat.title}
                  </h3>

                  <p className="font-body text-slate-700 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-auto bg-[#F4F3F3] border-[2px] border-[#111111] p-2 text-[10px] font-mono font-bold text-[#111111] truncate">
                  {feat.graphic}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
