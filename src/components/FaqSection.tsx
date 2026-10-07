"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Anime3DCard from "./Anime3DCard";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS_COL1: FaqItem[] = [
  {
    id: "q1",
    question: "Who can join Skill Up?",
    answer:
      "Skill Up is designed for college freshers and engineering students from any branch who want to build a solid foundation in programming and problem solving. No prior coding background is needed.",
  },
  {
    id: "q2",
    question: "Is prior programming experience required?",
    answer:
      "No prior experience is required! We start from complete fundamentals—variables, syntax, and logic—and progress systematically to intermediate problem solving and algorithms.",
  },
  {
    id: "q3",
    question: "Will the sessions be recorded?",
    answer:
      "Yes, all live workshops and problem-solving walkthroughs are recorded and published to the student portal along with study notes, slides, and starter code.",
  },
];

const FAQS_COL2: FaqItem[] = [
  {
    id: "q4",
    question: "What is the duration of the program?",
    answer:
      "The program spans 4 structured weeks with weekly modules, live interactive labs, weekend deep dives, and dedicated mentor doubt resolution.",
  },
  {
    id: "q5",
    question: "Will there be assignments?",
    answer:
      "Yes! Practical hands-on coding is the core of Skill Up. You will complete weekly graded problem sets with automated testcases and mentor feedback.",
  },
  {
    id: "q6",
    question: "Will I get a certificate?",
    answer:
      "Yes, all students who complete the assignments and participate in the final benchmark challenge receive a verified Certificate of Completion from Super 60.",
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    q1: false,
    q4: false,
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="faq"
      className="relative py-20 sm:py-24 bg-transparent overflow-hidden border-t border-slate-100/80"
    >
      {/* Decorative Floating Blue Question Marks on Borders */}
      <div
        aria-hidden="true"
        className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 text-blue-500/25 font-black text-7xl sm:text-9xl pointer-events-none select-none"
      >
        ?
      </div>
      <div
        aria-hidden="true"
        className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 text-blue-500/25 font-black text-7xl sm:text-9xl pointer-events-none select-none"
      >
        ?
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight">
              Everything You <span className="text-[#F07C27]">Need to Know</span>
            </h2>
          </div>
          <Link
            href="#faq"
            className="self-start sm:self-end border border-orange-300 text-[#F07C27] hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>View All FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Accordion Layout with Anime.js 3D Tilt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            {FAQS_COL1.map((item) => {
              const isOpen = openIds[item.id];
              return (
                <Anime3DCard key={item.id} maxTilt={4} depth={8} className="w-full">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-[#0F172A] hover:text-[#F07C27] transition-colors cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Anime3DCard>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            {FAQS_COL2.map((item) => {
              const isOpen = openIds[item.id];
              return (
                <Anime3DCard key={item.id} maxTilt={4} depth={8} className="w-full">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-[#0F172A] hover:text-[#F07C27] transition-colors cursor-pointer"
                    >
                      <span>{item.question}</span>
                      <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
