"use client";

import React from "react";
import { Users, UserCheck, TrendingUp, ThumbsUp } from "lucide-react";
import GeometricFacet from "./GeometricFacet";
import CountUp from "./CountUp";

const IMPACT_METRICS = [
  {
    icon: Users,
    end: 1000,
    suffix: "+",
    label: "Students Guided",
    graphic: (
      <svg width="44" height="14" viewBox="0 0 44 14" fill="none" className="mt-1">
        <path
          d="M2 12 L10 9 L20 10 L32 4 L42 2"
          stroke="#F07C27"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="2" r="2" fill="#F07C27" />
      </svg>
    ),
  },
  {
    icon: UserCheck,
    end: 8,
    suffix: "",
    label: "Expert Mentors",
    graphic: (
      <div className="flex items-center gap-1 mt-1">
        {[...Array(8)].map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#F07C27]" />
        ))}
      </div>
    ),
  },
  {
    icon: TrendingUp,
    end: 4,
    suffix: " Weeks",
    label: "Structured Program",
    graphic: (
      <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-slate-500 font-bold">
        <span className="w-2 h-2 rounded-sm bg-orange-200" />
        <span className="w-2 h-2 rounded-sm bg-orange-300" />
        <span className="w-2 h-2 rounded-sm bg-orange-400" />
        <span className="w-2 h-2 rounded-sm bg-[#F07C27]" />
      </div>
    ),
  },
  {
    icon: ThumbsUp,
    end: 95,
    suffix: "%",
    label: "Positive Feedback",
    graphic: (
      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
        <div className="w-[95%] h-full bg-gradient-to-r from-orange-400 to-[#F07C27] rounded-full" />
      </div>
    ),
  },
];

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="relative py-20 sm:py-24 bg-white/40 backdrop-blur-[1px] overflow-hidden border-t border-slate-100/80"
    >
      {/* Decorative Shard on Right */}
      <GeometricFacet side="right" position="lower" className="top-8 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Title & Narrative */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              OUR IMPACT
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight mb-5">
              Building a <span className="text-[#F07C27]">Brighter</span> Community Together
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Skill Up has helped students from various academic backgrounds take their first
              step towards mastering programming and problem solving.
            </p>
          </div>

          {/* Right Column: 4 Stat Cards with Automatic CountUp & Data-Viz Micro-Graphics */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {IMPACT_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F07C27] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-display font-black text-xl sm:text-2xl text-[#0F172A] leading-tight mb-0.5">
                    <CountUp end={metric.end} suffix={metric.suffix} duration={1.6} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mb-2">
                    {metric.label}
                  </div>
                  {/* Embedded Data Graphic */}
                  {metric.graphic}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
