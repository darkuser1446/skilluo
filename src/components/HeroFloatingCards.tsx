"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { CheckCircle2, TrendingUp, Trophy, Star, Award, Sparkles } from "lucide-react";

export default function HeroFloatingCards() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const slowX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const slowY = useSpring(mouseY, { stiffness: 40, damping: 25 });
  const fastX = useSpring(mouseX, { stiffness: 70, damping: 20 });
  const fastY = useSpring(mouseY, { stiffness: 70, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full max-w-lg h-[440px] mx-auto flex items-center justify-center select-none">
      {/* Central Glowing Student Highlight Visual */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={{
          y: [-5, 5, -5],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
      >
        {/* Soft aura glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-brand-orange/30 via-brand-gold/20 to-brand-navy/40 blur-2xl opacity-60" />

        {/* Central Circular Avatar Card */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-br from-brand-orange via-brand-gold to-brand-navy shadow-[0_10px_40px_rgba(240,124,39,0.3)]">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#131C35] relative flex items-center justify-center border-2 border-white/20">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Super 60 Student Star"
              fill
              className="object-cover"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-1 bg-[#111A33]/95 backdrop-blur-md px-3 py-0.5 rounded-full border border-brand-gold/40 flex items-center gap-1 shadow-md">
              <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
              <span className="text-[10px] font-bold text-white tracking-wider font-mono">
                STUDENT SPOTLIGHT
              </span>
            </div>
          </div>
        </div>

        {/* Floating title below portrait */}
        <div className="mt-3.5 px-4 py-1.5 rounded-full bg-[#131C35]/90 backdrop-blur-md border border-brand-orange/30 shadow-lg text-center">
          <p className="text-xs font-semibold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Aditya S. <span className="text-brand-orange font-bold font-mono">· 99.4% Aggregate</span>
          </p>
        </div>
      </motion.div>

      {/* Glass Card 1: ⭐ Rank #1 Aditya S. (Gold Border - Top Left) */}
      <motion.div
        className="absolute -top-2 -left-2 sm:-left-10 z-20 pointer-events-auto"
        style={{ x: slowX, y: slowY }}
        animate={{ y: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
      >
        <div className="px-4 py-2.5 rounded-2xl bg-[#131C35]/90 backdrop-blur-xl border border-brand-gold/40 shadow-xl flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
            <Trophy className="w-4 h-4 fill-brand-gold text-brand-gold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold font-mono">
                Rank #1
              </span>
              <span className="text-[10px] text-slate-400">· Skill Up 2025</span>
            </div>
            <p className="text-xs font-bold text-white">Aditya S. (Super 60 Lab)</p>
          </div>
        </div>
      </motion.div>

      {/* Glass Card 2: ✔ Assignment Submitted (Green tick - Bottom Left) */}
      <motion.div
        className="absolute bottom-4 -left-4 sm:-left-8 z-20 pointer-events-auto"
        style={{ x: fastX, y: fastY }}
        animate={{ y: [6, -6, 6] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.3 }}
      >
        <div className="px-4 py-2.5 rounded-2xl bg-[#131C35]/90 backdrop-blur-xl border border-emerald-500/40 shadow-xl flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Memory Allocator</p>
            <p className="text-[10px] text-emerald-400 font-medium font-mono">Assignment 08 · Passed 100%</p>
          </div>
        </div>
      </motion.div>

      {/* Glass Card 3: 📈 Attendance 98% (Top Right) */}
      <motion.div
        className="absolute top-4 -right-2 sm:-right-8 z-20 pointer-events-auto"
        style={{ x: fastX, y: fastY }}
        animate={{ y: [5, -5, 5] }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.2 }}
      >
        <div className="px-4 py-2.5 rounded-2xl bg-[#131C35]/90 backdrop-blur-xl border border-brand-orange/40 shadow-xl flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center text-brand-orange">
            <TrendingUp className="w-4 h-4 text-brand-orange" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-brand-orange font-mono">98% Attendance</span>
            </div>
            <p className="text-[10px] text-slate-300">20/20 Live Labs Attended</p>
          </div>
        </div>
      </motion.div>

      {/* Glass Card 4: 🏆 Top Performer · Lab A (Bottom Right) */}
      <motion.div
        className="absolute -bottom-1 -right-4 sm:-right-6 z-20 pointer-events-auto"
        style={{ x: slowX, y: slowY }}
        animate={{ y: [-4, 6, -4] }}
        transition={{ repeat: Infinity, duration: 5.4, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="px-4 py-2.5 rounded-2xl bg-[#131C35]/90 backdrop-blur-xl border border-sky-400/40 shadow-xl flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Top Performer</p>
            <p className="text-[10px] text-sky-300">Super 60 · Systems Lab A</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
