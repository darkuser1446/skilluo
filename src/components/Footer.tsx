"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUp } from "lucide-react";

// Clean SVG social brand icons
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="relative bg-[#080D1A]/90 backdrop-blur-md border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Column 1: Brand & Identity */}
          <div className="flex flex-col">
            <Link href="#hero" className="flex items-center gap-3.5 mb-4 group">
              <div className="relative h-12 w-10 flex-shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/emblem.png"
                  alt="Super 60"
                  fill
                  className="object-contain filter drop-shadow-[0_2px_10px_rgba(240,124,39,0.3)]"
                />
              </div>
              <div>
                <span className="font-display font-extrabold text-2xl tracking-tight text-brand-orange block">
                  Super 60
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Skill Up Workshop 2026
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed mt-2">
              Transforming undergraduate minds into elite systems engineers through yearly, hands-on
              intensive C++ laboratories and master mentor guidance.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: GithubIcon, href: "https://github.com" },
                { icon: LinkedinIcon, href: "https://linkedin.com" },
                { icon: TwitterIcon, href: "https://twitter.com" },
                { icon: YoutubeIcon, href: "https://youtube.com" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-brand-orange/50 hover:bg-brand-orange/15 hover:text-brand-orange text-slate-300 flex items-center justify-center transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="#hero" className="hover:text-brand-orange transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-brand-orange transition-colors">
                  About Super 60
                </Link>
              </li>
              <li>
                <Link href="#program" className="hover:text-brand-orange transition-colors">
                  Curriculum & Labs
                </Link>
              </li>
              <li>
                <Link href="#students" className="hover:text-brand-orange transition-colors">
                  Student Spotlight
                </Link>
              </li>
              <li>
                <Link href="#gallery" className="hover:text-brand-orange transition-colors">
                  Photo Archives
                </Link>
              </li>
              <li>
                <Link href="#mentors" className="hover:text-brand-orange transition-colors">
                  Mentors Strip
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Access */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white mb-4 font-mono">
              Student Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="#register" className="text-brand-orange font-semibold hover:underline">
                  Workshop 2026 Registration
                </Link>
              </li>
              <li>
                <Link href="#login" className="hover:text-white transition-colors">
                  Student Assessment Portal
                </Link>
              </li>
              <li>
                <Link href="#login" className="hover:text-white transition-colors">
                  Assignment Submissions
                </Link>
              </li>
              <li>
                <Link href="#login" className="hover:text-white transition-colors">
                  Attendance & Marks Tracker
                </Link>
              </li>
              <li>
                <Link href="#program" className="hover:text-white transition-colors">
                  C++ Resource Repository
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office */}
          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white mb-4 font-mono">
              Contact & Inquiries
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Super 60 Headquarters, Academic Tech Block, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <a
                  href="mailto:contact@super60.org"
                  className="hover:text-brand-orange transition-colors"
                >
                  contact@super60.org
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-[#111A33] border border-white/10">
              <span className="text-[11px] font-mono text-slate-300 block">
                Office Hours: 09:00 — 20:00 IST
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 Skill Up · An initiative of{" "}
            <span className="text-brand-orange font-bold">Super 60</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">
              Terms of Participation
            </Link>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
