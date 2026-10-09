"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, X, Maximize2, ShieldCheck } from "lucide-react";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  badge: string;
  labId: string;
  caption: string;
  tag: string;
  location?: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "/img/session-3.jpg",
    alt: "Live classroom session with mentor at podium",
    badge: "COHORT SESSIONS // LIVE",
    labId: "LAB ID: DELTA-03",
    caption: "PEDAGOGY: 100% PRACTICAL",
    tag: "ZERO GIMMICK",
    location: "Main System Amphitheater",
  },
  {
    id: 2,
    src: "/img/session-1.jpg",
    alt: "Super 60 systems architecture discourse",
    badge: "SYSTEMS ARCHITECTURE",
    labId: "LAB ID: ALPHA-01",
    caption: "LOW-LATENCY C++ DISCOURSE",
    tag: "KERNEL BYPASS",
    location: "Auditorium Pod A",
  },
  {
    id: 3,
    src: "/img/session-2.jpg",
    alt: "Hands-on engineering problem lab",
    badge: "PROBLEM LAB // CODE",
    labId: "LAB ID: SYSTEMS-02",
    caption: "HANDS-ON MEMORY LABS",
    tag: "CACHE HIERARCHY",
    location: "Hardware Simulation Lab",
  },
  {
    id: 4,
    src: "/img/session-4.jpg",
    alt: "Live benchmark evaluation session",
    badge: "CONCURRENCY RUNTIME",
    labId: "LAB ID: CODE-STUDIO",
    caption: "LIVE BENCHMARK EVALUATION",
    tag: "ISO C++23 SPEC",
    location: "Benchmarking Terminal Room",
  },
  {
    id: 5,
    src: "/img/session-5.jpg",
    alt: "Engineers collaborating on laptops",
    badge: "COHORT COLLABORATION",
    labId: "LAB ID: POD-05",
    caption: "HARDWARE CONCURRENCY POD",
    tag: "LOCK-FREE ALGO",
    location: "Collaborative Think-Tank",
  },
  {
    id: 6,
    src: "/img/session-6.jpg",
    alt: "One-on-one mentor critique and code review",
    badge: "1-ON-1 CODE CRITIQUE",
    labId: "LAB ID: REVIEW-QUEUE",
    caption: "ARCHITECT CODE DISSECTION",
    tag: "ZERO OVERHEAD",
    location: "Lead Evaluator Station",
  },
];

export default function GallerySection() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  return (
    <section
      id="gallery"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-2.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#F07C27] border border-white" />
              [ SECTION 05 // PAST SESSIONS ARCHIVE ]
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              MOMENTS{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                THAT INSPIRE
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-mono font-bold text-slate-600 max-w-xl">
              Authentic snapshots from live Super 60 C++ cohort sessions. Real engineers, real hardware, zero corporate fluff.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end">
            <span className="font-mono text-xs font-bold bg-[#FFF0E5] text-[#111111] border-[2px] border-[#111111] px-3 py-1.5 shadow-[2px_2px_0px_#111111]">
              [ 6 PHYSICAL DOSSIERS ]
            </span>
          </div>
        </div>

        {/* 6-Photo Grid — Exact Neo-Brutalist Polaroid Dossier System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="bg-[#FFF0E5] border-[3px] border-[#111111] shadow-[8px_8px_0px_#111111] p-4 sm:p-5 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#111111] transition-all group cursor-pointer"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b-[2px] border-[#111111] pb-3 mb-3.5">
                <span className="bg-[#111111] text-white font-mono text-[11px] font-black px-2.5 py-0.5 border border-[#111111] uppercase tracking-wider truncate max-w-[170px]">
                  {item.badge}
                </span>
                <span className="font-mono text-xs font-black text-[#111111] uppercase tracking-wider flex-shrink-0">
                  {item.labId}
                </span>
              </div>

              {/* Photo Frame */}
              <div className="relative aspect-[4/3] w-full border-[3px] border-[#111111] overflow-hidden bg-slate-900 shadow-[2px_2px_0px_#111111]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-[2px] border-[#111111] p-1 shadow-[2px_2px_0px_#111111]">
                  <Maximize2 className="w-3.5 h-3.5 text-[#111111]" />
                </div>
              </div>

              {/* Card Footer Box */}
              <div className="mt-3.5 border-[2px] border-[#111111] bg-white p-2.5 sm:px-3 sm:py-2 flex items-center justify-between font-mono text-xs font-bold shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111] flex-shrink-0" />
                  <span className="text-[#111111] uppercase truncate">{item.caption}</span>
                </div>
                <span className="text-slate-500 uppercase text-[11px] font-bold flex-shrink-0 ml-2">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution Photo Inspection */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111111]/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[#FFF0E5] border-[4px] border-[#111111] shadow-[12px_12px_0px_#111111] p-4 sm:p-6 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b-[3px] border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-[#111111] text-white font-mono text-xs font-black px-3 py-1 border-[2px] border-[#111111] uppercase">
                  {selectedPhoto.badge}
                </span>
                <span className="font-mono text-xs font-black text-[#111111] bg-white border-[2px] border-[#111111] px-2.5 py-1">
                  {selectedPhoto.labId}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo preview"
                className="p-1.5 bg-white hover:bg-rose-100 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-[#111111] transition-all cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Photo Frame */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full border-[3px] border-[#111111] overflow-hidden bg-slate-900 shadow-[4px_4px_0px_#111111]">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain sm:object-cover"
                priority
              />
            </div>

            {/* Modal Metadata Footer */}
            <div className="border-[2px] border-[#111111] bg-white p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-[3px_3px_0px_#111111]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#F07C27] border border-[#111111]" />
                  <strong className="text-[#111111] font-black text-sm uppercase">{selectedPhoto.caption}</strong>
                </div>
                <div className="text-slate-600 font-bold">Location: {selectedPhoto.location || "Super 60 Physical Lab"}</div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="bg-[#111111] text-white px-2.5 py-1 text-[11px] font-bold uppercase border border-[#111111]">
                  TAG: {selectedPhoto.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
