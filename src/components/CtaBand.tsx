"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import GeometricFacet from "./GeometricFacet";

export default function CtaBand() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#F07C27", "#FFA048", "#FFB703", "#2563EB", "#ffffff"],
    });
  };

  return (
    <section className="relative py-16 sm:py-20 bg-transparent overflow-hidden">
      {/* Facet decor */}
      <GeometricFacet side="left" position="bottom" className="bottom-4 -translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Banner Card Container */}
        <div className="relative rounded-3xl overflow-hidden border border-orange-200/80 bg-gradient-to-r from-[#FFF5ED] via-[#FFF9F5] to-white shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Side: Student Looking at Sunrise Mountain Landscape */}
          <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80"
              alt="Student gazing at mountain sunrise"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Silhouette of Student with Backpack */}
            <div className="absolute bottom-0 left-12 sm:left-20 z-10">
              <svg width="140" height="150" viewBox="0 0 140 150" fill="none">
                {/* Head */}
                <ellipse cx="70" cy="35" rx="20" ry="24" fill="#090D16" />
                {/* Backpack */}
                <rect x="42" y="60" width="22" height="48" rx="8" fill="#1E293B" />
                {/* Body / Coat */}
                <path
                  d="M48 150 C50 85 60 62 70 62 C80 62 100 85 105 150 Z"
                  fill="#0F172A"
                />
              </svg>
            </div>

            {/* Handwritten Floating Annotation */}
            <div className="absolute top-8 right-6 sm:right-12 z-20">
              <span className="font-handwritten text-[#0F172A] text-2xl sm:text-3xl font-bold tracking-wide -rotate-6 block drop-shadow-sm bg-white/70 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/50">
                Some Students Bigger Dreams
              </span>
            </div>
          </div>

          {/* Right Side: Copy & Register Button */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col items-start">
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-[#F07C27] uppercase mb-3">
              BE A PART OF SKILL UP
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#0F172A] tracking-tight leading-snug mb-4">
              Take the First Step Towards a{" "}
              <span className="text-[#F07C27]">Brighter Future</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              Join Skill Up and build a strong foundation in C++ with guidance, practice and a
              supportive community.
            </p>

            <Link
              href="/register"
              onClick={triggerConfetti}
              className="bg-[#F07C27] hover:bg-[#e06c17] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
