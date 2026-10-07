"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import ProgramJourney from "@/components/ProgramJourney";
import MentorsGrid from "@/components/MentorsGrid";
import GallerySection from "@/components/GallerySection";
import WhyJoinSection from "@/components/WhyJoinSection";
import StudentSpotlight from "@/components/StudentSpotlight";
import ImpactSection from "@/components/ImpactSection";
import FaqSection from "@/components/FaqSection";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import InteractiveTileGrid from "@/components/InteractiveTileGrid";
import AmbientAuraRays from "@/components/AmbientAuraRays";
import AnimatedTechBackground from "@/components/AnimatedTechBackground";
import LiveFloatingNotice from "@/components/LiveFloatingNotice";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#FAFAF9] text-[#0F172A] selection:bg-[#F07C27] selection:text-white overflow-x-hidden">
      {/* Automatic Premium Ambient Lighting Aurora & Rays */}
      <AmbientAuraRays />

      {/* Automatic Animated Drifting Constellation Nodes & Circuit Mesh */}
      <AnimatedTechBackground />

      {/* Subtle Interactive Square Tiles Background (responds dynamically to cursor across entire page) */}
      <InteractiveTileGrid theme="light" showControls={true} tileSize={46} />

      {/* Live Automatic Admissions & Cohort Milestone Status Pill */}
      <LiveFloatingNotice />

      {/* S0: Top Navigation Bar */}
      <Navbar />

      {/* S1: Hero Section - SUPER 60 PRESENTS SKILL UP */}
      <Hero />

      {/* S2: About Skill Up - A Stronger Start for Brighter Futures */}
      <AboutSection />

      {/* S3: The Program - A Complete Learning Journey (Roadmap 01 to 04) */}
      <ProgramJourney />

      {/* S4: Meet Our Mentors - Learn from Experienced Guides (8 Mentors) */}
      <MentorsGrid />

      {/* S5: Glimpses From Past Sessions - Moments That Inspire (5-Photo Mosaic) */}
      <GallerySection />

      {/* S6: Why Join Skill Up? - More Than Just a Course (6 Feature Cards) */}
      <WhyJoinSection />

      {/* S7: Student Voices - Their Journey, Our Motivation (3 Testimonial Cards) */}
      <StudentSpotlight />

      {/* S8: Our Impact - Building a Brighter Community Together (4 Metrics) */}
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
