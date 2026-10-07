"use client";

import React, { useRef, ReactNode } from "react";
import { animate } from "animejs";

interface Anime3DCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  depth?: number;
}

export default function Anime3DCard({
  children,
  className = "",
  maxTilt = 7,
  depth = 15,
}: Anime3DCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = -((y - centerY) / centerY) * maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    // Use Anime.js to smoothly animate 3D CSS transforms directly on GPU
    animate(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      translateZ: depth,
      scale: 1.02,
      duration: 250,
      ease: "outQuad",
    });

    if (glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(240, 124, 39, 0.15) 0%, transparent 60%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    // Spring back smoothly to neutral position with Anime.js
    animate(card, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      scale: 1,
      duration: 600,
      ease: "outQuad",
    });

    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      <div
        ref={cardRef}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative w-full h-full transition-shadow duration-300"
      >
        {children}

        {/* Dynamic 3D Glare Layer */}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-0 transition-opacity duration-300 z-20"
        />
      </div>
    </div>
  );
}
