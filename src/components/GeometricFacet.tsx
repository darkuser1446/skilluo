"use client";

import React from "react";
import { motion } from "framer-motion";

interface FacetProps {
  side: "left" | "right";
  position: "top" | "middle" | "lower" | "bottom";
  className?: string;
}

export default function GeometricFacet({ side, position, className = "" }: FacetProps) {
  const isLeft = side === "left";
  const duration = position === "top" ? 7 : position === "middle" ? 8.5 : 9.5;

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        y: [-6, 6, -6],
        rotate: isLeft ? [-1.5, 1.5, -1.5] : [1.5, -1.5, 1.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute pointer-events-none z-0 select-none ${
        isLeft ? "-left-4 sm:left-0" : "-right-4 sm:right-0"
      } ${className}`}
    >
      <svg
        viewBox="0 0 160 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-28 sm:w-40 md:w-48 lg:w-56 h-auto opacity-75 ${
          !isLeft ? "-scale-x-100" : ""
        }`}
      >
        <defs>
          <linearGradient id={`facet-grad1-${side}-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`facet-grad2-${side}-${position}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id={`facet-grad3-${side}-${position}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFF7ED" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FED7AA" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Low-poly polygonal faceted shards */}
        <polygon points="0,40 70,0 95,85 10,120" fill={`url(#facet-grad1-${side}-${position})`} />
        <polygon points="70,0 145,55 95,85" fill={`url(#facet-grad2-${side}-${position})`} />
        <polygon points="95,85 160,135 110,175 10,120" fill={`url(#facet-grad3-${side}-${position})`} />
        <polygon points="10,120 110,175 65,245 0,210" fill={`url(#facet-grad1-${side}-${position})`} />
        <polygon points="110,175 155,220 65,245" fill={`url(#facet-grad2-${side}-${position})`} />
        <polygon points="65,245 120,260 0,260" fill={`url(#facet-grad3-${side}-${position})`} />
      </svg>
    </motion.div>
  );
}
