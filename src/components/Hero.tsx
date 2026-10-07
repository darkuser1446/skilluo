"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Calendar, Terminal, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import GeometricFacet from "./GeometricFacet";
import CountUp from "./CountUp";

const CODE_SNIPPETS = [
  'std::cout << "Skill Up 2026";',
  'vector<int> super60(60);',
  'optimize_algorithms();',
  'solve_systems_problems();',
];

export default function Hero() {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Automatic typing terminal animation in the monitor scene
  useEffect(() => {
    const currentFullText = CODE_SNIPPETS[snippetIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayedText !== currentFullText) {
      timer = setTimeout(() => {
        setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
      }, 75);
    } else if (!isDeleting && displayedText === currentFullText) {
      timer = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayedText !== "") {
      timer = setTimeout(() => {
        setDisplayedText(displayedText.slice(0, -1));
      }, 35);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setSnippetIndex((prev) => (prev + 1) % CODE_SNIPPETS.length);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, snippetIndex]);

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden bg-transparent"
    >
      {/* Decorative Geometric Polygonal Shards in Margins with Floating Physics */}
      <GeometricFacet side="left" position="top" className="top-12 -translate-x-6" />
      <GeometricFacet side="right" position="top" className="top-40 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Eyebrow Label with subtle pulse */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-800 uppercase mb-3"
            >
              <span className="w-2 h-2 rounded-full bg-[#F07C27] animate-pulse" />
              <span>SUPER 60 PRESENTS</span>
            </motion.div>

            {/* Giant Title: SKILL UP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="flex flex-col leading-none mb-4 select-none"
            >
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#0F172A] tracking-tight">
                SKILL
              </span>
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#F07C27] tracking-tight">
                UP
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase mb-3.5"
            >
              LEARN &nbsp;|&nbsp; PRACTICE &nbsp;|&nbsp; GROW
            </motion.div>

            {/* Subtext description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-7"
            >
              A beginner friendly program to help freshers build a strong foundation in C++ and
              develop real problem solving skills.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="relative overflow-hidden group bg-[#F07C27] hover:bg-[#e06c17] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                {/* Automatic Luxury Shimmer Sweep Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#about"
                className="bg-white/90 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm sm:text-base px-6 py-3 rounded-lg border border-slate-300 shadow-sm hover:shadow transition-all"
              >
                Know More
              </Link>
            </motion.div>

            {/* 3 Stat Badges Row with Automatic Animated Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 border-t border-slate-200/80 w-full max-w-lg"
            >
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={1000} suffix="+" duration={1.6} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Students Guided
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={8} duration={1.2} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Expert Mentors
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={4} suffix=" Weeks" duration={1.4} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Structured Program
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Visual of Student at Desk Coding C++ with Live Typing Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg sm:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
              {/* Realistic Composition Scene */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0A0F1D]">
                {/* Chalkboard on Back Wall */}
                <div className="absolute top-4 left-6 right-28 h-28 bg-[#182635] border border-slate-700/60 rounded-lg p-3 shadow-inner opacity-90">
                  <div className="font-handwritten text-emerald-300 text-sm tracking-wide leading-tight">
                    Build<br />
                    Practice<br />
                    Solve<br />
                    <span className="text-orange-300 font-bold">Grow &rarr;</span>
                  </div>
                </div>

                {/* Framed Motivational Chalkboard Card */}
                <div className="absolute top-4 right-4 w-28 bg-[#111A24] border border-slate-600 rounded p-2 text-center shadow">
                  <div className="text-[8px] font-mono uppercase tracking-wider text-amber-300 leading-tight">
                    GOOD CODE<br />
                    BETTER<br />
                    THINKING<br />
                    BRIGHTER<br />
                    FUTURE
                  </div>
                </div>

                {/* Desk Lamp Ambient Glow with Soft Breathing Pulse */}
                <motion.div
                  animate={{
                    opacity: [0.35, 0.6, 0.35],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-8 right-12 w-28 h-28 bg-amber-400/35 rounded-full blur-2xl pointer-events-none"
                />
                <div className="absolute top-12 right-14 w-8 h-8 rounded-full bg-amber-200/90 shadow-[0_0_30px_#F59E0B]" />

                {/* The Coding Monitor with Live Animated Code Typing */}
                <div className="absolute bottom-10 left-12 right-20 sm:left-16 sm:right-28 h-44 bg-[#0F172A] border-2 border-slate-700 rounded-lg shadow-2xl p-2.5 overflow-hidden flex flex-col z-10">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Terminal className="w-2.5 h-2.5 text-slate-400" />
                      main.cpp
                    </span>
                    <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-950/60 px-1.5 py-0.5 rounded border border-orange-500/30">
                      C++20
                    </span>
                  </div>

                  {/* Code Editor Body with Live Typing Line */}
                  <div className="pt-2 font-mono text-[10px] sm:text-[11px] leading-relaxed text-slate-300 flex-1">
                    <div>
                      <span className="text-rose-400">#include</span>{" "}
                      <span className="text-emerald-300">&lt;iostream&gt;</span>
                    </div>
                    <div>
                      <span className="text-blue-400">int</span>{" "}
                      <span className="text-yellow-300">main</span>() &#123;
                    </div>
                    <div className="pl-3 flex items-center">
                      <span className="text-amber-300">{displayedText}</span>
                      <span className="w-1.5 h-3.5 bg-orange-400 ml-0.5 animate-pulse inline-block" />
                    </div>
                    <div className="pl-3">
                      <span className="text-purple-400">return</span>{" "}
                      <span className="text-cyan-400">0</span>;
                    </div>
                    <div>&#125;</div>
                  </div>

                  {/* Live Compiler Status Output Bar */}
                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Build: 0 errors • 0.02s</span>
                    </div>
                    <span className="text-slate-500">Super 60 Compiler</span>
                  </div>
                </div>

                {/* Professional Systems Architecture & Memory Telemetry Graphic Card */}
                <div className="absolute top-3 left-4 z-20 hidden sm:flex items-center gap-2 bg-[#0A101D]/90 backdrop-blur-md border border-orange-500/30 rounded-xl px-2.5 py-1.5 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-wider">
                        MEM [0x7FFF00]
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">|</span>
                      <span className="text-[8px] font-mono text-emerald-300 font-semibold">
                        L1/L2 CACHE OPTIMIZED
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Mini Oscilloscope / Latency Wave Graphic */}
                      <svg width="60" height="10" viewBox="0 0 60 10" fill="none" className="opacity-80">
                        <path
                          d="M0 5 L10 5 L15 1 L20 9 L25 3 L30 7 L35 5 L60 5"
                          stroke="#F07C27"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-[8px] font-mono text-slate-300">0.04ms Latency</span>
                    </div>
                  </div>
                </div>

                {/* Student Silhouette / Back View */}
                <div className="absolute -bottom-6 left-1/3 -translate-x-1/4 z-20 pointer-events-none">
                  <svg width="220" height="190" viewBox="0 0 220 190" fill="none">
                    <defs>
                      <linearGradient id="hoodie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1E293B" />
                        <stop offset="100%" stopColor="#090D16" />
                      </linearGradient>
                      <linearGradient id="hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#111827" />
                        <stop offset="100%" stopColor="#030712" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="110" cy="50" rx="36" ry="40" fill="url(#hair-grad)" />
                    <circle cx="82" cy="42" r="14" fill="#090D16" />
                    <circle cx="95" cy="22" r="15" fill="#090D16" />
                    <circle cx="118" cy="18" r="16" fill="#090D16" />
                    <circle cx="138" cy="30" r="15" fill="#090D16" />
                    <circle cx="144" cy="48" r="14" fill="#090D16" />
                    <rect x="98" y="78" width="24" height="20" fill="#0F172A" />
                    <path
                      d="M20 190 C30 120 70 94 110 94 C150 94 190 120 200 190 Z"
                      fill="url(#hoodie-grad)"
                    />
                    <path
                      d="M90 100 Q110 135 130 100"
                      stroke="#334155"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* S60 Coffee Mug on Desk */}
                <div className="absolute bottom-3 right-6 z-20 flex flex-col items-center">
                  <div className="w-9 h-11 bg-slate-800 border border-slate-700 rounded-b-lg rounded-t-sm flex items-center justify-center relative shadow-md">
                    <span className="text-[8px] font-bold text-orange-400 font-mono">S60</span>
                    <div className="absolute -right-2 top-2 w-3 h-5 border-2 border-slate-700 rounded-r-full" />
                  </div>
                </div>

                {/* Warm Light Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
