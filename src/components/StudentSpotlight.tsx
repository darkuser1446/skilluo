"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  sub: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Skill Up gave me a clear understanding of C++ and problem solving. The mentors were very supportive throughout.",
    name: "Ankit Kumar",
    sub: "1st Year, CSE",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "The sessions were well structured and really helped me build confidence in coding. Highly recommended!",
    name: "Priya Sharma",
    sub: "2nd Year, Engineering",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    quote:
      "The doubt support and practice sessions were the best part. I learned so much in just a few weeks.",
    name: "Rohit Singh",
    sub: "1st Year, B.Tech",
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
      className="relative py-20 sm:py-24 bg-transparent overflow-hidden border-t border-slate-100/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header with Prev/Next Controls */}
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              STUDENT VOICES
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight">
              Their Journey, <span className="text-[#F07C27]">Our Motivation</span>
            </h2>
          </div>

          {/* Navigation Circle Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-slate-300 text-slate-600 hover:text-[#F07C27] hover:border-[#F07C27] flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-[#F07C27] text-white hover:bg-[#e06c17] flex items-center justify-center shadow-sm transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Large Orange Quote Mark */}
                <div className="text-[#F07C27] text-4xl font-serif font-black leading-none mb-3">
                  &ldquo;&ldquo;
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-6">
                  &quot;{item.quote}&quot;
                </p>
              </div>

              {/* Student Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-orange-200">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#0F172A] leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{item.sub}</p>
                  </div>
                </div>

                {/* 5 Gold Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
