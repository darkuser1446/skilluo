"use client";

import React, { useRef, useEffect, useState } from "react";
import { animate } from "animejs";
import { Terminal, Play, CheckCircle2, Cpu, Flame, Layers, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function Anime3DHeroScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cubeRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    "Ready to execute. Click 'Run C++20' to compile."
  );
  const [executionCount, setExecutionCount] = useState(0);

  // 1. Continuous 3D Rotating Tech Cube driven by Anime.js (pure GPU matrix)
  useEffect(() => {
    if (!cubeRef.current) return;

    const cubeAnim = animate(cubeRef.current, {
      rotateX: [0, 360],
      rotateY: [0, 360],
      rotateZ: [0, 180],
      duration: 14000,
      loop: true,
      ease: "linear",
    });

    return () => {
      cubeAnim.pause();
    };
  }, []);

  // 2. Idle 3D Floating Breath of the Stage driven by Anime.js
  useEffect(() => {
    if (!stageRef.current) return;

    const stageFloat = animate(stageRef.current, {
      rotateX: [-2.5, 2.5],
      rotateY: [-3.5, 3.5],
      translateZ: [0, 14],
      duration: 4800,
      alternate: true,
      loop: true,
      ease: "inOutSine",
    });

    return () => {
      stageFloat.pause();
    };
  }, []);

  // 3. Interactive 3D Mouse Parallax using Anime.js
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = -((y - centerY) / centerY) * 11;
    const tiltY = ((x - centerX) / centerX) * 13;

    // Smoothly tilt stage with Anime.js
    animate(stage, {
      rotateX: tiltX,
      rotateY: tiltY,
      duration: 250,
      ease: "outQuad",
    });
  };

  const handleMouseLeave = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Reset smoothly back to neutral floating orientation
    animate(stage, {
      rotateX: 0,
      rotateY: 0,
      duration: 700,
      ease: "outQuad",
    });
  };

  // 4. Interactive Compile & Run Trigger
  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleOutput("Compiling with Clang C++20 [-O3 -Wall -Wextra]...");

    // 3D shockwave on the execution badge with Anime.js
    if (badgeRef.current) {
      animate(badgeRef.current, {
        scale: [1, 0.94, 1.05, 1],
        translateZ: [80, 110, 80],
        duration: 450,
        ease: "outBack",
      });
    }

    setTimeout(() => {
      setExecutionCount((c) => c + 1);
      setConsoleOutput(
        `✓ Build Succeeded in 4.2ms • Output: "Welcome to Super 60 Skill Up 2026" • 60/60 Tests PASSED`
      );
      setIsRunning(false);

      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#F07C27", "#FFA048", "#FFB703", "#38BDF8", "#ffffff"],
      });
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1300px" }}
      className="relative w-full max-w-xl mx-auto py-4 select-none"
    >
      {/* Outer 3D Stage Container */}
      <div
        ref={stageRef}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#111C38] to-[#0A0E1A] p-6 sm:p-7 border border-slate-700/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_35px_rgba(240,124,39,0.15)] overflow-visible"
      >
        {/* Layer 0: Background Holographic Grid Lines */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-3xl bg-[radial-gradient(#F07C27_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"
        />

        {/* 3D Floating Isometric Tech Cube (Anime.js driven) */}
        <div
          style={{
            transform: "translateZ(70px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute top-5 right-6 w-14 h-14 pointer-events-none hidden sm:block"
        >
          <div
            ref={cubeRef}
            style={{
              transformStyle: "preserve-3d",
              width: "48px",
              height: "48px",
            }}
            className="relative"
          >
            {/* 6 Cube Faces with Hardware 3D transforms */}
            <div
              style={{ transform: "rotateY(0deg) translateZ(24px)" }}
              className="absolute inset-0 bg-[#F07C27]/40 border border-[#F07C27] rounded-md backdrop-blur-xs flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm"
            >
              C++
            </div>
            <div
              style={{ transform: "rotateY(90deg) translateZ(24px)" }}
              className="absolute inset-0 bg-sky-500/40 border border-sky-400 rounded-md backdrop-blur-xs flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm"
            >
              S60
            </div>
            <div
              style={{ transform: "rotateY(180deg) translateZ(24px)" }}
              className="absolute inset-0 bg-amber-500/40 border border-amber-400 rounded-md backdrop-blur-xs flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm"
            >
              STL
            </div>
            <div
              style={{ transform: "rotateY(-90deg) translateZ(24px)" }}
              className="absolute inset-0 bg-emerald-500/40 border border-emerald-400 rounded-md backdrop-blur-xs flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm"
            >
              DSA
            </div>
            <div
              style={{ transform: "rotateX(90deg) translateZ(24px)" }}
              className="absolute inset-0 bg-orange-600/40 border border-orange-400 rounded-md backdrop-blur-xs flex items-center justify-center text-[9px] font-mono text-white"
            >
              O(1)
            </div>
            <div
              style={{ transform: "rotateX(-90deg) translateZ(24px)" }}
              className="absolute inset-0 bg-indigo-600/40 border border-indigo-400 rounded-md backdrop-blur-xs flex items-center justify-center text-[9px] font-mono text-white"
            >
              FAST
            </div>
          </div>
        </div>

        {/* Layer 1: Code Window Header (translateZ: 25px) */}
        <div
          style={{ transform: "translateZ(25px)" }}
          className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4"
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm" />
            <span className="ml-2 text-xs font-mono text-slate-300 flex items-center gap-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
              main.cpp
            </span>
          </div>

          <div className="flex items-center gap-2 pr-12 sm:pr-14">
            <span className="text-[10px] font-mono font-semibold text-[#F07C27] bg-[#F07C27]/15 border border-[#F07C27]/40 px-2 py-0.5 rounded-full">
              C++20
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden xs:inline">
              Anime.js 3D Engine
            </span>
          </div>
        </div>

        {/* Layer 2: Syntax Highlighted Editor View (translateZ: 35px) */}
        <div
          style={{ transform: "translateZ(35px)" }}
          className="font-mono text-xs leading-relaxed bg-[#070B14]/90 rounded-xl p-4 border border-slate-800 shadow-inner overflow-x-auto text-slate-300"
        >
          <div className="flex gap-3">
            <div className="text-slate-600 select-none text-right pr-2 border-r border-slate-800 text-[11px] space-y-1">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
              <div>05</div>
              <div>06</div>
              <div>07</div>
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-sky-400">#include</span>{" "}
                <span className="text-emerald-300">&lt;iostream&gt;</span>
              </div>
              <div>
                <span className="text-sky-400">#include</span>{" "}
                <span className="text-emerald-300">&lt;super60/skillup.hpp&gt;</span>
              </div>
              <div>
                <span className="text-amber-400">int</span>{" "}
                <span className="text-indigo-300 font-bold">main</span>() &#123;
              </div>
              <div className="pl-4">
                <span className="text-slate-400">// Master low-latency systems &amp; data structures</span>
              </div>
              <div className="pl-4">
                <span className="text-sky-400">auto</span> student ={" "}
                <span className="text-[#F07C27]">SkillUp::Admit</span>(
                <span className="text-amber-300">&quot;Super 60&quot;</span>);
              </div>
              <div className="pl-4">
                <span className="text-emerald-400">return</span> student.
                <span className="text-sky-300">executeNextCohort</span>();
              </div>
              <div>&#125;</div>
            </div>
          </div>
        </div>

        {/* Layer 3: Interactive Execution Pill & Trigger (translateZ: 65px) */}
        <div
          ref={badgeRef}
          style={{ transform: "translateZ(65px)" }}
          className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131E3A]/90 border border-slate-700/80 rounded-xl p-3 shadow-lg"
        >
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span className="font-mono text-slate-300 text-[11px] truncate max-w-xs">
              {consoleOutput}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="self-end sm:self-auto bg-gradient-to-r from-[#F07C27] to-[#FFA048] hover:brightness-110 active:scale-95 text-white font-display font-semibold text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : "fill-white"}`} />
            <span>{isRunning ? "Running..." : "Run C++20"}</span>
          </button>
        </div>

        {/* Layer 4: 3D Floating Metric Badges (translateZ: 85px) */}
        <div
          style={{ transform: "translateZ(85px)" }}
          className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60"
        >
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-mono">LATENCY</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">0.28ms</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-mono">TIME COMPLEXITY</div>
            <div className="text-xs font-bold text-sky-400 font-mono mt-0.5">O(1) Steady</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] text-slate-400 font-mono">BENCHMARK</div>
            <div className="text-xs font-bold text-[#F07C27] font-mono mt-0.5">Top 1%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
