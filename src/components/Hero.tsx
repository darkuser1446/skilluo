"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles, Terminal, Flame, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import HeroFloatingCards from "./HeroFloatingCards";
import StatsStrip from "./StatsStrip";

const Hero3DCanvas = dynamic(() => import("./Hero3DCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function Hero() {
  const triggerConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.6 },
      colors: ["#F07C27", "#FFA048", "#FFB800", "#2D325E", "#ffffff"],
    });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-28 pb-14 flex flex-col justify-between items-center overflow-hidden bg-[#0B1120]"
    >
      {/* Lightweight 3D Canvas Background Layer */}
      <Hero3DCanvas />

      {/* Gentle Ambient Background Glows */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-brand-navy/35 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-brand-orange/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111A33] border border-brand-orange/30 shadow-sm mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
              AN INITIATION OF{" "}
              <span className="text-brand-orange font-black">SUPER 60</span>
            </span>
            <Flame className="w-3.5 h-3.5 text-brand-orange fill-brand-orange ml-0.5" />
          </motion.div>

          {/* Main H1 Headline with Shimmer Gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-white"
          >
            <span className="text-gradient-orange inline-block">Skill Up</span>
            <br />
            <span className="text-white font-black text-3xl sm:text-5xl lg:text-6xl block mt-2">
              Where Students Master C++
            </span>
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal"
          >
            A yearly hands-on C++ workshop powered by{" "}
            <span className="font-semibold text-brand-orange">Super 60</span>. Learn from senior mentors,
            ship real systems assignments, climb the assessment leaderboards, and master modern low-level engineering.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="#register"
              onClick={triggerConfetti}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(240,124,39,0.5)] hover:shadow-[0_0_35px_rgba(240,124,39,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Register for Workshop 2026</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#program"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 hover:border-brand-orange/60 hover:bg-white/5 text-slate-200 font-display font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-brand-orange" />
              <span>Explore Curriculum ↓</span>
            </Link>
          </motion.div>

          {/* Mini Alumni Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center gap-3 text-xs text-slate-400"
          >
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Student"
                  className="w-7 h-7 rounded-full border-2 border-[#0B1120] object-cover"
                />
              ))}
            </div>
            <p>
              Joined by <span className="font-bold text-white">300+</span> Super 60 alumni engineers
            </p>
          </motion.div>
        </div>

        {/* Right Column: Floating Student Showcase */}
        <div className="lg:col-span-5 flex items-center justify-center w-full">
          <HeroFloatingCards />
        </div>
      </div>

      {/* Stats Counter Strip */}
      <StatsStrip />

      {/* Bobbing Scroll Down Indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mt-6 flex flex-col items-center pointer-events-none"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
          Scroll to explore
        </span>
        <ChevronDown className="w-4 h-4 text-brand-orange" />
      </motion.div>
    </section>
  );
}
