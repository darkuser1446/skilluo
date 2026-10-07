"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import GeometricFacet from "./GeometricFacet";

interface Step {
  number: string;
  title: string;
  items: string[];
}

const PROGRAM_STEPS: Step[] = [
  {
    number: "01",
    title: "Introduction to C++",
    items: ["Setup & Basics", "Syntax & Structure", "Input/Output"],
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
            <div key={step.number} className="relative flex flex-col">
              {/* The Step Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* Header with Step Number */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#F07C27] text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                    {step.number}
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0F172A]">
                    {step.title}
                  </h3>
                </div>

                {/* Bullet Points */}
                <ul className="space-y-2 mt-2 flex-grow">
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

              {/* Connecting Arrow for Desktop (only between steps 01-02, 02-03, 03-04) */}
              {idx < PROGRAM_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 text-[#F07C27]">
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
