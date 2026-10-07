"use client";

import React from "react";
import { ArrowRight, Terminal, Cpu, Zap, Award } from "lucide-react";
import GeometricFacet from "./GeometricFacet";
import Anime3DCard from "./Anime3DCard";

interface Step {
  number: string;
  title: string;
  items: string[];
  graphicType: "terminal" | "memory" | "complexity" | "certificate";
}

const PROGRAM_STEPS: Step[] = [
  {
    number: "01",
    title: "Introduction to C++",
    items: ["Setup & Basics", "Syntax & Structure", "Input/Output"],
    graphicType: "terminal",
  },
  {
    number: "02",
    title: "Core Concepts",
    items: [
      "Variables & Data Types",
      "Control Statements",
      "Functions",
      "Arrays and Strings",
    ],
    graphicType: "memory",
  },
  {
    number: "03",
    title: "Problem Solving",
    items: [
      "Practice Sessions",
      "Logical Thinking",
      "Coding Challenges",
      "Doubt Support",
    ],
    graphicType: "complexity",
  },
  {
    number: "04",
    title: "Beyond Basics",
    items: [
      "STL Introduction",
      "Mini Projects",
      "Real World Applications",
      "Career Guidance",
    ],
    graphicType: "certificate",
  },
];

export default function ProgramJourney() {
  return (
    <section
      id="program"
      className="relative py-20 sm:py-24 bg-transparent overflow-hidden border-t border-slate-100/80"
    >
      {/* Decorative Shard on Left */}
      <GeometricFacet side="left" position="middle" className="top-12 -translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              THE PROGRAM
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight">
              A Complete <span className="text-[#F07C27]">Learning Journey</span>
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-md lg:text-right">
            Structured modules designed to take you from zero to confident problem solver in C++.
          </p>
        </div>

        {/* 4-Step Horizontal Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {PROGRAM_STEPS.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col h-full">
              {/* Anime.js 3D Tilt Card Container */}
              <Anime3DCard maxTilt={6} depth={12} className="h-full flex flex-col">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col justify-between group">
                  <div>
                    {/* Header with Step Number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-[#F07C27] text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {step.number}
                      </div>
                      <h3 className="font-display font-bold text-base text-[#0F172A]">
                        {step.title}
                      </h3>
                    </div>

                    {/* Bullet Points */}
                    <ul className="space-y-2 mt-2">
                      {step.items.map((item) => (
                        <li
                          key={item}
                          className="text-xs sm:text-sm text-slate-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F07C27]/70 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Professional Content Architecture Graphic Box */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    {step.graphicType === "terminal" && (
                      <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[10px] text-slate-300 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <Terminal className="w-3 h-3" />
                          <span>g++ -std=c++20</span>
                        </div>
                        <span className="text-emerald-400 font-bold">[0.02s OK]</span>
                      </div>
                    )}

                    {step.graphicType === "memory" && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 font-mono text-[10px] text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-amber-600" />
                          <span>[Stack 0x7FA0]</span>
                        </div>
                        <span className="text-amber-500 font-bold">➔</span>
                        <span>[Heap Pool]</span>
                      </div>
                    )}

                    {step.graphicType === "complexity" && (
                      <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-2.5 font-mono text-[10px] text-orange-950 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#F07C27]" />
                          <span className="font-bold">O(N²) ➔ O(N log N)</span>
                        </div>
                        <span className="bg-[#F07C27] text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          10x Speed
                        </span>
                      </div>
                    )}

                    {step.graphicType === "certificate" && (
                      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 font-mono text-[10px] text-emerald-950 flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Super 60 Cert</span>
                        </div>
                        <span className="text-slate-500 font-semibold">#S60-2026</span>
                      </div>
                    )}
                  </div>
                </div>
              </Anime3DCard>

              {/* Connecting Arrow for Desktop (only between steps 01-02, 02-03, 03-04) */}
              {idx < PROGRAM_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-[#F07C27] pointer-events-none">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
