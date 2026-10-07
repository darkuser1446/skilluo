"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Anime3DCard from "./Anime3DCard";

interface Mentor {
  name: string;
  specialty: string;
  image: string;
}

const MENTORS: Mentor[] = [
  {
    name: "Mentor 1",
    specialty: "C++ / DSA",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 2",
    specialty: "Problem Solving",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 3",
    specialty: "Core Concepts",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 4",
    specialty: "Logic & OOP",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 5",
    specialty: "DSA",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 6",
    specialty: "Projects",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 7",
    specialty: "Doubt Support",
    image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Mentor 8",
    specialty: "Career Guidance",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
];

export default function MentorsGrid() {
  return (
    <section
      id="mentors"
      className="relative py-20 sm:py-24 bg-white/40 backdrop-blur-[1px] overflow-hidden border-t border-slate-100/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-3">
              MEET OUR MENTORS
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#0F172A] leading-tight">
              Learn from <span className="text-[#F07C27]">Experienced Guides</span>
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              A dedicated team of mentors from Super 60 who will guide you throughout the program
              and support your learning journey.
            </p>
          </div>
          <Link
            href="#mentors"
            className="self-start md:self-end border border-orange-300 text-[#F07C27] hover:bg-orange-50 font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Mentors Responsive Grid / Row with Anime.js 3D Tilt */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-5">
          {MENTORS.map((mentor) => (
            <Anime3DCard key={mentor.name} maxTilt={9} depth={10} className="h-full">
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center h-full group">
                {/* Mentor Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-orange-100 group-hover:border-[#F07C27] transition-colors shadow-inner">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Mentor Name */}
                <h4 className="font-display font-bold text-xs sm:text-sm text-[#0F172A] leading-tight mb-1">
                  {mentor.name}
                </h4>

                {/* Specialty */}
                <p className="text-[11px] text-[#F07C27] font-medium leading-tight">
                  {mentor.specialty}
                </p>
              </div>
            </Anime3DCard>
          ))}
        </div>
      </div>
    </section>
  );
}
