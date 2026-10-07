"use client";

import React from "react";
import { Video, FileText, Users, BookOpen, Target, Award } from "lucide-react";

const REASONS = [
  {
    icon: Video,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Live Interaction",
    description: "Engage directly with mentors and clear your doubts.",
  },
  {
    icon: FileText,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Practice Assignments",
    description: "Regular problems to strengthen your concepts.",
  },
  {
    icon: Users,
    iconColor: "text-blue-600 bg-blue-50",
    title: "Supportive Community",
    description: "Learn and grow with like-minded peers.",
  },
  {
    icon: BookOpen,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Structured Notes",
    description: "Well organized study material and resources.",
  },
  {
    icon: Target,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Real World Problem Solving",
    description: "Apply your learning through projects and contests.",
  },
  {
    icon: Award,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Certificate on Completion",
    description: "Get a certificate to showcase your learning.",
  },
];

export default function WhyJoinSection() {
  return (
    <section
      id="why-join"
      className="relative py-20 sm:py-24 bg-[#FAFAF8] overflow-hidden border-t border-slate-100"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              WHY JOIN SKILL UP?
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight mb-5">
              More Than <span className="text-[#F07C27]">Just a Course</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Be a part of a learning experience that builds confidence, discipline and a
              problem solving mindset to help you throughout your academic and professional journey.
            </p>
          </div>

          {/* Right Column: 6 Feature Cards (3 columns x 2 rows) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3.5 ${reason.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#0F172A] mb-1.5">
                    {reason.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
