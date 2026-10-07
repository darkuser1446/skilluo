"use client";

import { motion } from "framer-motion";

export default function AmbientAuraRays() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Top Center Radiant Flame Aura */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: ["-50%", "-48%", "-50%"],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[350px] sm:h-[450px] rounded-[100%] bg-gradient-to-b from-[#FED7AA]/45 via-[#FDBA74]/25 to-transparent blur-[90px]"
      />

      {/* Top Left Warm Gold Filament Beam */}
      <motion.div
        animate={{
          opacity: [0.2, 0.45, 0.2],
          rotate: [-12, -8, -12],
          scaleY: [1, 1.1, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-80px] left-[-100px] w-[500px] h-[700px] origin-top-left bg-gradient-to-br from-[#FFB703]/20 via-[#F07C27]/10 to-transparent blur-[110px]"
      />

      {/* Center Right Peach/Salmon Aurora Stream */}
      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          x: [0, -25, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[35%] right-[-150px] w-[550px] h-[650px] rounded-full bg-gradient-to-l from-[#FB923C]/20 via-[#FFEDD5]/30 to-transparent blur-[120px]"
      />

      {/* Bottom Left Ambient Glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-100px] left-[-80px] w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-[#FFA048]/15 to-transparent blur-[100px]"
      />
    </div>
  );
}
