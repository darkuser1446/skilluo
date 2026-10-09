"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS_COL1: FaqItem[] = [
  {
    id: "q1",
    question: "Who is eligible to participate in Skill Up?",
    answer:
      "Skill Up is open to college freshers and engineering students from any branch who want to build a rock-solid foundation in programming and low-level computer systems. No prior coding background is required.",
  },
  {
    id: "q2",
    question: "Do I need prior C++ or programming experience?",
    answer:
      "None at all. We start from ground zero—variables, primitive types, control flow, and basic compiler commands—and systematically build up to pointers, memory architecture, STL, and algorithmic problem solving.",
  },
  {
    id: "q3",
    question: "How are sessions and workshops delivered?",
    answer:
      "Sessions feature interactive code walkthroughs, live testbench demos, and mentor lab pods. Recordings, lecture notes, starter code, and assignment specs are published to the portal after each session.",
  },
];

const FAQS_COL2: FaqItem[] = [
  {
    id: "q4",
    question: "What is the duration and cadence of the sprint?",
    answer:
      "The workshop spans 1 intensive week (12 Oct – 16 Oct + Optional Day 6). Features daily hands-on lectures, dedicated lab pod hours with 5 lead mentors, and problem-solving on the testbench platform.",
  },
  {
    id: "q5",
    question: "How does the Super 60 selection pipeline work?",
    answer:
      "Candidates are evaluated based on a transparent weighted formula: Assignments (30%), Assessments (35%), Attendance (15%), Exercises (10%), and Doubts (5%). The top performers earn induction into the Super 60 systems incubator with 10 coveted cohort seats.",
  },
  {
    id: "q6",
    question: "Will I receive an official certificate of completion?",
    answer:
      "Yes. All participants who complete the required problem sets and sit for the final assessment earn a cryptographically verified Certificate of Completion issued by Super 60.",
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    q1: true,
    q5: true,
  });

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      id="faq"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-2.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest">
              [ SECTION 09 // FREQUENTLY ASKED QUESTIONS ]
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              EVERYTHING YOU{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                NEED TO KNOW
              </span>
            </h2>
          </div>
          <Link
            href="#faq"
            className="neo-btn-sm bg-white text-[#111111] px-4 py-2 text-xs font-bold uppercase self-start sm:self-end"
          >
            [ READ 6 FAQS ]
          </Link>
        </div>

        {/* 2-Column Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            {FAQS_COL1.map((item) => {
              const isOpen = openIds[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 font-display font-black text-xs sm:text-sm text-[#111111] uppercase hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <span className="w-6 h-6 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] flex items-center justify-center flex-shrink-0 font-bold">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t-[2px] border-[#111111] bg-[#F4F3F3] pt-3.5 font-medium">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            {FAQS_COL2.map((item) => {
              const isOpen = openIds[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 font-display font-black text-xs sm:text-sm text-[#111111] uppercase hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <span className="w-6 h-6 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] flex items-center justify-center flex-shrink-0 font-bold">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-700 leading-relaxed border-t-[2px] border-[#111111] bg-[#F4F3F3] pt-3.5 font-medium">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
