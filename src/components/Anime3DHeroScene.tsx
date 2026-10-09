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
      className="relative w-full max-w-xl mx-auto py-2 select-none"
    >
      {/* Outer 3D Stage Container — Neo-Brutalist Console Box */}
      <div
        ref={stageRef}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative bg-[#111111] text-white p-4 sm:p-5 border-[3px] border-[#111111] shadow-[6px_6px_0px_#111111] overflow-visible"
      >
        {/* Layer 0: Background Technical Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(#F07C27_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none"
        />

        {/* 3D Floating Isometric Tech Cube (Anime.js driven) */}
        <div
          style={{
            transform: "translateZ(60px)",
            transformStyle: "preserve-3d",
          }}
          className="absolute top-4 right-4 w-12 h-12 pointer-events-none hidden sm:block"
        >
          <div
            ref={cubeRef}
            style={{
              transformStyle: "preserve-3d",
              width: "40px",
              height: "40px",
            }}
            className="relative"
          >
            {/* 6 Cube Faces with Hardware 3D transforms */}
            <div
              style={{ transform: "rotateY(0deg) translateZ(20px)" }}
              className="absolute inset-0 bg-[#F07C27] border-[2px] border-[#111111] flex items-center justify-center text-[10px] font-mono font-black text-black shadow-sm"
            >
              C++
            </div>
            <div
              style={{ transform: "rotateY(90deg) translateZ(20px)" }}
              className="absolute inset-0 bg-white border-[2px] border-[#111111] flex items-center justify-center text-[10px] font-mono font-black text-black shadow-sm"
            >
              S60
            </div>
            <div
              style={{ transform: "rotateY(180deg) translateZ(20px)" }}
              className="absolute inset-0 bg-[#FFB703] border-[2px] border-[#111111] flex items-center justify-center text-[10px] font-mono font-black text-black shadow-sm"
            >
              STL
            </div>
            <div
              style={{ transform: "rotateY(-90deg) translateZ(20px)" }}
              className="absolute inset-0 bg-[#22C55E] border-[2px] border-[#111111] flex items-center justify-center text-[10px] font-mono font-black text-black shadow-sm"
            >
              O(1)
            </div>
            <div
              style={{ transform: "rotateX(90deg) translateZ(20px)" }}
              className="absolute inset-0 bg-sky-400 border-[2px] border-[#111111] flex items-center justify-center text-[9px] font-mono font-black text-black"
            >
              FAST
            </div>
            <div
              style={{ transform: "rotateX(-90deg) translateZ(20px)" }}
              className="absolute inset-0 bg-[#FFF0E5] border-[2px] border-[#111111] flex items-center justify-center text-[9px] font-mono font-black text-black"
            >
              ASM
            </div>
          </div>
        </div>

        {/* Layer 1: Code Window Header */}
        <div
          style={{ transform: "translateZ(25px)" }}
          className="flex items-center justify-between pb-2.5 border-b-[2px] border-white/20 mb-3"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 border border-[#111111] inline-block" />
            <span className="w-2.5 h-2.5 bg-amber-400 border border-[#111111] inline-block" />
            <span className="w-2.5 h-2.5 bg-emerald-400 border border-[#111111] inline-block" />
            <span className="ml-1 text-xs font-mono text-slate-200 flex items-center gap-1.5 font-bold">
              <Terminal className="w-3.5 h-3.5 text-[#F07C27]" />
              main.cpp
            </span>
          </div>

          <div className="flex items-center gap-2 pr-10 sm:pr-14">
            <span className="text-[10px] font-mono font-bold text-[#111111] bg-[#F07C27] px-2 py-0.5 border border-[#111111]">
              ISO C++23
            </span>
          </div>
        </div>

        {/* Layer 2: Syntax Highlighted Editor View */}
        <div
          style={{ transform: "translateZ(35px)" }}
          className="font-mono text-xs leading-relaxed bg-[#0A0A0A] p-3 border-[2px] border-[#111111] overflow-x-auto text-slate-200"
        >
          <div className="flex gap-3">
            <div className="text-slate-500 select-none text-right pr-2 border-r border-white/20 text-[11px] space-y-0.5 font-mono">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
              <div>05</div>
              <div>06</div>
              <div>07</div>
            </div>
            <div className="space-y-0.5 font-mono text-[11.5px]">
              <div>
                <span className="text-[#F07C27] font-bold">#include</span>{" "}
                <span className="text-emerald-300">&lt;iostream&gt;</span>
              </div>
              <div>
                <span className="text-[#F07C27] font-bold">#include</span>{" "}
                <span className="text-emerald-300">&lt;super60/skillup.hpp&gt;</span>
              </div>
              <div>
                <span className="text-amber-300 font-bold">int</span>{" "}
                <span className="text-white font-black underline decoration-[#F07C27]">main</span>() &#123;
              </div>
              <div className="pl-3 text-slate-400">
                <span>// Zero-overhead systems programming</span>
              </div>
              <div className="pl-3">
                <span className="text-sky-300 font-bold">auto</span> student ={" "}
                <span className="text-[#F07C27] font-bold">Super60::Admit</span>(
                <span className="text-amber-200">&quot;SkillUp_2026&quot;</span>);
              </div>
              <div className="pl-3">
                <span className="text-emerald-400 font-bold">return</span> student.
                <span className="text-sky-200">executeSystemsTrack</span>();
              </div>
              <div>&#125;</div>
            </div>
          </div>
        </div>

        {/* Layer 3: Interactive Execution Pill & Trigger */}
        <div
          ref={badgeRef}
          style={{ transform: "translateZ(55px)" }}
          className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#1A1A1A] border-[2px] border-[#111111] p-2.5 shadow-[2px_2px_0px_#111111]"
        >
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2.5 h-2.5 ${
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
            className="self-end sm:self-auto bg-[#F07C27] hover:bg-[#FF8A3D] text-[#111111] font-mono font-black text-xs px-3.5 py-1.5 border-[2px] border-white shadow-[2px_2px_0px_#FFFFFF] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 uppercase"
          >
            <Play className={`w-3 h-3 ${isRunning ? "animate-spin" : "fill-current"}`} />
            <span>{isRunning ? "Running..." : "[ RUN C++20 ]"}</span>
          </button>
        </div>

        {/* Layer 4: 3D Floating Metric Badges */}
        <div
          style={{ transform: "translateZ(70px)" }}
          className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t-[2px] border-white/20"
        >
          <div className="p-1.5 bg-white text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-center">
            <div className="text-[9px] text-slate-600 font-mono font-bold uppercase">LATENCY</div>
            <div className="text-xs font-black text-[#111111] font-mono">0.28ms</div>
          </div>
          <div className="p-1.5 bg-[#FFF0E5] text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-center">
            <div className="text-[9px] text-slate-600 font-mono font-bold uppercase">COMPLEXITY</div>
            <div className="text-xs font-black text-[#111111] font-mono">O(1) Steady</div>
          </div>
          <div className="p-1.5 bg-[#F07C27] text-[#111111] border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111] text-center">
            <div className="text-[9px] text-black font-mono font-bold uppercase">BENCHMARK</div>
            <div className="text-xs font-black text-black font-mono">TOP 1%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
