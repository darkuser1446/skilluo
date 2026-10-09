"use client";

import React from "react";
import Link from "next/link";
import S60Logo from "./S60Logo";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="0" ry="0" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative bg-[#111111] text-white pt-16 pb-12 border-t-[4px] border-[#111111] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* 5 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b-[2px] border-white/20">
          {/* Column 1: Brand & Slogan (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-3">
            <Link href="#hero" className="flex items-center gap-2.5">
              <div className="bg-[#FFFFFF] text-[#111111] font-display text-sm font-black px-2.5 py-1 border-[2px] border-[#FFFFFF] shadow-[3px_3px_0px_#F07C27] uppercase">
                SUPER 60
              </div>
              <div className="bg-[#F07C27] text-white font-mono text-xs font-bold px-2 py-0.5 border border-[#FFFFFF]">
                SKILL UP 2026
              </div>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mt-1 font-medium">
              A premier yearly systems programming initiative by Super 60. Evaluating candidates through competitive C++ coding testbenches, daily labs, and performance-based selection.
            </p>
          </div>

          {/* Column 2: Quick Links (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-[#F07C27] mb-3.5">
              [ NAVIGATION ]
            </h4>
            <ul className="space-y-2 text-xs font-mono font-bold text-slate-300">
              <li>
                <Link href="#hero" className="hover:text-[#F07C27] transition-colors">
                  ➔ HOME
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#F07C27] hover:underline transition-colors">
                  ➔ LOGIN PORTAL
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-[#F07C27] transition-colors">
                  ➔ ABOUT
                </Link>
              </li>
              <li>
                <Link href="#program" className="hover:text-[#F07C27] transition-colors">
                  ➔ PROGRAM
                </Link>
              </li>
              <li>
                <Link href="#mentors" className="hover:text-[#F07C27] transition-colors">
                  ➔ MENTORS
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (Spans 3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-mono font-bold text-xs uppercase tracking-widest text-[#F07C27] mb-3.5">
              [ SYSTEMS RESOURCES ]
            </h4>
            <ul className="space-y-2 text-xs font-mono font-bold text-slate-300">
              <li>
                <Link href="/curriculum" className="hover:text-[#F07C27] transition-colors">
                  ➔ 6-DAY WORKSHOP CURRICULUM
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#F07C27] transition-colors">
                  ➔ WORKSHOP ARCHIVES
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-[#F07C27] transition-colors">
                  ➔ FREQUENT QUESTIONS
                </Link>
              </li>
              <li>
                <Link href="#impact" className="hover:text-[#F07C27] transition-colors">
                  ➔ COHORT IMPACT
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Stamp Block (Spans 3 cols) */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end items-center">
            <div className="bg-[#FFF0E5] text-[#111111] border-[3px] border-[#FFFFFF] shadow-[5px_5px_0px_#F07C27] p-4 text-center -rotate-1 max-w-[220px]">
              <div className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-700 border-b border-[#111111] pb-1 mb-2">
                SUPER 60 CADRE
              </div>
              <div className="font-display font-black text-sm uppercase leading-tight text-[#111111]">
                CODE. PRACTICE. BENCHMARK.
              </div>
              <div className="mt-2 bg-[#F07C27] text-white font-mono text-[9px] font-bold py-0.5 uppercase">
                ISO C++23 SPEC
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>&copy; 2026 SUPER 60 // ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <GithubIcon className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <LinkedinIcon className="w-4 h-4" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <DiscordIcon className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <YoutubeIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
