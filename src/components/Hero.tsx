"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import GeometricFacet from "./GeometricFacet";
import CountUp from "./CountUp";
import Anime3DHeroScene from "./Anime3DHeroScene";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden bg-transparent"
    >
      {/* Decorative Geometric Polygonal Shards in Margins */}
      <GeometricFacet side="left" position="top" className="top-12 -translate-x-6" />
      <GeometricFacet side="right" position="top" className="top-40 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* Eyebrow Label with subtle pulse */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-800 uppercase mb-3"
            >
              <span className="w-2 h-2 rounded-full bg-[#F07C27]" />
              <span>SUPER 60 PRESENTS</span>
            </motion.div>

            {/* Giant Title: SKILL UP */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="flex flex-col leading-none mb-4 select-none"
            >
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#0F172A] tracking-tight">
                SKILL
              </span>
              <span className="font-display font-black text-6xl sm:text-7xl lg:text-[88px] text-[#F07C27] tracking-tight">
                UP
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="font-display font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase mb-3.5"
            >
              LEARN &nbsp;|&nbsp; PRACTICE &nbsp;|&nbsp; GROW
            </motion.div>

            {/* Subtext description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mb-7"
            >
              A beginner friendly program to help freshers build a strong foundation in C++ and
              develop real problem solving skills.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="relative overflow-hidden group bg-[#F07C27] hover:bg-[#e06c17] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#about"
                className="bg-white/90 hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-sm sm:text-base px-6 py-3 rounded-lg border border-slate-300 shadow-sm hover:shadow transition-all"
              >
                Know More
              </Link>
            </motion.div>

            {/* 3 Stat Badges Row with Animated Counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 pt-3 border-t border-slate-200/80 w-full max-w-lg"
            >
              {/* Stat 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={60} suffix="+" duration={1.5} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Students Guided
                  </div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={8} duration={1.2} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Expert Mentors
                  </div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-[#F07C27] shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-sm sm:text-base text-[#0F172A] leading-tight">
                    <CountUp end={4} suffix=" Weeks" duration={1.4} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Structured Program
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Anime.js 3D C++ Systems Workspace Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <Anime3DHeroScene />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
