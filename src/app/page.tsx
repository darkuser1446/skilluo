"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import FeatureGrid from "@/components/FeatureGrid";
import StudentSpotlight from "@/components/StudentSpotlight";
import GallerySection from "@/components/GallerySection";
import MentorsStrip from "@/components/MentorsStrip";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import CursorSpotlight from "@/components/CursorSpotlight";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[#070A18] text-foreground selection:bg-brand-orange selection:text-white overflow-x-hidden">
      {/* Interactive Cursor Layer */}
      <CustomCursor />
      <CursorSpotlight />

      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* S0: Hero Section with Three.js 3D Visual Center & Student Highlights */}
      <Hero />

      {/* S1: About Super 60 Section */}
      <AboutSection />

      {/* S2: Program / Why Skill Up 3x2 Grid */}
      <FeatureGrid />

      {/* S3: Student Spotlight (Hero Students First) */}
      <StudentSpotlight />

      {/* S4: Previous Skill Up Photo Gallery with Lightbox */}
      <GallerySection />

      {/* S5: Mentors Marquee Strip */}
      <MentorsStrip />

      {/* S6: Final Call to Action Band with Live Countdown */}
      <CtaBand />

      {/* S7: Comprehensive Footer */}
      <Footer />

      {/* Interactive Auth Modal for Login & Register */}
      <AuthModal />
    </main>
  );
}
