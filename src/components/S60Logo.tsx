"use client";

import React from "react";

interface S60LogoProps {
  className?: string;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function S60Logo({
  className = "",
  theme = "light",
  size = "md",
}: S60LogoProps) {
  const heightMap = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
  };

  const textMap = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`inline-flex items-center gap-2 group select-none ${className}`}>
      {/* Precision Flame & Ribbon SVG Symbol */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heightMap[size]} w-auto transition-transform duration-300 group-hover:scale-105`}
      >
        <defs>
          {/* Blue Ribbon Gradient */}
          <linearGradient id="s60-blue-ribbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E40AF" />
            <stop offset="40%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Orange Flame Gradient */}
          <linearGradient id="s60-orange-flame" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D9570F" />
            <stop offset="50%" stopColor="#F07C27" />
            <stop offset="100%" stopColor="#FFA048" />
          </linearGradient>

          {/* Yellow Tip Gradient */}
          <linearGradient id="s60-yellow-tip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDE59" />
            <stop offset="100%" stopColor="#F07C27" />
          </linearGradient>
        </defs>

        {/* Left Blue Ribbon Swoosh */}
        <path
          d="M14 42 C10 38 7 30 11 20 C14 12 21 8 20 4 C17 10 12 16 10 24 C8 32 10 38 14 42 Z"
          fill="url(#s60-blue-ribbon)"
        />
        <path
          d="M15 36 C13 32 12 26 15 20 C18 14 23 10 21 6 C18 11 15 16 13 22 C12 28 13 32 15 36 Z"
          fill="#38BDF8"
          opacity="0.6"
        />

        {/* Right Orange Flame Swoosh */}
        <path
          d="M17 40 C20 42 27 42 31 36 C36 29 36 21 31 14 C27 8 23 4 23 4 C24 8 27 12 29 17 C32 23 32 29 28 34 C24 38 20 38 17 40 Z"
          fill="url(#s60-orange-flame)"
        />

        {/* Inner Highlighting Flame Tongue */}
        <path
          d="M21 34 C24 35 28 33 29 28 C30 23 27 18 24 14 C23 12 23 10 23 10 C23 13 25 16 26 20 C27 24 25 28 23 30 C22 31 21 32 21 34 Z"
          fill="url(#s60-yellow-tip)"
        />

        {/* Core Flame Base */}
        <path
          d="M17 38 C16 35 17 31 19 28 C21 25 24 23 23 20 C22 23 20 26 18 29 C16 32 15 35 17 38 Z"
          fill="#F97316"
        />
      </svg>

      {/* S60 Wordmark */}
      <div className="flex items-baseline">
        <span
          className={`font-display font-black tracking-tight ${textMap[size]} ${
            theme === "dark" ? "text-white" : "text-[#0F172A]"
          }`}
        >
          S
        </span>
        <span
          className={`font-display font-black tracking-tight text-[#F07C27] ${textMap[size]}`}
        >
          60
        </span>
      </div>
    </div>
  );
}
