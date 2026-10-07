"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Code, Users, BarChart3, ArrowRight, Cpu, Layers, GitBranch, ShieldCheck } from "lucide-react";
import GeometricFacet from "./GeometricFacet";

const ABOUT_FEATURES = [
  {
    icon: BookOpen,
    title: "Beginner Friendly",
    description: "Step by step learning with proper guidance.",
    graphicType: "steps",
  },
  {
    icon: Code,
    title: "C++ Focused",
    description: "Complete coverage from basics to problem solving.",
    graphicType: "code",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Mentors from Super 60 to support your journey.",
    graphicType: "mentor",
  },
  {
    icon: BarChart3,
    title: "Practical Learning",
    description: "Hands on practice with assignments and sessions.",
    graphicType: "testbench",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-20 sm:py-24 bg-white/40 backdrop-blur-[1px] overflow-hidden border-t border-slate-100/80"
    >
      {/* Polygonal Crystal Facet Decor */}
      <GeometricFacet side="right" position="middle" className="top-8 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Top Header & Classroom Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-14">
          {/* Left Column: Heading & Paragraph */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              ABOUT SKILL UP
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight mb-5">
              A Stronger Start{" "}
              <span className="text-[#F07C27]">for Brighter Futures</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Skill Up is an initiative by Super 60 to help freshers learn programming in a structured
              and interactive way. This edition focuses on C++, covering fundamentals, problem
              solving and practical sessions to build a strong foundation.
            </p>
          </div>

          {/* Right Column: Classroom Lecture Photo & Floating Metrics */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Classroom Lecture Photo */}
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80"
                  alt="Mentor teaching classroom session"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Floating Metrics Badge Card */}
              <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col gap-2 min-w-[170px]">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Learn</span>
                  </div>
                  <div className="w-12 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="w-4/5 h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Practice</span>
                  </div>
                  <div className="w-12 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="w-full h-full bg-amber-500 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F07C27]" />
                    <span>Grow</span>
                  </div>
                  <div className="w-12 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="w-5/6 h-full bg-[#F07C27] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Handwritten Note Callout */}
              <div className="absolute -bottom-14 right-2 sm:right-0">
                <span className="font-handwritten text-[#F07C27] text-xl sm:text-2xl font-bold tracking-wide -rotate-6 block">
                  More than Just a Course
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Systems Learning Pipeline Architecture Graphic Bar */}
        <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#F07C27] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              C++ Systems Architecture Pipeline:
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-[11px] font-mono">
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              1. Syntax & Core
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              2. Memory & Pointer Model
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              3. STL Algorithms
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              4. Low-Latency Systems
            </span>
          </div>
        </div>

        {/* Bottom: 4 Feature Cards with Embedded Technical Micro-Graphics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ABOUT_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-start justify-between group"
              >
                <div>
                  {/* Blue Icon Circular Badge */}
                  <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100/60 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F172A] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {feat.description}
                  </p>
                </div>

                {/* Professional Content Micro-Graphic Inside Card */}
                {feat.graphicType === "steps" && (
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-slate-600">
                    <span className="text-blue-600 font-bold">Step 01</span>
                    <span className="text-slate-300">➔</span>
                    <span className="text-[#F07C27] font-bold">Step 02</span>
                    <span className="text-slate-300">➔</span>
                    <span className="text-emerald-600 font-bold">Step 03</span>
                  </div>
                )}

                {feat.graphicType === "code" && (
                  <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-slate-300">
                    <span className="text-rose-400">int*</span> ptr = <span className="text-amber-300">&amp;val</span>;{" "}
                    <span className="text-slate-500">// Zero Overhead</span>
                  </div>
                )}

                {feat.graphicType === "mentor" && (
                  <div className="w-full bg-blue-50/70 border border-blue-100 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-blue-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      1:1 Reviews
                    </span>
                    <span className="text-slate-500">SLA &lt; 15m</span>
                  </div>
                )}

                {feat.graphicType === "testbench" && (
                  <div className="w-full bg-emerald-50/70 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      40/40 Tests
                    </span>
                    <span className="text-emerald-700 font-semibold">0 Memory Leaks</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
