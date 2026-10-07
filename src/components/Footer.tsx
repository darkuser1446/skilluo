"use client";

import React from "react";
import Link from "next/link";
import S60Logo from "./S60Logo";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
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
      className="relative bg-[#070B14] text-white pt-16 pb-12 border-t border-slate-800/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* 5 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800">
          {/* Column 1: Brand & Slogan (Spans 3 cols) */}
          <div className="lg:col-span-3 flex flex-col items-start">
            <Link href="#hero" className="mb-4">
              <S60Logo size="md" theme="dark" />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
              Empowering students to learn, build and grow.
            </p>
          </div>

          {/* Column 2: Quick Links (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#F07C27] mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link href="#hero" className="hover:text-[#F07C27] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#F07C27] font-semibold text-[#F07C27] transition-colors flex items-center gap-1.5">
                  <span>Portal Login</span>
                  <span className="text-[10px] bg-[#F07C27]/15 text-[#F07C27] px-1.5 py-0.2 rounded border border-[#F07C27]/30 font-mono">Sign in</span>
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-[#F07C27] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#program" className="hover:text-[#F07C27] transition-colors">
                  Program
                </Link>
              </li>
              <li>
                <Link href="#mentors" className="hover:text-[#F07C27] transition-colors">
                  Mentors
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="hover:text-[#F07C27] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-[#F07C27] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#F07C27] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <Link href="/curriculum" className="hover:text-[#F07C27] transition-colors">
                  Study Material
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#F07C27] transition-colors">
                  Previous Sessions
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-[#F07C27] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#why-join" className="hover:text-[#F07C27] transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/certificate" className="hover:text-[#F07C27] transition-colors">
                  Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect With Us (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#F07C27] mb-4">
              Connect With Us
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F07C27] flex items-center gap-2 transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-slate-400" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F07C27] flex items-center gap-2 transition-colors"
                >
                  <YoutubeIcon className="w-4 h-4 text-slate-400" />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F07C27] flex items-center gap-2 transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4 text-slate-400" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F07C27] flex items-center gap-2 transition-colors"
                >
                  <GithubIcon className="w-4 h-4 text-slate-400" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F07C27] flex items-center gap-2 transition-colors"
                >
                  <DiscordIcon className="w-4 h-4 text-slate-400" />
                  <span>Discord</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Chalk Sketch Badge (Spans 3 cols) */}
          <div className="lg:col-span-3 flex justify-start lg:justify-end items-center">
            <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-slate-600/80 flex flex-col items-center justify-center p-3 text-center group hover:border-[#F07C27] transition-colors">
              {/* Circular Curved Loop Arrows */}
              <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
              >
                <path
                  d="M15 50 A35 35 0 0 1 85 50"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <path
                  d="M85 50 A35 35 0 0 1 15 50"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <polygon points="86,47 89,52 83,52" fill="#F07C27" />
                <polygon points="14,53 11,48 17,48" fill="#F07C27" />
              </svg>

              {/* Centered Chalk Handwritten Words */}
              <div className="font-handwritten text-lg sm:text-xl leading-tight font-bold text-slate-200 select-none">
                <span className="block text-white">Code</span>
                <span className="block text-slate-300">Practice</span>
                <span className="block text-[#F07C27]">Grow</span>
                <span className="block text-slate-300">Repeat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>&copy; 2026 Super 60. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&middot;</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <span>&middot;</span>
            <Link href="#contact" className="hover:text-slate-300 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
