"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2, Camera, Calendar } from "lucide-react";

interface GalleryItem {
  id: string;
  year: "2025" | "2024" | "2023";
  title: string;
  category: string;
  src: string;
  aspect: "tall" | "wide" | "normal";
}

const GALLERY_DATA: GalleryItem[] = [
  {
    id: "1",
    year: "2025",
    title: "Lab A — Inauguration & Keynote",
    category: "Kickoff Ceremony",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    aspect: "wide",
  },
  {
    id: "2",
    year: "2025",
    title: "Late Night Memory Debugging Sprint",
    category: "Systems Lab",
    src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80",
    aspect: "tall",
  },
  {
    id: "3",
    year: "2025",
    title: "1-on-1 Code Review with Lead Mentor",
    category: "Mentorship",
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    aspect: "normal",
  },
  {
    id: "4",
    year: "2024",
    title: "Final Assessment & Live Leaderboard",
    category: "Testing Arena",
    src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
    aspect: "wide",
  },
  {
    id: "5",
    year: "2024",
    title: "Super 60 Felicitation & Awards",
    category: "Valedictory",
    src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80",
    aspect: "tall",
  },
  {
    id: "6",
    year: "2024",
    title: "Cohort Group Architecture Presentation",
    category: "Peer Learning",
    src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
    aspect: "normal",
  },
  {
    id: "7",
    year: "2023",
    title: "The Genesis: First Skill Up Cohort",
    category: "Inaugural Batch",
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1000&q=80",
    aspect: "wide",
  },
  {
    id: "8",
    year: "2023",
    title: "Hands-on Terminal Workshop",
    category: "C++ Fundamentals",
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    aspect: "normal",
  },
];

const YEARS = ["ALL", "2025", "2024", "2023"] as const;

export default function GallerySection() {
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems =
    selectedYear === "ALL"
      ? GALLERY_DATA
      : GALLERY_DATA.filter((item) => item.year === selectedYear);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  return (
    <section id="gallery" className="relative py-28 sm:py-36 bg-[#0B1120]/80 backdrop-blur-sm overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A33] border border-brand-orange/30 text-brand-orange text-xs font-mono font-bold tracking-widest uppercase mb-3">
              <Camera className="w-3.5 h-3.5" />
              ARCHIVE & HIGHLIGHTS
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Moments from <span className="text-gradient-orange">Previous Skill Ups</span>
            </h2>
            <p className="mt-3 text-base text-slate-300 max-w-xl">
              Memories etched in code, late nights in the lab, and milestones achieved through{" "}
              <span className="text-brand-orange font-bold">Super 60</span>.
            </p>
          </div>

          {/* Year Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#131E3A] border border-white/10 self-start sm:self-auto">
            {YEARS.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                    isSelected ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="galleryTabIndicator"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-orange to-brand-orangeLight shadow-[0_0_12px_rgba(240,124,39,0.4)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{year}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Masonry / Grid Gallery */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => setLightboxIndex(index)}
                data-cursor-gallery="true"
                className={`group relative rounded-2xl overflow-hidden cursor-pointer bg-[#131E3A] border border-white/10 hover:border-brand-orange/50 transition-all duration-300 shadow-lg hover:shadow-[0_15px_30px_rgba(240,124,39,0.2)] ${
                  item.aspect === "wide"
                    ? "sm:col-span-2 lg:col-span-2 h-72 sm:h-80"
                    : item.aspect === "tall"
                    ? "h-96 sm:h-[420px]"
                    : "h-72 sm:h-80"
                }`}
              >
                {/* Photo with grayscale to color hover transition */}
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-85 group-hover:opacity-70 transition-opacity" />

                {/* Top Badge: Year */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0B1120]/80 backdrop-blur-md border border-white/15 text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-brand-orange" />
                  <span>Skill Up {item.year}</span>
                </div>

                {/* Expand Icon */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0B1120]/70 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Bottom Slide-up Caption Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-orange font-bold block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-display font-bold text-white text-base sm:text-lg drop-shadow">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View Full Album Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setSelectedYear("ALL")}
            className="px-6 py-3 rounded-full border border-white/20 hover:border-brand-orange/60 hover:bg-white/5 text-sm font-semibold text-slate-200 transition-all inline-flex items-center gap-2"
          >
            <span>View Full Super 60 Archives ({GALLERY_DATA.length} Photos)</span>
            <ChevronRight className="w-4 h-4 text-brand-orange" />
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B1120]/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null ? (prev === 0 ? filteredItems.length - 1 : prev - 1) : null
                );
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null ? (prev === filteredItems.length - 1 ? 0 : prev + 1) : null
                );
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[80vh] flex flex-col items-center"
            >
              <div className="relative w-full h-[60vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].title}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-mono font-bold">
                    Skill Up {filteredItems[lightboxIndex].year}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredItems[lightboxIndex].category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  {filteredItems[lightboxIndex].title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
