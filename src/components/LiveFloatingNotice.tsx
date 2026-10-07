"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

const NOTICES = [
  {
    tag: "LIVE ADMISSIONS",
    tagColor: "bg-emerald-500",
    text: "Skill Up 2026: 42 of 60 seats filled",
    action: "Register Now",
    href: "/register",
  },
  {
    tag: "SUPER 60 MENTORS",
    tagColor: "bg-[#F07C27]",
    text: "8 Senior Systems Engineers guiding this cohort",
    action: "Meet Mentors",
    href: "#mentors",
  },
  {
    tag: "PROVEN TRACK RECORD",
    tagColor: "bg-blue-500",
    text: "1,000+ Students trained in modern C++ systems",
    action: "View Program",
    href: "#program",
  },
];

export default function LiveFloatingNotice() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Automatically slide in after 1.2s delay for a premium reveal
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Cycle automatically through notices every 6 seconds
  useEffect(() => {
    if (dismissed || !visible) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NOTICES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [dismissed, visible]);

  if (dismissed || !visible) return null;

  const current = NOTICES[index];

  return (
    <motion.aside
      aria-label="Live admissions announcement"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed bottom-5 left-5 z-40 max-w-sm hidden sm:block"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-orange-200/90 rounded-2xl p-3 shadow-[0_10px_35px_rgba(240,124,39,0.12)] flex items-center justify-between gap-3 group">
        {/* Pulsing Dot & Tag */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.tagColor}`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${current.tagColor}`}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {current.tag}
                </span>
                <Sparkles className="w-2.5 h-2.5 text-[#F07C27]" />
              </div>
              <p className="text-xs font-semibold text-slate-800 truncate pr-2">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Link & Dismiss */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={current.href}
            className="text-[11px] font-bold text-[#F07C27] hover:text-[#d96b1d] flex items-center gap-0.5 whitespace-nowrap bg-orange-50 hover:bg-orange-100/80 px-2.5 py-1 rounded-lg transition-colors"
          >
            <span>{current.action}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
