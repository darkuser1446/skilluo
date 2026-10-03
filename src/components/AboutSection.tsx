"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Terminal, Sparkles, Code2, Users } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "Zero-to-Mastery C++ Systems",
    desc: "From memory models and pointer arithmetic to modern C++20 concurrency.",
  },
  {
    title: "Weekly Intensive Labs",
    desc: "Hands-on coding challenges evaluated against strict automated test suites.",
  },
  {
    title: "Direct Mentor Code Reviews",
    desc: "Personal feedback on code cleanliness, time complexity, and memory leaks.",
  },
  {
    title: "Performance-Based Selection",
    desc: "Super 60 identifies, trains, and elevates top talent based on genuine grit.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="relative py-28 sm:py-36 bg-[#0E1528] overflow-hidden">
      {/* Faint giant watermark text "SUPER 60" scrolling behind section */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden pointer-events-none select-none opacity-[0.045] whitespace-nowrap z-0">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="font-display font-black text-[18vw] uppercase tracking-tighter text-brand-orange"
        >
          SUPER 60 • SYSTEMS ARCHITECTURE • SUPER 60 • C++ WORKSHOP •
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Story */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-px w-6 bg-brand-orange" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange">
                WHAT IS SKILL UP
              </span>
            </div>

            {/* H2 Heading */}
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.15]">
              An initiation of{" "}
              <span className="text-brand-orange font-black drop-shadow-[0_0_20px_rgba(240,124,39,0.35)]">
                Super 60
              </span>
            </h2>

            <p className="mt-6 text-base text-slate-300 leading-relaxed">
              <strong className="text-white">Skill Up</strong> is the flagship annual bootcamp
              curated and driven by{" "}
              <span className="text-brand-orange font-bold">Super 60</span> — an elite cohort
              dedicated to transforming ambitious students into world-class engineers. We don't teach
              passive theory; we put students in real terminal environments where they build, break,
              and optimize complex C++ software.
            </p>

            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Over the course of weeks, students transition from standard college coding into
              disciplined systems programmers capable of writing high-performance algorithms,
              custom allocators, and multithreaded systems.
            </p>

            {/* Feature Checklist */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HIGHLIGHTS.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-4 rounded-xl bg-[#131E3A]/80 border border-white/10 hover:border-brand-orange/40 hover:bg-[#162344] transition-all"
                >
                  <div className="flex items-center gap-2 text-brand-orange mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange flex-shrink-0" />
                    <span className="font-display text-xs font-bold text-white tracking-wide">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: 3D Tilt Session Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative group rounded-3xl p-1 bg-gradient-to-tr from-brand-orange/30 via-brand-navy to-brand-orange/20 shadow-2xl">
              <div className="rounded-[22px] overflow-hidden bg-[#111A33] p-6 sm:p-8 relative">
                {/* Visual Image */}
                <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-6 border border-white/10 group-hover:border-brand-orange/40 transition-all">
                  <Image
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
                    alt="Super 60 Skill Up Coding Session"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111A33] via-transparent to-transparent" />

                  {/* Overlaid Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#0B1120]/85 backdrop-blur-md border border-brand-orange/40 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-brand-orange" />
                    <span className="text-xs font-mono font-bold text-white tracking-wide">
                      SUPER 60 LAB ATMOSPHERE
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">
                      The <span className="text-brand-orange">Super 60</span> Environment
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Collaborative labs, real-time code reviews, and competitive leaderboards.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="px-3.5 py-1.5 rounded-xl bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-xs font-mono font-semibold">
                      Lab Cohorts A & B
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
