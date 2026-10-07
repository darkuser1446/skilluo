"use client";

import React from "react";
import { Video, FileText, Users, BookOpen, Target, Award, Sparkles, CheckCircle2 } from "lucide-react";
import Anime3DCard from "./Anime3DCard";

const REASONS = [
  {
    icon: Video,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Live Interaction",
    description: "Engage directly with mentors and clear your doubts.",
    badge: "1:1 Live Sync • SLA < 15m",
  },
  {
    icon: FileText,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Practice Assignments",
    description: "Regular problems to strengthen your concepts.",
    badge: "Automated Strict Grader",
  },
  {
    icon: Users,
    iconColor: "text-blue-600 bg-blue-50",
    title: "Supportive Community",
    description: "Learn and grow with like-minded peers.",
    badge: "1,000+ Alumni Network",
  },
  {
    icon: BookOpen,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Structured Notes",
    description: "Well organized study material and resources.",
    badge: "C++20 Systems Deep Dives",
  },
  {
    icon: Target,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Real World Problem Solving",
    description: "Apply your learning through projects and contests.",
    badge: "Low-Latency Benchmarks",
  },
  {
    icon: Award,
    iconColor: "text-[#F07C27] bg-orange-50",
    title: "Certificate on Completion",
    description: "Get a certificate to showcase your learning.",
    badge: "Cryptographically Verified",
  },
];

export default function WhyJoinSection() {
  return (
    <section
      id="why-join"
      className="relative py-20 sm:py-24 bg-white/40 backdrop-blur-[1px] overflow-hidden border-t border-slate-100/80"
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

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              Be a part of a learning experience that builds confidence, discipline and a
              problem solving mindset to help you throughout your academic and professional journey.
            </p>

            {/* Left Graphic Badge */}
            <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F07C27] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono">
                <div className="font-bold text-slate-800">100% Mentored Program</div>
                <div className="text-slate-500">Structured 4-Week Sprint</div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Feature Cards with Anime.js 3D Tilt */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <Anime3DCard key={reason.title} maxTilt={6} depth={10} className="h-full">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col items-start justify-between h-full group">
                    <div>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-3.5 ${reason.iconColor} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-[#0F172A] mb-1.5">
                        {reason.title}
                      </h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                        {reason.description}
                      </p>
                    </div>

                    {/* Micro-Graphic Tag */}
                    <div className="w-full pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <CheckCircle2 className="w-3 h-3 text-[#F07C27]" />
                      <span className="font-semibold text-slate-700">{reason.badge}</span>
                    </div>
                  </div>
                </Anime3DCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
