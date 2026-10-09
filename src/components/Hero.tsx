"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Calendar, Terminal, Flame, Cpu, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "./CountUp";
import Anime3DHeroScene from "./Anime3DHeroScene";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-24 pb-16 sm:pt-28 sm:pb-24 overflow-hidden bg-transparent"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Neo-Brutalist Headlines & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start gap-4"
          >
            {/* Decal Sticker Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="bg-[#F07C27] text-[#111111] font-mono text-xs font-bold px-3 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] -rotate-1 uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                [ SKILL UP // C++ WORKSHOP // 2026 ]
              </div>
              <div className="bg-[#FFFFFF] text-[#111111] font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] rotate-1 uppercase">
                STATUS: ADMISSIONS OPEN
              </div>
            </div>

            {/* Giant Architectural Headline */}
            <div className="flex flex-col gap-2 mt-1">
              <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-[#111111] uppercase tracking-tight leading-[1.05]">
                BUILD YOUR C++ FOUNDATION.
              </h1>
              <div className="inline-block self-start bg-[#F07C27] text-white px-4 py-2 border-[4px] border-[#111111] shadow-[8px_8px_0px_#111111] -rotate-0.5">
                <span className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none text-white drop-shadow-[2px_2px_0px_#111111]">
                  PROVE YOUR SKILL.
                </span>
              </div>
            </div>

            {/* Manifesto Paragraph */}
            <p className="font-body text-slate-700 font-medium text-sm sm:text-base leading-relaxed max-w-xl mt-1">
              An intensive C++ workshop built around hands-on exercises, mentor guidance, technical assessments, and performance-based evaluation. Master core memory management, low-level syntax, and algorithm execution from scratch.
            </p>

            {/* Neo-Brutalist Mechanical Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link
                href="/register"
                className="neo-btn bg-[#F07C27] text-white text-xs sm:text-sm font-extrabold uppercase px-6 sm:px-8 py-3.5 sm:py-4 border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center gap-2 group"
              >
                <span>[ APPLY FOR SUPER 60 → ]</span>
              </Link>
              <Link
                href="#program"
                className="neo-btn bg-[#FFFFFF] text-[#111111] text-xs sm:text-sm font-bold uppercase px-5 sm:px-6 py-3.5 sm:py-4 border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all"
              >
                [ EXPLORE PROGRAM ]
              </Link>
              <a
                href="/SkillUp-3.0-Screening-Test-Syllabus.pdf"
                download="SkillUp-3.0-Screening-Test-Syllabus.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn bg-[#FFB703] hover:bg-[#F07C27] text-[#111111] hover:text-white text-xs sm:text-sm font-black uppercase px-4 sm:px-5 py-3.5 sm:py-4 border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center gap-2 group cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-[#111111] group-hover:text-white" />
                <span>[ TEST SYLLABUS PDF ↓ ]</span>
              </a>
            </div>

            {/* Technical Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 font-mono text-xs max-w-lg w-full">
              <div className="bg-[#FFF0E5] border-[2px] border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
                <span className="block text-[10px] text-slate-600 font-bold uppercase">STANDARDS</span>
                <span className="font-bold text-[#111111]">ISO C++20 / 23</span>
              </div>
              <div className="bg-[#FFF0E5] border-[2px] border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
                <span className="block text-[10px] text-slate-600 font-bold uppercase">PROFILE</span>
                <span className="font-bold text-[#111111]">VALGRIND / ASAN</span>
              </div>
              <div className="bg-[#FFF0E5] border-[2px] border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]">
                <span className="block text-[10px] text-slate-600 font-bold uppercase">CADENCE</span>
                <span className="font-bold text-[#111111]">1 INTENSIVE WEEK</span>
              </div>
            </div>

            {/* Physical Metric Badges with CountUp */}
            <div className="grid grid-cols-2 gap-3 pt-2 w-full max-w-lg">
              <div className="bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFF0E5] border border-[#111111] flex items-center justify-center flex-shrink-0 text-[#F07C27]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-black text-base sm:text-lg text-[#111111] leading-tight">
                    <CountUp end={5} duration={1.2} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Mentors
                  </div>
                </div>
              </div>

              <div className="bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FFF0E5] border border-[#111111] flex items-center justify-center flex-shrink-0 text-[#F07C27]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-black text-base sm:text-lg text-[#111111] leading-tight">
                    <CountUp end={1} suffix=" Wk" duration={1.4} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    Program
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Tactile Structural Poster Card enclosing Interactive 3D Tech Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="w-full max-w-md bg-[#FFF0E5] border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] p-4 sm:p-5 relative flex flex-col gap-3.5">
              {/* Top Poster Bar */}
              <div className="flex justify-between items-center border-b-[3px] border-[#111111] pb-2">
                <span className="font-mono text-[11px] font-bold bg-[#111111] text-white px-2 py-0.5 uppercase tracking-wider">
                  [ COHORT_04 // SPEC ]
                </span>
                <span className="font-mono text-xs font-bold text-[#111111]">
                  STAMP #2026-X
                </span>
              </div>

              {/* Giant C++ Mode Banner */}
              <div className="bg-[#F07C27] border-[3px] border-[#111111] p-3 shadow-[5px_5px_0px_#111111] flex flex-col justify-between h-28 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="bg-[#111111] text-white font-mono text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">
                    [ STRICT MODE ]
                  </span>
                  <span className="font-display text-xs text-white font-bold bg-[#111111] px-2 py-0.5">
                    -O3 FAST-MATH
                  </span>
                </div>
                <div className="font-display font-black text-4xl text-[#111111] tracking-tighter leading-none select-none z-10">
                  C++ // RUNTIME
                </div>
                {/* Background decorative square */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 border-[6px] border-[#111111] bg-white opacity-20 rotate-12" />
              </div>

              {/* Interactive 3D C++ Studio Embedded */}
              <div className="relative z-10">
                <Anime3DHeroScene />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
