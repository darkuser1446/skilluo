"use client";

import React from "react";
import Image from "next/image";

interface Super60LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export default function Super60Logo({
  className = "",
  size = "md",
  showWordmark = true,
  showSubtitle = true,
  subtitleText = "SKILL UP",
}: Super60LogoProps) {
  const sizeMap = {
    sm: { height: 28, width: 42, text: "text-lg", sub: "text-[9px]" },
    md: { height: 38, width: 56, text: "text-xl", sub: "text-[10px]" },
    lg: { height: 48, width: 72, text: "text-2xl", sub: "text-xs" },
    xl: { height: 60, width: 90, text: "text-3xl", sub: "text-xs" },
  };

  const { height, width, sub: subSize } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Official Super 60 Emblem & Monogram */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <Image
          src="/s60-official-logo.png"
          alt="Super 60 Logo"
          width={width}
          height={height}
          priority
          className="h-auto object-contain drop-shadow-sm"
        />
      </div>

      {/* Optional Wordmark & Subtitle */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="font-display font-black tracking-tight text-[#0F172A] dark:text-white">
              Super <span className="text-[#F07C27]">60</span>
            </span>
            {showSubtitle && (
              <span
                className={`px-2 py-0.5 rounded-full font-mono font-bold bg-[#F07C27]/15 text-[#F07C27] border border-[#F07C27]/30 uppercase tracking-wider ${subSize}`}
              >
                {subtitleText}
              </span>
            )}
          </div>
          <span className="text-[10px] font-mono font-medium tracking-wider text-slate-500 uppercase">
            Systems Engineering Platform
          </span>
        </div>
      )}
    </div>
  );
}
