"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GeometricFacet from "./GeometricFacet";

const GALLERY_PHOTOS = {
  auditorium: {
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    alt: "Grand auditorium lecture packed with students",
    caption: "Auditorium Keynote Session",
  },
  cohortBanner: {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    alt: "Super 60 cohort group photo with banner",
    caption: "Cohort Group Photo",
  },
  laptopDiscussion: {
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    alt: "Students coding and collaborating on laptops",
    caption: "Hands-on Problem Solving Labs",
  },
  speakerStage: {
    src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    alt: "Speaker on stage delivering systems programming insights",
    caption: "Mentor Deep Dive",
  },
  teamCelebration: {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    alt: "Super 60 team celebrating successful workshop completion",
    caption: "Community & Celebration",
  },
};

export default function GallerySection() {
  return (
    <section
      id="gallery"
      className="relative py-20 sm:py-24 bg-transparent overflow-hidden border-t border-slate-100/80"
    >
      {/* Polygonal Crystal Facet on Right */}
      <GeometricFacet side="right" position="middle" className="top-12 translate-x-6" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              GLIMPSES FROM PAST SESSIONS
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight">
              Moments <span className="text-[#F07C27]">That Inspire</span>
            </h2>
          </div>
          <Link
            href="#gallery"
            className="self-start sm:self-end border border-orange-300 text-[#F07C27] hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Photo Mosaic Grid Matching Reference Design */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Left Large Photo: Auditorium Lecture (Spans 5 cols on md/lg, full height) */}
          <div className="md:col-span-5 relative min-h-[300px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
            <Image
              src={GALLERY_PHOTOS.auditorium.src}
              alt={GALLERY_PHOTOS.auditorium.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
              {GALLERY_PHOTOS.auditorium.caption}
            </div>
          </div>

          {/* Center Column: 2 Stacked Photos (Spans 4 cols on md/lg) */}
          <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
            {/* Top Center: Cohort Banner Photo */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image
                src={GALLERY_PHOTOS.cohortBanner.src}
                alt={GALLERY_PHOTOS.cohortBanner.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
                {GALLERY_PHOTOS.cohortBanner.caption}
              </div>
            </div>

            {/* Bottom Center: Laptop Discussion Photo */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image
                src={GALLERY_PHOTOS.laptopDiscussion.src}
                alt={GALLERY_PHOTOS.laptopDiscussion.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
                {GALLERY_PHOTOS.laptopDiscussion.caption}
              </div>
            </div>
          </div>

          {/* Right Column: 2 Stacked Photos (Spans 3 cols on md/lg) */}
          <div className="md:col-span-3 flex flex-col gap-4 sm:gap-5">
            {/* Top Right: Speaker Stage Photo */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image
                src={GALLERY_PHOTOS.speakerStage.src}
                alt={GALLERY_PHOTOS.speakerStage.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
                {GALLERY_PHOTOS.speakerStage.caption}
              </div>
            </div>

            {/* Bottom Right: Team Celebration Photo */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
              <Image
                src={GALLERY_PHOTOS.teamCelebration.src}
                alt={GALLERY_PHOTOS.teamCelebration.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-3 left-3 text-white text-xs font-medium">
                {GALLERY_PHOTOS.teamCelebration.caption}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
