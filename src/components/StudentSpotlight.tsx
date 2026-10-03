"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Trophy, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Student {
  name: string;
  role: string;
  lab: string;
  score: number;
  badge: string;
  achievement: string;
  quote: string;
  avatar: string;
}

const STUDENTS: Student[] = [
  {
    name: "Aditya S.",
    role: "Skill Up 2025 Rank #1",
    lab: "Super 60 Systems Lab",
    score: 99.4,
    badge: "Gold Medalist",
    achievement: "Engineered custom lock-free memory allocator in C++20",
    quote:
      "Skill Up transformed my perspective on programming. Super 60 mentors pushed me past syntax into true machine-level thinking.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Rohan Verma",
    role: "Skill Up 2025 Rank #2",
    lab: "Algorithms Core",
    score: 98.2,
    badge: "Top Performer",
    achievement: "Solved all 40 advanced dynamic programming benchmarks with 100% test passes",
    quote:
      "The mentor reviews were ruthless in the best way. My code went from bloated to blazing fast and crystal clear.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Sneha Nair",
    role: "Skill Up 2024 Rank #1",
    lab: "High-Performance Systems",
    score: 98.8,
    badge: "Systems Lead",
    achievement: "Built a multithreaded epoll-based HTTP server from bare sockets",
    quote:
      "Being recognized by Super 60 opened doors to top systems engineering internships before my final year.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Karan Patel",
    role: "Skill Up 2024 Finalist",
    lab: "Compiler & Tools Lab",
    score: 97.5,
    badge: "Special Honors",
    achievement: "Wrote an AST generator and bytecode interpreter for a custom mini-language",
    quote:
      "The weekly tests simulate actual high-pressure engineering sprints. You walk away with unshakeable confidence.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

function ProgressRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-white/10"
          fill="transparent"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          stroke="#F07C27"
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xs font-mono font-bold text-white">{score}%</span>
      </div>
    </div>
  );
}

export default function StudentSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? STUDENTS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === STUDENTS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="students" className="relative py-28 sm:py-36 bg-[#0E1528] overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A33] border border-brand-gold/40 text-brand-gold text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <Star className="w-3 h-3 fill-brand-gold" />
              STUDENT HEROES
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Our Students <span className="text-gradient-orange">Take The Stage</span>
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Skill Up is built for students, led by students, and honored by{" "}
              <span className="text-brand-orange font-bold">Super 60</span>. Meet the engineers who
              conquered the workshop and set benchmark scores.
            </p>
          </div>

          {/* Navigation Arrows for Carousel */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/50 hover:bg-brand-orange/10 text-white transition-all"
              aria-label="Previous Student"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/50 hover:bg-brand-orange/10 text-white transition-all"
              aria-label="Next Student"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STUDENTS.map((student, idx) => (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl p-6 bg-[#131E3A]/90 backdrop-blur-xl border border-white/10 hover:border-brand-gold/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Banner Badge */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-gold px-2.5 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center gap-1">
                  <Trophy className="w-3 h-3 fill-brand-gold text-brand-gold" />
                  {student.badge}
                </span>
                <ProgressRing score={student.score} />
              </div>

              {/* Portrait & Identity */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr from-brand-gold via-brand-orange to-brand-navy shadow-md">
                  <div className="w-14 h-14 rounded-full overflow-hidden relative">
                    <Image
                      src={student.avatar}
                      alt={student.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-orange transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs font-semibold text-brand-orange">{student.role}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{student.lab}</p>
                </div>
              </div>

              {/* Achievement Highlight */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  <span className="text-brand-orange font-bold">Key Build: </span>
                  {student.achievement}
                </p>
              </div>

              {/* Student Quote */}
              <p className="text-xs text-slate-400 italic leading-relaxed mt-auto">
                &ldquo;{student.quote}&rdquo;
              </p>

              {/* Bottom Super 60 verification stamp */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Verified Participant</span>
                <span className="text-brand-orange font-bold">Super 60</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
