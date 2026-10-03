"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GitPullRequest,
  Users2,
  FileCheck2,
  Activity,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";

interface Feature {
  icon: typeof BookOpen;
  title: string;
  tag: string;
  description: string;
  badgeColor: string;
}

const FEATURES: Feature[] = [
  {
    icon: BookOpen,
    title: "Learning Notes & Resources",
    tag: "Curated Content",
    description:
      "Deep dive into hand-crafted C++ notes, internal memory layouts, pointer diagrams, and clean code guides.",
    badgeColor: "from-orange-500/20 to-brand-orange/40",
  },
  {
    icon: GitPullRequest,
    title: "Assignments & Reviews",
    tag: "Hands-on Code",
    description:
      "Weekly algorithmic and systems assignments tested against edge-case testbenches with line-by-line feedback.",
    badgeColor: "from-blue-500/20 to-indigo-500/40",
  },
  {
    icon: Users2,
    title: "One-on-One Mentor Support",
    tag: "Super 60 Mentors",
    description:
      "Direct pair programming and architecture reviews with experienced engineers and senior alumni.",
    badgeColor: "from-amber-500/20 to-yellow-500/40",
  },
  {
    icon: FileCheck2,
    title: "Tests & Assessments",
    tag: "Timed Challenges",
    description:
      "Benchmark your problem-solving speed and algorithmic precision under simulated high-stakes conditions.",
    badgeColor: "from-emerald-500/20 to-green-500/40",
  },
  {
    icon: Activity,
    title: "Attendance & Progress",
    tag: "Live Dashboard",
    description:
      "Track every session mark, attendance percentage, and assessment ranking in real-time on your student portal.",
    badgeColor: "from-purple-500/20 to-pink-500/40",
  },
  {
    icon: HelpCircle,
    title: "Doubt-Solving, Anytime",
    tag: "24/7 Support",
    description:
      "Dedicated discussion forums and instant lab support channels to ensure you never stay stuck on a segfault.",
    badgeColor: "from-cyan-500/20 to-sky-500/40",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y * 0.04);
    setRotateY(x * 0.04);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative rounded-2xl p-6 sm:p-7 bg-[#131E3A]/85 backdrop-blur-xl border border-white/10 hover:border-brand-orange/50 shadow-lg hover:shadow-[0_10px_30px_rgba(240,124,39,0.18)] transition-all duration-300"
    >
      {/* Top Header of Card */}
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.badgeColor} border border-white/15 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
          {feature.tag}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-orange transition-colors flex items-center gap-1.5">
        <span>{feature.title}</span>
        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-brand-orange" />
      </h3>

      <p className="mt-2.5 text-sm text-slate-300 leading-relaxed font-normal">
        {feature.description}
      </p>

      {/* Bottom accent */}
      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors">
        <span className="font-mono text-[11px] text-brand-orange">Super 60 Curriculum</span>
        <span className="text-[11px] font-medium">Verified Module</span>
      </div>
    </motion.div>
  );
}

export default function FeatureGrid() {
  return (
    <section id="program" className="relative py-28 sm:py-36 bg-[#0B1120]/80 backdrop-blur-sm overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A33] border border-brand-orange/30 text-brand-orange text-xs font-mono font-bold tracking-widest uppercase mb-4">
            CURRICULUM & ARCHITECTURE
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Everything You Need To <span className="text-gradient-orange">Level Up</span>
          </h2>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Crafted meticulously by{" "}
            <span className="text-brand-orange font-bold">Super 60</span> to replace standard
            classroom memorization with hardcore systems programming muscle memory.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
