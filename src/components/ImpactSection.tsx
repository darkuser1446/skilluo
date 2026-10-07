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
  },
  {
    icon: UserCheck,
    end: 8,
    suffix: "",
    label: "Expert Mentors",
  },
  {
    icon: TrendingUp,
    end: 4,
    suffix: " Weeks",
    label: "Structured Program",
  },
  {
    icon: ThumbsUp,
    end: 95,
    suffix: "%",
    label: "Positive Feedback",
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

          {/* Right Column: 4 Stat Cards with Automatic CountUp */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {IMPACT_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F07C27] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="font-display font-black text-xl sm:text-2xl text-[#0F172A] leading-tight mb-1">
                    <CountUp end={metric.end} suffix={metric.suffix} duration={1.6} />
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight">
                    {metric.label}
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
