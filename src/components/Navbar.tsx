"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, Layers, BookOpen, Calendar, ExternalLink, FileDown } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "About", href: "#about" },
  { name: "Program", href: "#program" },
  { name: "Mentors", href: "#mentors" },
  { name: "Gallery", href: "#gallery" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "program", "mentors", "gallery", "contact"];
      const scrollPosition = window.scrollY + 180;

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] border-b-[3px] border-[#111111]">
        {/* Main Navbar */}
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Super 60 Original Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-200 hover:scale-105 select-none">
            <Image
              src="/s60-official-logo.png"
              alt="Super 60 Logo"
              width={150}
              height={48}
              priority
              className="h-10 sm:h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav Items (Curriculum & Workshops separated out to dedicated Sidebar) */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = link.href.startsWith("#")
                ? activeSection === link.href.substring(1)
                : false;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-display font-extrabold uppercase tracking-wider transition-all pb-1 ${
                    isActive
                      ? "text-[#111111] border-b-[3px] border-[#111111]"
                      : "text-slate-700 hover:text-[#111111] hover:border-b-[3px] hover:border-[#111111]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Highlighted Test Syllabus PDF Download */}
            <a
              href="/SkillUp-3.0-Screening-Test-Syllabus.pdf"
              download="SkillUp-3.0-Screening-Test-Syllabus.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#FFB703] hover:bg-[#F07C27] text-[#111111] hover:text-white font-mono text-xs font-black uppercase px-3 py-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] hover:shadow-[1px_1px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
              title="Download SkillUp 3.0 Screening Test Syllabus PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-[#111111] group-hover:text-white" />
              <span>TEST SYLLABUS</span>
              <span className="bg-[#111111] text-white text-[9px] font-mono px-1 py-0.5 uppercase tracking-tighter">
                PDF
              </span>
            </a>

            {/* Dedicated Sidebar Trigger Button for Curriculum & Workshops */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-[#FFF0E5] hover:bg-[#F07C27] hover:text-white text-[#111111] font-mono text-xs font-bold uppercase px-3 py-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] hover:shadow-[1px_1px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer group"
            >
              <Layers className="w-3.5 h-3.5 text-[#F07C27] group-hover:text-white" />
              <span>[ CURRICULUM & WORKSHOPS ]</span>
            </button>

            <Link
              href="/login"
              className="bg-[#FFFFFF] text-[#111111] font-display text-xs font-bold uppercase px-4 py-2 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#111111] transition-all"
            >
              LOGIN
            </Link>
            <Link
              href="/register"
              className="bg-[#F07C27] text-white font-display text-xs font-extrabold uppercase px-4 py-2 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111111] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-1.5"
            >
              <span>[ REGISTER NOW → ]</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 border-[2px] border-[#111111] bg-[#FFF0E5] text-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[11px] font-bold uppercase"
              aria-label="Open sidebar"
            >
              <Layers className="w-4 h-4 text-[#F07C27]" />
            </button>
            <Link
              href="/login"
              className="bg-[#FFFFFF] text-[#111111] font-display text-[11px] font-bold uppercase px-2.5 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]"
            >
              LOGIN
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] bg-white text-[#111111] active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Floating Side Dock Tab for Curriculum & Workshops (Quick Access) */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open Curriculum and Workshops Sidebar"
        className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#111111] hover:bg-[#F07C27] text-white border-l-[3px] border-y-[3px] border-[#111111] shadow-[-4px_4px_0px_#111111] hover:shadow-[-2px_2px_0px_#111111] px-2 py-4 font-mono text-[11px] font-black tracking-widest uppercase transition-all items-center gap-2 cursor-pointer group hover:translate-x-[-2px]"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="flex items-center gap-2 tracking-widest">
          ⚡ CURRICULUM & WORKSHOPS
        </span>
      </button>

      {/* ── NEO-BRUTALIST SIDEBAR: CURRICULUM & WORKSHOPS ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-sm"
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#FFFFFF] border-l-[4px] border-[#111111] shadow-[-12px_0px_0px_#111111] p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] font-black bg-[#111111] text-white px-2 py-0.5 uppercase tracking-wider inline-block">
                      <span className="w-2 h-2 bg-[#F07C27] inline-block mr-1" />
                      [ DIRECTORY PROTOCOL ]
                    </div>
                    <h3 className="font-display font-black text-2xl text-[#111111] uppercase tracking-tight">
                      TECHNICAL MODULES
                    </h3>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                    className="p-2 bg-white hover:bg-rose-100 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                <p className="text-xs font-mono font-bold text-slate-700 leading-relaxed bg-[#F4F3F3] border-[2px] border-[#111111] p-3 shadow-[2px_2px_0px_#111111]">
                  Explore the complete Super 60 systems programming syllabus and active offline cohort editions.
                </p>

                {/* ── CARD 1: CURRICULUM ── */}
                <Link
                  href="/curriculum"
                  onClick={() => setSidebarOpen(false)}
                  className="block bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_#111111] transition-all group"
                >
                  <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2 mb-3">
                    <span className="bg-[#111111] text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                      [ TRACK 01 // WORKSHOP CURRICULUM ]
                    </span>
                    <span className="font-mono text-[11px] font-black text-[#F07C27]">
                      6 DAYS · 12–16 OCT
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 bg-[#F07C27] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white flex-shrink-0 group-hover:rotate-3 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight flex items-center gap-1.5">
                        WORKSHOP CURRICULUM
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#F07C27]" />
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-700 mt-1 leading-relaxed">
                        Official 6-day intensive C++ roadmap: fundamentals, conditionals, loops, patterns & CLI projects (Calculator, ATM, Quiz) + doubt solving.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#111111]/20 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-[#111111]">
                      12–16 OCT
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-[#111111]">
                      CLI PROJECTS
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-[#111111]">
                      DOUBT SOLVING
                    </span>
                  </div>
                </Link>

                {/* ── CARD 2: WORKSHOPS ── */}
                <Link
                  href="/workshops"
                  onClick={() => setSidebarOpen(false)}
                  className="block bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_#111111] transition-all group"
                >
                  <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-2 mb-3">
                    <span className="bg-[#111111] text-white font-mono text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                      [ TRACK 02 // LAB EDITIONS ]
                    </span>
                    <span className="font-mono text-[11px] font-black text-emerald-700">
                      4 PHYSICAL LABS
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 bg-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center text-white flex-shrink-0 group-hover:rotate-3 transition-transform">
                      <Calendar className="w-5 h-5 text-[#F07C27]" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xl text-[#111111] uppercase tracking-tight flex items-center gap-1.5">
                        WORKSHOPS
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform text-[#F07C27]" />
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-700 mt-1 leading-relaxed">
                        Offline incubator cohorts, hands-on lab seat assignments (strict 60-seat cap), and competitive testbench examinations.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#111111]/20 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-[#FFF0E5] px-2 py-0.5 border border-[#111111]">
                      60-SEAT STRICT CAP
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#FFF0E5] px-2 py-0.5 border border-[#111111]">
                      PHYSICAL AMIT / DELTA
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-[#FFF0E5] px-2 py-0.5 border border-[#111111]">
                      TESTBENCH CRUCIBLE
                    </span>
                  </div>
                </Link>
              </div>

              {/* Sidebar Bottom Action */}
              <div className="pt-6 border-t-[3px] border-[#111111] space-y-3">
                <Link
                  href="/register"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full py-3 bg-[#F07C27] hover:bg-[#111111] text-white border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>REGISTER FOR SELECTION EXAM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center font-mono text-[10px] text-slate-600 font-bold uppercase">
                  SUPER 60 INCUBATOR · ISO C++23 SPECIFICATION
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-[96px] left-0 right-0 z-40 bg-[#FFFFFF] border-b-[3px] border-[#111111] shadow-[0_8px_0px_#111111] lg:hidden px-6 py-6 max-h-[85vh] overflow-y-auto"
          >
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-display font-extrabold uppercase text-[#111111] py-2 border-b-[2px] border-slate-200"
                >
                  {link.name}
                </Link>
              ))}

              {/* Highlighted Test Syllabus for Mobile */}
              <a
                href="/SkillUp-3.0-Screening-Test-Syllabus.pdf"
                download="SkillUp-3.0-Screening-Test-Syllabus.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between bg-[#FFB703] text-[#111111] p-3 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] font-mono text-xs font-black uppercase my-1"
              >
                <span className="flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-[#111111]" />
                  SCREENING TEST SYLLABUS
                </span>
                <span className="bg-[#111111] text-white text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider">
                  PDF ↓
                </span>
              </a>

              {/* Separated Technical Modules in Mobile View */}
              <div className="p-3 bg-[#FFF0E5] border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] my-2 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase block">
                  [ DIRECTORY MODULES ]
                </span>
                <Link
                  href="/curriculum"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-mono font-bold uppercase bg-white border border-[#111111] p-2"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#F07C27]" />
                    CURRICULUM SPEC
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/workshops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-mono font-bold uppercase bg-white border border-[#111111] p-2"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#F07C27]" />
                    WORKSHOPS & LABS
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#F07C27] text-white font-display font-extrabold uppercase py-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] text-xs"
                >
                  [ REGISTER NOW → ]
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-white text-[#111111] font-display font-bold uppercase py-2.5 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] text-xs"
                >
                  LOGIN TO PORTAL
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
