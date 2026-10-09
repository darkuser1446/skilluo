"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import confetti from "canvas-confetti";

export default function CtaBand() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#F07C27", "#111111", "#FFB703", "#22C55E", "#ffffff"],
    });
  };

  return (
    <section id="apply-band" className="relative py-16 sm:py-20 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Banner Card — Neo-Brutalist Physical Structural Poster */}
        <div className="bg-[#FFF0E5] border-[4px] border-[#111111] shadow-[10px_10px_0px_#111111] grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Side: Photo Frame with Hardware Decal */}
          <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#111111] overflow-hidden bg-slate-900">
            <Image
              src="/img/session-1.jpg"
              alt="Super 60 Systems Engineering Cohort"
              fill
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Top Decal Stamp */}
            <div className="absolute top-3 left-3 bg-[#111111] text-white font-mono text-[11px] font-bold px-2 py-0.5 border border-[#111111] uppercase">
              ADMISSIONS // ACTIVE
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-white/95 border-[2px] border-[#111111] p-2 flex items-center justify-between text-[11px] font-mono font-bold text-[#111111] shadow-[2px_2px_0px_#111111]">
              <span>CAPACITY: 10 SEATS ONLY</span>
              <span className="text-[#F07C27]">CYCLE 2026</span>
            </div>
          </div>

          {/* Right Side: Copy & Register Button */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col items-start justify-between">
            <div>
              <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] uppercase tracking-widest inline-block mb-3">
                [ APPLICATIONS CYCLE // OPEN ]
              </div>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-[#111111] tracking-tight uppercase leading-snug mb-3">
                TAKE THE FIRST STEP TOWARDS A{" "}
                <span className="bg-[#F07C27] text-white px-2 py-0.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] inline-block -rotate-1">
                  BRIGHTER FUTURE
                </span>
              </h2>

              <p className="font-body text-slate-700 text-xs sm:text-sm leading-relaxed mb-6 font-medium max-w-lg">
                Join Skill Up and master low-level systems programming in C++ through rigorous lab sessions, line-by-line mentor reviews, and competitive candidate evaluation.
              </p>
            </div>

            <Link
              href="/register"
              onClick={triggerConfetti}
              className="neo-btn bg-[#F07C27] text-white text-xs sm:text-sm font-extrabold uppercase px-8 py-4 border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>[ REGISTER FOR SKILL UP 2026 → ]</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
