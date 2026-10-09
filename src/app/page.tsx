"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ProgramJourney from "@/components/ProgramJourney";
import MentorsGrid from "@/components/MentorsGrid";
import GallerySection from "@/components/GallerySection";
import WhyJoinSection from "@/components/WhyJoinSection";
import ImpactSection from "@/components/ImpactSection";
import FaqSection from "@/components/FaqSection";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FAFAF9] text-[#0F172A] selection:bg-[#F07C27] selection:text-white overflow-x-hidden">
      {/* High-Performance Zero-Lag Tech Grid Background (0% CPU/GPU overhead) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-75"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(240,124,39,0.1),transparent_70%)]"
      />

      {/* S0: Top Navigation Bar */}
      <Navbar />

      {/* S1: Hero Section - SUPER 60 PRESENTS SKILL UP with Anime.js 3D Showcase */}
      <Hero />

      {/* S2: About Skill Up - A Stronger Start for Brighter Futures */}
      <AboutSection />

      {/* S3: The Program - A Complete Learning Journey (with Anime.js 3D Cards) */}
      <ProgramJourney />

      {/* S4: Meet Our Mentors - Learn from Experienced Guides (8 Mentors) */}
      <MentorsGrid />

      {/* S5: Glimpses From Past Sessions - Moments That Inspire (5-Photo Mosaic) */}
      <GallerySection />

      {/* S6: Why Join Skill Up? - More Than Just a Course (6 Feature Cards) */}
      <WhyJoinSection />

      {/* S7: Our Impact - Building a Brighter Community Together */}
      <ImpactSection />

      {/* S9: Frequently Asked Questions - Everything You Need to Know (6 Accordions) */}
      <FaqSection />

      {/* S10: Pre-Footer CTA Banner - Take the First Step Towards a Brighter Future */}
      <CtaBand />

      {/* S11: Comprehensive Dark Slate Footer with Circular Chalk Badge */}
      <Footer />

      {/* Interactive Auth Modal for Login & Register */}
      <AuthModal />
    </main>
  );
}
