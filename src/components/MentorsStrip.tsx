"use client";

import Image from "next/image";
import { ShieldCheck, Terminal } from "lucide-react";

interface Mentor {
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  experience: string;
}

const MENTORS: Mentor[] = [
  {
    name: "Vikram Rathod",
    role: "Senior Systems Architect",
    specialty: "Low-Latency C++ & Kernel Bypass",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    experience: "Ex-Google · Super 60 Alumni",
  },
  {
    name: "Dr. Ananya Roy",
    role: "Compilers & Concurrency Lead",
    specialty: "Memory Models & Lock-Free Data Structures",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    experience: "Systems Researcher",
  },
  {
    name: "Harsh Vardhan",
    role: "Staff Infrastructure Engineer",
    specialty: "High Throughput Distributed Pipelines",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    experience: "Senior Super 60 Mentor",
  },
  {
    name: "Pooja Hegde",
    role: "Graphics & Simulation Specialist",
    specialty: "Vulkan, SIMD & Cache Optimization",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    experience: "AAA Game Engine Dev",
  },
  {
    name: "Rahul Desai",
    role: "Lead Performance Engineer",
    specialty: "eBPF, Profiling & Linux Internals",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    experience: "Super 60 Founding Member",
  },
];

export default function MentorsStrip() {
  const marqueeItems = [...MENTORS, ...MENTORS];

  return (
    <section id="mentors" className="relative py-24 sm:py-32 bg-[#0E1528] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A33] border border-brand-orange/30 text-brand-orange text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Terminal className="w-3.5 h-3.5" />
          EXPERT GUIDANCE
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          Guided by Mentors <span className="text-gradient-orange">Who've Built It</span>
        </h2>
        <p className="mt-3 text-base text-slate-300 max-w-xl mx-auto">
          Learn directly from senior practitioners and{" "}
          <span className="text-brand-orange font-bold">Super 60</span> alumni working at the cutting edge of systems engineering.
        </p>
      </div>

      {/* Infinite Marquee Track (pauses on hover) */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] py-4">
          {marqueeItems.map((mentor, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#131E3A]/90 backdrop-blur-xl border border-white/10 hover:border-brand-orange/40 shadow-lg hover:shadow-[0_8px_25px_rgba(240,124,39,0.15)] transition-all cursor-pointer group flex-shrink-0 w-80 sm:w-96"
            >
              {/* Mentor Avatar */}
              <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-brand-orange to-brand-navy flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  <Image
                    src={mentor.avatar}
                    alt={mentor.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Mentor Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-white text-sm truncate group-hover:text-brand-orange transition-colors">
                    {mentor.name}
                  </h3>
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-300 truncate font-medium">{mentor.role}</p>
                <p className="text-[11px] font-mono text-brand-orange truncate mt-0.5">
                  {mentor.specialty}
                </p>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  {mentor.experience}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
