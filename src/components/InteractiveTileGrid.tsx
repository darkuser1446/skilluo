"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Tile {
  x: number;
  y: number;
  intensity: number; // 0 to 1
  targetIntensity: number;
  lastActive: number;
  hueOffset: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
}

export default function InteractiveTileGrid({
  className = "",
  tileSize = 46,
  gap = 1,
  showControls = false,
  theme = "light",
}: {
  className?: string;
  tileSize?: number;
  gap?: number;
  showControls?: boolean;
  theme?: "light" | "dark";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });
  const ripplesRef = useRef<Ripple[]>([]);
  const tilesRef = useRef<Map<string, Tile>>(new Map());
  const animFrameRef = useRef<number | null>(null);
  const [accentMode, setAccentMode] = useState<"orange" | "cyan" | "gold">("orange");

  // Track mouse coordinates relative to canvas
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  // Touch support for mobile and tablet displays
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      active: true,
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = touch.clientX - rect.left;
    const clickY = touch.clientY - rect.top;
    mouseRef.current = {
      x: clickX,
      y: clickY,
      active: true,
    };

    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 0,
      maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.45,
      speed: 12,
      intensity: 1.0,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  // Trigger a ripple on click anywhere
  const handleClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 0,
      maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.45,
      speed: 12,
      intensity: 1.0,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const step = tileSize + gap;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Clean up tile pruning on resize to free off-screen memory
      for (const [key, tile] of tilesRef.current.entries()) {
        if (tile.x > width + step || tile.y > height + step) {
          tilesRef.current.delete(key);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    let lastTime = performance.now();
    let ambientTimer = 0;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      ambientTimer += dt;

      // Clear with dark-translucent slate base
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active;

      // Periodically trigger a random ambient twinkle in a tile
      if (ambientTimer > 0.4) {
        ambientTimer = 0;
        const randCol = Math.floor(Math.random() * (width / step));
        const randRow = Math.floor(Math.random() * (height / step));
        const key = `${randCol}_${randRow}`;
        const existing = tilesRef.current.get(key);
        if (existing) {
          existing.targetIntensity = Math.max(existing.targetIntensity, 0.4 + Math.random() * 0.35);
        } else {
          tilesRef.current.set(key, {
            x: randCol * step,
            y: randRow * step,
            intensity: 0,
            targetIntensity: 0.5,
            lastActive: now,
            hueOffset: Math.random() * 20 - 10,
          });
        }
      }

      // Update ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const rip = ripplesRef.current[i];
        rip.radius += rip.speed;
        rip.intensity *= 0.96;
        if (rip.radius > rip.maxRadius || rip.intensity < 0.02) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // Loop over visible grid bounds
      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 1;

      // Mouse influence radius
      const hoverRadius = tileSize * 2.8;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const tileX = c * step;
          const tileY = r * step;
          const centerX = tileX + tileSize / 2;
          const centerY = tileY + tileSize / 2;
          const key = `${c}_${r}`;

          let tile = tilesRef.current.get(key);
          if (!tile) {
            tile = {
              x: tileX,
              y: tileY,
              intensity: 0,
              targetIntensity: 0,
              lastActive: now,
              hueOffset: 0,
            };
            tilesRef.current.set(key, tile);
          }

          // Check mouse proximity
          let target = 0;
          if (isMouseActive) {
            const dx = mx - centerX;
            const dy = my - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hoverRadius) {
              const factor = Math.max(0, 1 - dist / hoverRadius);
              // Quadratic curve for intense core and smooth outer ring
              target = Math.pow(factor, 1.8);
            }
          }

          // Check ripples
          for (let i = 0; i < ripplesRef.current.length; i++) {
            const rip = ripplesRef.current[i];
            const dist = Math.sqrt((centerX - rip.x) ** 2 + (centerY - rip.y) ** 2);
            const ringDist = Math.abs(dist - rip.radius);
            if (ringDist < tileSize * 1.5) {
              const ripStrength = (1 - ringDist / (tileSize * 1.5)) * rip.intensity;
              target = Math.max(target, ripStrength * 0.95);
            }
          }

          // Smooth interpolation towards target
          if (target > tile.intensity) {
            tile.intensity += (target - tile.intensity) * Math.min(1, dt * 14);
          } else {
            tile.intensity += (0 - tile.intensity) * Math.min(1, dt * 2.8);
          }

          // Base tile draw
          const active = tile.intensity;

          // Base subtle grid border
          ctx.lineWidth = 1;
          if (active > 0.01) {
            // Illuminated active tile
            let strokeColor = `rgba(240, 124, 39, ${0.15 + active * 0.75})`;
            let fillColor = `rgba(240, 124, 39, ${active * 0.22})`;

            if (accentMode === "cyan") {
              strokeColor = `rgba(56, 189, 248, ${0.15 + active * 0.75})`;
              fillColor = `rgba(56, 189, 248, ${active * 0.22})`;
            } else if (accentMode === "gold") {
              strokeColor = `rgba(255, 183, 3, ${0.15 + active * 0.75})`;
              fillColor = `rgba(255, 183, 3, ${active * 0.22})`;
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(tileX, tileY, tileSize, tileSize);

            ctx.strokeStyle = strokeColor;
            ctx.strokeRect(tileX + 0.5, tileY + 0.5, tileSize - 1, tileSize - 1);

            // Optional center dot when tile is hot
            if (active > 0.45) {
              ctx.fillStyle = strokeColor;
              ctx.beginPath();
              ctx.arc(centerX, centerY, 1.8 * active, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Idle tile: sleek hairline border
            ctx.strokeStyle =
              theme === "light"
                ? "rgba(240, 124, 39, 0.04)"
                : "rgba(255, 255, 255, 0.038)";
            ctx.strokeRect(tileX + 0.5, tileY + 0.5, tileSize - 1, tileSize - 1);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tileSize, gap, accentMode, theme, handleClick, handleMouseMove, handleMouseLeave, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
    >
      {/* Decorative Canvas & radial corner fades wrapped with aria-hidden="true" */}
      <div aria-hidden="true" className="absolute inset-0">
        <canvas ref={canvasRef} className="block w-full h-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,11,20,0.85)_100%)] pointer-events-none" />
      </div>

      {showControls && (
        <div
          role="toolbar"
          aria-label="Interactive tile accent controls"
          className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full bg-[#0F172A]/85 backdrop-blur-md px-3 py-1.5 border border-slate-800 text-[11px] font-mono shadow-xl"
        >
          <span className="text-slate-400">Interactive Tiles:</span>
          <button
            type="button"
            onClick={() => setAccentMode("orange")}
            className={`w-3.5 h-3.5 rounded-full bg-brand-orange transition-transform ${
              accentMode === "orange" ? "ring-2 ring-white scale-110" : "opacity-60"
            }`}
            title="Orange Flame Accent"
            aria-label="Orange Flame Accent"
          />
          <button
            type="button"
            onClick={() => setAccentMode("cyan")}
            className={`w-3.5 h-3.5 rounded-full bg-sky-400 transition-transform ${
              accentMode === "cyan" ? "ring-2 ring-white scale-110" : "opacity-60"
            }`}
            title="Electric Cyan Accent"
            aria-label="Electric Cyan Accent"
          />
          <button
            type="button"
            onClick={() => setAccentMode("gold")}
            className={`w-3.5 h-3.5 rounded-full bg-amber-400 transition-transform ${
              accentMode === "gold" ? "ring-2 ring-white scale-110" : "opacity-60"
            }`}
            title="Super 60 Gold Accent (#FFB703)"
            aria-label="Super 60 Gold Accent"
          />
        </div>
      )}
    </div>
  );
}
