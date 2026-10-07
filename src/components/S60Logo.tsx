"use client";

import React from "react";
import Image from "next/image";

interface S60LogoProps {
  className?: string;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}

export default function S60Logo({
  className = "",
  theme = "light",
  size = "md",
}: S60LogoProps) {
  const sizeMap = {
    sm: { height: 30, width: 45, class: "h-7 w-auto" },
    md: { height: 40, width: 60, class: "h-9 w-auto" },
    lg: { height: 50, width: 75, class: "h-12 w-auto" },
    xl: { height: 64, width: 95, class: "h-16 w-auto" },
  };

  const { height, width, class: heightClass } = sizeMap[size];

  return (
    <div className={`inline-flex items-center group select-none ${className}`}>
      <div
        className={`relative transition-transform duration-300 group-hover:scale-105 ${
          theme === "dark"
            ? "filter drop-shadow-[0_2px_12px_rgba(240,124,39,0.35)] brightness-110"
            : "drop-shadow-sm"
        }`}
      >
        <Image
          src="/s60-official-logo.png"
          alt="Super 60 S60 Official Logo"
          width={width}
          height={height}
          priority
          className={`${heightClass} object-contain`}
        />
      </div>
    </div>
  );
}
