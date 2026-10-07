"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Code, Users, BarChart3 } from "lucide-react";
import GeometricFacet from "./GeometricFacet";

const ABOUT_FEATURES = [
  {
    icon: BookOpen,
    title: "Beginner Friendly",
    description: "Step by step learning with proper guidance.",
  },
  {
    icon: Code,
    title: "C++ Focused",
    description: "Complete coverage from basics to problem solving.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Mentors from Super 60 to support your journey.",
  },
  {
    icon: BarChart3,
    title: "Practical Learning",
    description: "Hands on practice with assignments and sessions.",
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
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

        {/* Bottom: 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {ABOUT_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
              >
                {/* Blue Icon Circular Badge */}
                <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100/60 text-blue-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-base text-[#0F172A] mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
