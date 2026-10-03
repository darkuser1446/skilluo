"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest("a, button, [data-cursor-hover], input, textarea");
      const galleryItem = target.closest("[data-cursor-gallery]");

      if (galleryItem) {
        setIsHovered(true);
        setHoverLabel("VIEW");
      } else if (interactive) {
        setIsHovered(true);
        setHoverLabel(null);
      } else {
        setIsHovered(false);
        setHoverLabel(null);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleElementHover);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Outer Lag Ring */}
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center rounded-full border border-brand-orange/60"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovered ? (hoverLabel ? 64 : 44) : 28,
          height: isHovered ? (hoverLabel ? 64 : 44) : 28,
          backgroundColor: hoverLabel
            ? "rgba(242, 116, 32, 0.2)"
            : isHovered
            ? "rgba(242, 116, 32, 0.08)"
            : "transparent",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {hoverLabel && (
          <span className="text-[10px] font-bold text-brand-orange tracking-wider font-mono">
            {hoverLabel}
          </span>
        )}
      </motion.div>

      {/* Center Precise Dot */}
      <motion.div
        className="absolute top-0 left-0 w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_8px_#F27420]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovered ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}
