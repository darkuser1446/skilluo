"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";
import Super60Logo from "./Super60Logo";

const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "/about" },
  { name: "Workshops", href: "/workshops" },
  { name: "Curriculum", href: "/curriculum" },
  { name: "Students", href: "#students" },
  { name: "Mentors", href: "#mentors" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = NAV_LINKS.map((link) => link.href.substring(1));
      const scrollPosition = window.scrollY + 220;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#0B1120]/90 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity: Precision Vector SVG Super 60 Emblem & Wordmark */}
          <Link href="#hero">
            <Super60Logo size="md" subtitleText="Skill Up 2026" />
          </Link>


          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    isActive ? "text-white font-semibold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-orange rounded-full shadow-[0_0_8px_#F07C27]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs uppercase tracking-wider font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden text-xs uppercase tracking-wider font-semibold text-white px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight shadow-[0_0_20px_rgba(240,124,39,0.4)] hover:shadow-[0_0_30px_rgba(240,124,39,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/register"
              className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-full bg-brand-orange shadow-md"
            >
              Register
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 bg-[#0B1120]/98 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between sm:hidden"
          >
            <div className="flex flex-col gap-4">
              <div className="pb-4 border-b border-white/10">
                <Super60Logo size="sm" subtitleText="Skill Up 2026" />
              </div>


              <div className="flex flex-col gap-2 mt-2">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-lg font-medium py-2.5 text-slate-200 hover:text-brand-orange border-b border-white/5"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orangeLight text-white font-semibold text-center text-sm shadow-[0_0_20px_rgba(240,124,39,0.4)]"
              >
                Register for Workshop 2026
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl border border-white/20 text-slate-200 font-semibold text-center text-sm hover:bg-white/5"
              >
                Student Portal Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
