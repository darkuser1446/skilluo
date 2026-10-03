"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Calendar, Video, HeartHandshake } from "lucide-react";

interface StatItem {
  icon: typeof Users;
  value: number;
  suffix: string;
  label: string;
  highlight: string;
}

const STATS: StatItem[] = [
  {
    icon: Users,
    value: 60,
    suffix: "+",
    label: "Hand-Picked Students",
    highlight: "Per Edition",
  },
  {
    icon: Calendar,
    value: 5,
    suffix: "+",
    label: "Yearly Editions",
    highlight: "Proven Legacy",
  },
  {
    icon: Video,
    value: 20,
    suffix: "+",
    label: "Intensive Live Labs",
    highlight: "Hands-on Code",
  },
  {
    icon: HeartHandshake,
    value: 100,
    suffix: "%",
    label: "1-on-1 Mentorship",
    highlight: "Dedicated Support",
  },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1800;
    const stepTime = 25;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-display font-black text-3xl sm:text-4xl text-white">
      {count}
      <span className="text-brand-orange">{suffix}</span>
    </span>
  );
}

export default function StatsStrip() {
  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-4 mt-8 sm:mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-6 sm:p-7 bg-[#111A33]/90 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-orange/60 to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex flex-col items-center text-center group ${
                  idx > 0 ? "pt-5 md:pt-0 md:pl-6" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center mb-2.5 text-brand-orange group-hover:scale-110 group-hover:bg-brand-orange/25 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <Counter value={stat.value} suffix={stat.suffix} />
                <p className="text-sm font-semibold text-slate-200 mt-1">{stat.label}</p>
                <span className="text-[11px] font-mono text-brand-orange font-medium">
                  {stat.highlight}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
