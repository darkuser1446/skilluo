"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  sub: string;
  avatar: string;
  roll: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Skill Up gave me an uncompromising understanding of C++ memory mechanics and pointer arithmetic. The code reviews were brutally precise and elevated my entire coding style.",
    name: "Ankit Kumar",
    sub: "1st Year, CSE",
    roll: "S60-2025-014",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "The testbench assertion engine was relentless. Having to write code that actually passed strict memory-leak and execution-time bounds built genuine engineering confidence.",
    name: "Priya Sharma",
    sub: "2nd Year, ECE",
    roll: "S60-2025-042",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "The mentor doubt resolution pipeline was insane. Whenever I hit segmentation faults or compilation bottlenecks, mentors walked me through the GDB trace in minutes.",
    name: "Rohit Singh",
    sub: "1st Year, IT",
    roll: "S60-2025-058",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
];

export default function StudentSpotlight() {
  const [startIndex, setStartIndex] = useState(0);

  const handlePrev = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev < TESTIMONIALS.length - 1 ? prev + 1 : 0));
  };

  return (
    <section
      id="testimonials"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header with Prev/Next Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-2.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest">
              [ SECTION 07 // COHORT VOICES ]
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              STUDENT{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                TESTIMONIALS
              </span>
            </h2>
          </div>

          {/* Navigation Controls — Neo-Brutalist Key Switches */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrev}
              className="w-10 h-10 bg-white border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 bg-[#F07C27] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111111] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Testimonial Cards — Neo-Brutalist Stamped Evaluation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5 sm:p-6 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] transition-all group"
            >
              <div>
                {/* Card Top Stamp */}
                <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2.5 mb-4">
                  <span className="bg-[#111111] text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                    INDIVIDUAL LOG
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F07C27]">
                    {item.roll}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="font-body text-slate-800 text-xs sm:text-sm leading-relaxed mb-6 font-medium italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Student Footer */}
              <div className="pt-3.5 border-t-[2px] border-[#111111] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 border-[2px] border-[#111111] overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-[#111111] leading-tight uppercase">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">{item.sub}</p>
                  </div>
                </div>

                <div className="bg-[#FFF0E5] border border-[#111111] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#111111]">
                  5/5 PTS
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
