"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Sparkles, CheckCircle2, UserCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function CtaBand() {
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.7 },
      colors: ["#F07C27", "#FFA048", "#FFB703", "#2D325E", "#ffffff"],
    });
  };

  return (
    <section id="register" className="relative py-24 sm:py-32 bg-[#0B1120]/80 backdrop-blur-sm overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl p-8 sm:p-14 overflow-hidden bg-gradient-to-br from-[#162347] via-[#131E3A] to-[#111A33] border border-brand-orange/40 shadow-[0_20px_60px_rgba(240,124,39,0.2)]"
        >
          {/* Subtle noise and glow behind */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-navy/50 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Countdown Chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1120]/75 backdrop-blur-md border border-brand-orange/40 text-brand-orange text-xs font-mono font-bold tracking-wider mb-6 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-brand-orange animate-spin" />
              <span>
                APPLICATIONS CLOSE IN: {timeLeft.days}D {timeLeft.hours}H {timeLeft.minutes}M{" "}
                {timeLeft.seconds}S
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.15]">
              Applications are Open for{" "}
              <span className="text-gradient-orange">Skill Up 2026</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Limited seats. Direct mentorship. Selection is based strictly on aptitude, passion, and
              commitment to becoming a high-performance engineer with{" "}
              <span className="text-brand-orange font-bold">Super 60</span>.
            </p>

            {/* Quick Benefits Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                Zero Tuition Cost
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                Super 60 Certification
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                Direct Placement Referral
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                onClick={triggerConfetti}
                className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-display font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(240,124,39,0.5)] hover:shadow-[0_0_40px_rgba(240,124,39,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit Application Now</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-display font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-brand-orange" />
                <span>Student Portal Login</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
