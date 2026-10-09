"use client";

import React from "react";
import { Users, UserCheck, Calendar } from "lucide-react";
import CountUp from "./CountUp";

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Title & Mission */}
          <div className="lg:col-span-4 flex flex-col items-start gap-3">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest inline-block">
              [ SECTION 07 // IMPACT TELEMETRY ]
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              OUR HISTORICAL{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                COHORT IMPACT
              </span>
            </h2>

            <p className="font-body text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
              Over successive editions, Skill Up has set the benchmark for low-latency systems training, filtering passionate freshers into the Super 60 induction pipeline.
            </p>
          </div>

          {/* Right Column: 3 Oversized Neo-Brutalist Metric Blocks */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: 500+ Candidates Trained */}
            <div className="bg-[#F07C27] text-[#111111] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                  CANDIDATES TRAINED
                </span>
                <Users className="w-5 h-5 text-black" />
              </div>
              <div className="my-4">
                <div className="font-display font-black text-4xl sm:text-5xl leading-none text-white drop-shadow-[2px_2px_0px_#111111]">
                  <CountUp end={500} suffix="+" duration={1.5} />
                </div>
                <div className="font-mono text-[10px] text-black font-bold uppercase mt-1.5">
                  HISTORICAL COHORT ALUMNI
                </div>
              </div>
              <div className="bg-[#111111] text-white px-2 py-1 font-mono text-[10px] font-bold uppercase text-center border border-[#111111]">
                PROVEN TRACK RECORD
              </div>
            </div>

            {/* Metric 2: 10 Seats Capacity */}
            <div className="bg-[#111111] text-white border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-mono text-xs font-black uppercase tracking-wider">
                  COHORT CAPACITY
                </span>
                <UserCheck className="w-5 h-5 text-[#F07C27]" />
              </div>
              <div className="my-4">
                <div className="font-mono font-black text-4xl sm:text-5xl leading-none text-white tracking-tight">
                  <CountUp end={10} suffix="" duration={1.2} />
                  <span className="text-xl text-slate-400 font-normal">/SEATS</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 font-bold uppercase mt-1.5">
                  TOP CANDIDATE INTAKE
                </div>
              </div>
              <div className="bg-white text-[#111111] px-2 py-1 font-mono text-[10px] font-bold uppercase text-center border border-[#111111]">
                STRICT MERIT CUTOFF
              </div>
            </div>

            {/* Metric 3: 1 Week Duration */}
            <div className="bg-[#FFFFFF] text-[#111111] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-700">
                  SPRINT DURATION
                </span>
                <Calendar className="w-5 h-5 text-[#F07C27]" />
              </div>
              <div className="my-4">
                <div className="font-display font-black text-4xl sm:text-5xl leading-none text-[#111111]">
                  <CountUp end={1} suffix=" WEEK" duration={1.2} />
                </div>
                <div className="font-mono text-[10px] text-slate-500 font-bold uppercase mt-1.5">
                  6 INTENSIVE DAYS (12–16 OCT)
                </div>
              </div>
              <div className="bg-[#FFF0E5] border border-[#111111] px-2 py-1 font-mono text-[10px] font-bold uppercase text-center">
                100% HANDS-ON LAB CODE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
