"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, UserCheck } from "lucide-react";

interface Mentor {
  name: string;
  role: string;
  lab: string;
  coMentor?: string;
  specialty: string;
  image: string;
  code: string;
  tag: string;
}

const MENTORS: Mentor[] = [
  {
    name: "Ayush Mitra",
    role: "Mentor (Lead)",
    lab: "LAB 1",
    coMentor: "Shanyal",
    specialty: "Low-Latency C++ & Kernel Bypass",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    code: "LEAD-L1",
    tag: "STATION 01",
  },
  {
    name: "Ranjeet",
    role: "Mentor (Lead)",
    lab: "LAB 2",
    coMentor: "Nitish",
    specialty: "Cache Hierarchy & Memory Mechanics",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    code: "LEAD-L2",
    tag: "STATION 02",
  },
  {
    name: "Ramanand",
    role: "Mentor (Lead)",
    lab: "LAB 3",
    coMentor: "Shubham",
    specialty: "Concurrency & Lock-Free Protocols",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    code: "LEAD-L3",
    tag: "STATION 03",
  },
  {
    name: "Shontu",
    role: "Mentor (Lead)",
    lab: "LAB 4",
    specialty: "Data Structures & Competitive Algorithms",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    code: "LEAD-L4",
    tag: "STATION 04",
  },
  {
    name: "Kamal",
    role: "Mentor (Lead)",
    lab: "ONLINE",
    specialty: "Distributed Systems & Remote Profiling",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    code: "LEAD-ON",
    tag: "STATION 05",
  },
];

export default function MentorsGrid() {
  return (
    <section
      id="mentors"
      className="relative py-20 sm:py-24 bg-[#F9F9F9] overflow-hidden border-t-[3px] border-[#111111]"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col items-start gap-2.5">
            <div className="bg-[#111111] text-white font-mono text-xs font-bold px-2.5 py-1 border-[2px] border-[#111111] shadow-[3px_3px_0px_#111111] uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#F07C27] border border-white" />
              [ SECTION 04 // MENTOR CADRE ]
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#111111] tracking-tight uppercase leading-[1.1]">
              LEARN FROM{" "}
              <span className="bg-[#F07C27] text-white px-2.5 py-0.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] inline-block -rotate-1">
                SYSTEMS GUIDES
              </span>
            </h2>
            <p className="mt-2 text-slate-700 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
              Every participant is assigned to an interactive laboratory led by a dedicated Super 60 Lead Mentor who drives hands-on problem sets, code dissection, and direct evaluations.
            </p>
          </div>
          <Link
            href="#mentors"
            className="neo-btn-sm bg-white text-[#111111] px-4 py-2 text-xs font-bold uppercase self-start md:self-end flex items-center gap-1.5"
          >
            <span>[ ROSTER // 5 LEAD MENTORS ]</span>
          </Link>
        </div>

        {/* 5 Lead Mentors Neo-Brutalist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
          {MENTORS.map((mentor) => (
            <div
              key={mentor.name}
              className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] p-3.5 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_#111111] transition-all group"
            >
              {/* Top Header Stamp */}
              <div>
                <div className="w-full flex justify-between items-center mb-2.5 font-mono text-[10px] font-bold border-b-[2px] border-[#111111] pb-2">
                  <span className="bg-[#111111] text-white px-1.5 py-0.5 border border-[#111111]">
                    {mentor.code}
                  </span>
                  <span className="bg-[#FFF0E5] text-[#111111] px-2 py-0.5 border border-[#111111] font-black uppercase">
                    {mentor.lab}
                  </span>
                </div>

                {/* Portrait Frame */}
                <div className="relative h-48 w-full border-[2px] border-[#111111] overflow-hidden mb-3 bg-slate-900 shadow-[2px_2px_0px_#111111]">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#111111]/90 text-white font-mono text-[9px] font-black px-2 py-0.5 border border-white/30 uppercase tracking-wider backdrop-blur-sm">
                    {mentor.role}
                  </div>
                </div>

                {/* Name & Assignment */}
                <h4 className="font-display font-black text-base text-[#111111] leading-tight uppercase truncate">
                  {mentor.name}
                </h4>

                <div className="mt-1 flex items-center justify-between text-[10px] font-mono font-bold text-slate-600">
                  <span>TRACK: {mentor.lab}</span>
                  {mentor.coMentor && (
                    <span className="text-[#F07C27]">CO: {mentor.coMentor}</span>
                  )}
                </div>
              </div>

              {/* Specialty Tag */}
              <div className="mt-3 bg-[#FFF0E5] text-[#111111] border-[2px] border-[#111111] p-1.5 text-[10px] font-mono font-bold uppercase truncate shadow-[2px_2px_0px_#111111]">
                {mentor.specialty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
