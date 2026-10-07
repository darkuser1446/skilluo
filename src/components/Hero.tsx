"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Calendar } from "lucide-react";
import GeometricFacet from "./GeometricFacet";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden bg-white"
    >
      {/* Decorative Geometric Polygonal Shards in Margins */}
      <GeometricFacet side="left" position="top" className="top-12 -translate-x-6" />
      <GeometricFacet side="right" position="top" className="top-40 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Eyebrow Label */}
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-800 uppercase mb-3">
              SUPER 60 PRESENTS
            </div>

            {/* Giant Title: SKILL UP */}
            <div className="flex flex-col leading-none mb-4 select-none">
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#0F172A] tracking-tight">
                SKILL
              </span>
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#F07C27] tracking-tight">
                UP
              </span>
            </div>

            {/* Tagline */}
            <div className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase mb-3.5">
              LEARN &nbsp;|&nbsp; PRACTICE &nbsp;|&nbsp; GROW
            </div>

            {/* Subtext description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-7">
              A beginner friendly program to help freshers build a strong foundation in C++ and
              develop real problem solving skills.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Link
                href="/register"
                className="bg-[#F07C27] hover:bg-[#e06c17] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>
              <Link
                href="#about"
                className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm sm:text-base px-6 py-3 rounded-lg border border-slate-300 shadow-sm transition-all"
              >
                Know More
              </Link>
            </div>

            {/* 3 Stat Badges Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 border-t border-slate-100 w-full max-w-lg">
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    1000+
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Students Guided
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    8
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Expert Mentors
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    4 Weeks
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Structured Program
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual of Student at Desk Coding C++ */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg sm:max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900">
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

                {/* Desk Lamp Ambient Glow */}
                <div className="absolute top-8 right-12 w-28 h-28 bg-amber-400/30 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute top-12 right-14 w-8 h-8 rounded-full bg-amber-200/90 shadow-[0_0_30px_#F59E0B]" />

                {/* The Coding Monitor */}
                <div className="absolute bottom-10 left-12 right-20 sm:left-16 sm:right-28 h-40 bg-[#0F172A] border-2 border-slate-700 rounded-lg shadow-2xl p-2.5 overflow-hidden flex flex-col z-10">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">main.cpp</span>
                    <span className="text-[10px] font-mono font-bold text-orange-400">C++</span>
                  </div>
                  {/* Code Editor Body */}
                  <div className="pt-2 font-mono text-[10px] sm:text-[11px] leading-relaxed text-slate-300">
                    <div>
                      <span className="text-rose-400">#include</span>{" "}
                      <span className="text-emerald-300">&lt;iostream&gt;</span>
                    </div>
                    <div>
                      <span className="text-blue-400">int</span>{" "}
                      <span className="text-yellow-300">main</span>() &#123;
                    </div>
                    <div className="pl-3">
                      std::cout &lt;&lt;{" "}
                      <span className="text-amber-300">&quot;Super 60 : Skill Up 2026&quot;</span>{" "}
                      &lt;&lt; std::endl;
                    </div>
                    <div className="pl-3">
                      <span className="text-purple-400">return</span>{" "}
                      <span className="text-cyan-400">0</span>;
                    </div>
                    <div>&#125;</div>
                  </div>
                </div>

                {/* Student Silhouette / Back View */}
                <div className="absolute -bottom-6 left-1/3 -translate-x-1/4 z-20 pointer-events-none">
                  {/* Silhouette of student with dark hoodie & curly hair studying */}
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
                    {/* Head / Hair */}
                    <ellipse cx="110" cy="50" rx="36" ry="40" fill="url(#hair-grad)" />
                    {/* Curly Hair Silhouette texture */}
                    <circle cx="82" cy="42" r="14" fill="#090D16" />
                    <circle cx="95" cy="22" r="15" fill="#090D16" />
                    <circle cx="118" cy="18" r="16" fill="#090D16" />
                    <circle cx="138" cy="30" r="15" fill="#090D16" />
                    <circle cx="144" cy="48" r="14" fill="#090D16" />
                    {/* Neck */}
                    <rect x="98" y="78" width="24" height="20" fill="#0F172A" />
                    {/* Shoulders / Hoodie */}
                    <path
                      d="M20 190 C30 120 70 94 110 94 C150 94 190 120 200 190 Z"
                      fill="url(#hoodie-grad)"
                    />
                    {/* Hoodie Seams & Lighting Accent */}
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

                {/* Warm Light Overlay from Desk */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
