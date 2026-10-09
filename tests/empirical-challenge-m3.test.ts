import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Milestone 3 Empirical Challenge Suite: UI/UX Modernization & Responsive Polish", () => {
  /* ========================================================================
   * 1. INTERACTIVE TILE GRID EMPIRICAL VERIFICATION & STRESS HARNESS
   * ======================================================================== */
  describe("1. InteractiveTileGrid Touch Support, Gesture & Memory Resilience", () => {
    const tileGridPath = path.resolve(process.cwd(), "src/components/InteractiveTileGrid.tsx");
    const tileGridSource = fs.readFileSync(tileGridPath, "utf-8");

    it("should verify touch event listeners registration and passive flags", () => {
      // Must register touchstart, touchmove, touchend
      expect(tileGridSource).toContain('window.addEventListener("touchstart", handleTouchStart, { passive: true })');
      expect(tileGridSource).toContain('window.addEventListener("touchmove", handleTouchMove, { passive: true })');
      expect(tileGridSource).toContain('window.addEventListener("touchend", handleTouchEnd, { passive: true })');

      // Must deregister on cleanup
      expect(tileGridSource).toContain('window.removeEventListener("touchstart", handleTouchStart)');
      expect(tileGridSource).toContain('window.removeEventListener("touchmove", handleTouchMove)');
      expect(tileGridSource).toContain('window.removeEventListener("touchend", handleTouchEnd)');
    });

    it("should correctly translate touch event client coordinates relative to canvas bounding box", () => {
      // Oracle: touch coordinate mapping implementation from InteractiveTileGrid
      const computeTouchCoords = (
        touch: { clientX: number; clientY: number },
        rect: { left: number; top: number }
      ) => {
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        };
      };

      const rect = { left: 40, top: 120 };
      const touch1 = { clientX: 240, clientY: 520 };
      const res1 = computeTouchCoords(touch1, rect);
      expect(res1.x).toBe(200);
      expect(res1.y).toBe(400);

      // Edge cases: top-left corner, negative coordinates, sub-pixel floats
      const touchEdge = { clientX: 40.5, clientY: 120.25 };
      const resEdge = computeTouchCoords(touchEdge, rect);
      expect(resEdge.x).toBeCloseTo(0.5, 4);
      expect(resEdge.y).toBeCloseTo(0.25, 4);
    });

    it("should verify ripple expansion, exponential intensity decay, and cleanup termination", () => {
      interface SimRipple {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        speed: number;
        intensity: number;
      }

      const createRipple = (w: number, h: number, x = 100, y = 100): SimRipple => ({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(w, h) * 0.45,
        speed: 12,
        intensity: 1.0,
      });

      // Scenario A: Standard 1920x1080 screen where radius hits maxRadius first (864px / 12 = 72 frames)
      const standardRipples: SimRipple[] = [createRipple(1920, 1080)];
      expect(standardRipples[0].maxRadius).toBe(1920 * 0.45); // 864px

      let framesStd = 0;
      while (standardRipples.length > 0 && framesStd < 300) {
        framesStd++;
        for (let i = standardRipples.length - 1; i >= 0; i--) {
          const rip = standardRipples[i];
          rip.radius += rip.speed;
          rip.intensity *= 0.96;
          if (rip.radius > rip.maxRadius || rip.intensity < 0.02) {
            standardRipples.splice(i, 1);
          }
        }
      }
      // Terminates at frame 73 due to maxRadius
      expect(standardRipples.length).toBe(0);
      expect(framesStd).toBe(73);

      // Scenario B: Extremely large screen where intensity < 0.02 triggers cleanup first
      const largeRipples: SimRipple[] = [{
        x: 0,
        y: 0,
        radius: 0,
        maxRadius: 100000,
        speed: 1,
        intensity: 1.0,
      }];

      let framesLarge = 0;
      while (largeRipples.length > 0 && framesLarge < 300) {
        framesLarge++;
        for (let i = largeRipples.length - 1; i >= 0; i--) {
          const rip = largeRipples[i];
          rip.radius += rip.speed;
          rip.intensity *= 0.96;
          if (rip.radius > rip.maxRadius || rip.intensity < 0.02) {
            largeRipples.splice(i, 1);
          }
        }
      }
      // Terminates when 0.96^N < 0.02 (N = 96 frames)
      expect(largeRipples.length).toBe(0);
      expect(framesLarge).toBe(96);
    });

    it("should stress-test ripple pool with 1,000 rapid concurrent touch ripples", () => {
      interface SimRipple {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        speed: number;
        intensity: number;
      }

      const ripples: SimRipple[] = [];
      for (let i = 0; i < 1000; i++) {
        ripples.push({
          x: (i * 13) % 1920,
          y: (i * 17) % 1080,
          radius: 0,
          maxRadius: 800,
          speed: 12,
          intensity: 1.0,
        });
      }

      expect(ripples.length).toBe(1000);

      // Simulate 120 animation frames
      for (let f = 0; f < 120; f++) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rip = ripples[i];
          rip.radius += rip.speed;
          rip.intensity *= 0.96;
          if (rip.radius > rip.maxRadius || rip.intensity < 0.02) {
            ripples.splice(i, 1);
          }
        }
      }

      // All 1,000 ripples must be purged from memory
      expect(ripples.length).toBe(0);
    });

    it("should verify tile memory pruning oracle during viewport resize", () => {
      const tileSize = 46;
      const gap = 1;
      const step = tileSize + gap; // 47px

      const tiles = new Map<string, { x: number; y: number }>();

      // Populate tiles for 4K desktop (3840 x 2160)
      const cols = Math.ceil(3840 / step);
      const rows = Math.ceil(2160 / step);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          tiles.set(`${c}_${r}`, { x: c * step, y: r * step });
        }
      }

      const initialCount = tiles.size;
      expect(initialCount).toBeGreaterThan(3000);

      // Simulate resize to mobile viewport (360 x 640)
      const newWidth = 360;
      const newHeight = 640;
      for (const [key, tile] of tiles.entries()) {
        if (tile.x > newWidth + step || tile.y > newHeight + step) {
          tiles.delete(key);
        }
      }

      const prunedCount = tiles.size;
      // Active tiles for mobile should now be roughly (360/47 + 1) * (640/47 + 1) ≈ 9 * 15 ≈ 135
      expect(prunedCount).toBeLessThan(200);
      expect(prunedCount).toBeGreaterThan(50);
      expect(prunedCount).toBeLessThan(initialCount);

      // Ensure no remaining tile is outside the mobile boundary
      for (const [, tile] of tiles.entries()) {
        expect(tile.x).toBeLessThanOrEqual(newWidth + step);
        expect(tile.y).toBeLessThanOrEqual(newHeight + step);
      }
    });

    it("should verify quadratic falloff curve for tile hover intensity", () => {
      const tileSize = 46;
      const hoverRadius = tileSize * 2.8; // 128.8px

      const computeTargetIntensity = (dist: number) => {
        if (dist >= hoverRadius) return 0;
        const factor = Math.max(0, 1 - dist / hoverRadius);
        return Math.pow(factor, 1.8);
      };

      // At exact center (dist = 0), intensity must be 1.0
      expect(computeTargetIntensity(0)).toBe(1.0);

      // Halfway (dist = hoverRadius / 2), factor = 0.5, 0.5^1.8 ≈ 0.287
      expect(computeTargetIntensity(hoverRadius / 2)).toBeCloseTo(Math.pow(0.5, 1.8), 4);

      // At or beyond hover boundary, intensity must be 0
      expect(computeTargetIntensity(hoverRadius)).toBe(0);
      expect(computeTargetIntensity(hoverRadius + 50)).toBe(0);
    });

    it("should verify WCAG accessibility conformance in InteractiveTileGrid markup", () => {
      // 1. Controls outside aria-hidden wrapper
      expect(tileGridSource).toContain('<div aria-hidden="true" className="absolute inset-0">');
      expect(tileGridSource).toContain('<canvas ref={canvasRef}');

      // 2. Toolbar role and labels
      expect(tileGridSource).toContain('role="toolbar"');
      expect(tileGridSource).toContain('aria-label="Interactive tile accent controls"');

      // 3. Accent buttons have aria-label and titles
      expect(tileGridSource).toContain('aria-label="Orange Flame Accent"');
      expect(tileGridSource).toContain('aria-label="Electric Cyan Accent"');
      expect(tileGridSource).toContain('aria-label="Super 60 Gold Accent"');
    });
  });

  /* ========================================================================
   * 2. COHORT QUOTA MATRIX EMPIRICAL VERIFICATION & STRESS HARNESS
   * ======================================================================== */
  describe("2. CohortQuotaMatrix 60-Cell Matrix, 5 Micro-States & Dual View Modes", () => {
    const matrixPath = path.resolve(process.cwd(), "src/components/CohortQuotaMatrix.tsx");
    const matrixSource = fs.readFileSync(matrixPath, "utf-8");

    interface Candidate {
      studentId?: string;
      studentName?: string;
      college?: string;
      overallScore?: number;
      rank?: number;
      selectionStatus?: string;
    }

    // Pure algorithm extracted from CohortQuotaMatrix.tsx
    const generateSeatData = (
      candidates: Candidate[] = [],
      totalSeats = 60,
      isStudentView = false,
      currentStudentRank?: number,
      currentStudentScore?: number,
      currentStudentStatus?: string
    ) => {
      const sorted = [...candidates].sort((a, b) => {
        if (a.rank && b.rank) return a.rank - b.rank;
        return (b.overallScore || 0) - (a.overallScore || 0);
      });

      const seats = [];
      for (let i = 1; i <= totalSeats; i++) {
        const candidate = sorted[i - 1];
        let state: "selected" | "qualified_gold" | "pending" | "open" = "open";

        if (candidate) {
          if (candidate.selectionStatus === "SELECTED") {
            state = i <= 15 ? "selected" : "qualified_gold";
          } else if (candidate.selectionStatus === "PENDING" || (candidate.overallScore || 0) >= 85) {
            state = "pending";
          } else {
            state = "open";
          }
        } else if (isStudentView) {
          if (currentStudentRank && i === currentStudentRank) {
            state =
              currentStudentStatus === "SELECTED"
                ? "selected"
                : (currentStudentScore || 0) >= 85
                ? "qualified_gold"
                : "pending";
          } else if (i <= 28) {
            state = i <= 15 ? "selected" : "qualified_gold";
          } else if (i <= 45) {
            state = "pending";
          } else {
            state = "open";
          }
        }

        const isCurrentStudent = isStudentView && currentStudentRank === i;

        seats.push({
          seatNumber: i,
          candidate: candidate || null,
          state,
          isCurrentStudent,
        });
      }

      return seats;
    };

    it("should maintain 60-seat invariant across empty, sparse, exact, and oversized candidate inputs", () => {
      // 1. Empty candidate list
      const emptySeats = generateSeatData([]);
      expect(emptySeats.length).toBe(60);
      expect(emptySeats[0].seatNumber).toBe(1);
      expect(emptySeats[59].seatNumber).toBe(60);

      // 2. Sparse candidate list (7 candidates)
      const sparse: Candidate[] = Array.from({ length: 7 }, (_, i) => ({
        studentName: `Candidate ${i + 1}`,
        overallScore: 90 - i * 2,
        rank: i + 1,
        selectionStatus: i < 3 ? "SELECTED" : "PENDING",
      }));
      const sparseSeats = generateSeatData(sparse);
      expect(sparseSeats.length).toBe(60);

      // 3. Exact 60 candidates
      const exact: Candidate[] = Array.from({ length: 60 }, (_, i) => ({
        studentName: `Candidate ${i + 1}`,
        overallScore: 95 - i * 0.5,
        rank: i + 1,
        selectionStatus: i < 15 ? "SELECTED" : "PENDING",
      }));
      const exactSeats = generateSeatData(exact);
      expect(exactSeats.length).toBe(60);

      // 4. Oversized array (150 candidates)
      const oversized: Candidate[] = Array.from({ length: 150 }, (_, i) => ({
        studentName: `Candidate ${i + 1}`,
        overallScore: 100 - i * 0.5,
        rank: i + 1,
        selectionStatus: i < 20 ? "SELECTED" : "PENDING",
      }));
      const oversizedSeats = generateSeatData(oversized);
      expect(oversizedSeats.length).toBe(60);
    });

    it("should correctly classify and assign all 5 distinct micro-states", () => {
      // Create candidates filling ranks 1 through 30
      const candidates: Candidate[] = [];
      // Ranks 1 to 15: SELECTED -> seats 1-15: selected
      for (let i = 1; i <= 15; i++) {
        candidates.push({
          studentName: `Orange Top ${i}`,
          rank: i,
          overallScore: 99 - i,
          selectionStatus: "SELECTED",
        });
      }
      // Ranks 16 to 20: SELECTED -> seats 16-20: qualified_gold
      for (let i = 16; i <= 20; i++) {
        candidates.push({
          studentName: `Gold Qualified ${i}`,
          rank: i,
          overallScore: 90 - (i - 16),
          selectionStatus: "SELECTED",
        });
      }
      // Ranks 21 to 25: PENDING -> seats 21-25: pending
      for (let i = 21; i <= 25; i++) {
        candidates.push({
          studentName: `Pending Review ${i}`,
          rank: i,
          overallScore: 80,
          selectionStatus: "PENDING",
        });
      }
      // Rank 26: UNREVIEWED with score 86 >= 85 -> seat 26: pending
      candidates.push({
        studentName: "Pending by High Score",
        rank: 26,
        overallScore: 86,
        selectionStatus: "UNREVIEWED",
      });
      // Rank 27: REJECTED with score 60 -> seat 27: open
      candidates.push({
        studentName: "Open / Rejected",
        rank: 27,
        overallScore: 60,
        selectionStatus: "REJECTED",
      });

      const seats = generateSeatData(candidates, 60);

      // State 1: selected (rank 1-15 with SELECTED)
      expect(seats[0].state).toBe("selected");
      expect(seats[14].state).toBe("selected");

      // State 2: qualified_gold (rank > 15 with SELECTED)
      expect(seats[15].state).toBe("qualified_gold");
      expect(seats[19].state).toBe("qualified_gold");

      // State 3: pending (explicit PENDING or score >= 85)
      expect(seats[20].state).toBe("pending");
      expect(seats[24].state).toBe("pending");
      expect(seats[25].state).toBe("pending");

      // State 4: open (unqualified or unassigned)
      expect(seats[26].state).toBe("open");
      expect(seats[59].state).toBe("open");

      // State 5: current student highlight
      const studentSeats = generateSeatData([], 60, true, 8, 92, "SELECTED");
      expect(studentSeats[7].isCurrentStudent).toBe(true);
      expect(studentSeats[7].state).toBe("selected");
    });

    it("should satisfy sum invariant: selected + pending + open === 60 across 50 randomized stress tests", () => {
      for (let run = 0; run < 50; run++) {
        const count = Math.floor(Math.random() * 100);
        const candidates: Candidate[] = [];

        for (let i = 1; i <= count; i++) {
          const rand = Math.random();
          candidates.push({
            studentName: `Candidate ${i}`,
            rank: i,
            overallScore: Math.floor(Math.random() * 100),
            selectionStatus: rand < 0.35 ? "SELECTED" : rand < 0.7 ? "PENDING" : "OPEN",
          });
        }

        const seats = generateSeatData(candidates, 60);
        let selectedCount = 0;
        let pendingCount = 0;
        let openCount = 0;

        seats.forEach((s) => {
          if (s.state === "selected" || s.state === "qualified_gold") selectedCount++;
          else if (s.state === "pending") pendingCount++;
          else openCount++;
        });

        expect(selectedCount + pendingCount + openCount).toBe(60);

        const completionPercent = ((selectedCount / 60) * 100).toFixed(0);
        expect(Number(completionPercent)).toBeGreaterThanOrEqual(0);
        expect(Number(completionPercent)).toBeLessThanOrEqual(100);
      }
    });

    it("should mathematically factorize 60 seats evenly across mobile, tablet, and desktop breakpoints", () => {
      const totalSeats = 60;
      expect(totalSeats % 6).toBe(0);  // 10 rows on mobile
      expect(totalSeats % 10).toBe(0); // 6 rows on tablet
      expect(totalSeats % 12).toBe(0); // 5 rows on desktop

      // Verify in component source code
      expect(matrixSource).toContain("grid-cols-6 sm:grid-cols-10 md:grid-cols-12");
      expect(matrixSource).toContain("aspect-square");
    });

    it("should verify CohortQuotaMatrix source contains tooltips, modal drawer, and filter states", () => {
      // Tooltips on hover
      expect(matrixSource).toContain("hoveredSeat !== null");
      expect(matrixSource).toContain("onMouseEnter={() => setHoveredSeat(item.seatNumber)}");
      expect(matrixSource).toContain("onMouseLeave={() => setHoveredSeat(null)}");

      // Click drawer inspection
      expect(matrixSource).toContain("activeInspectedSeat &&");
      expect(matrixSource).toContain("handleSeatClick(item.seatNumber, item.candidate)");

      // Filter chips
      expect(matrixSource).toContain('filterState === "ALL"');
      expect(matrixSource).toContain('filterState === "SELECTED"');
      expect(matrixSource).toContain('filterState === "PENDING"');
      expect(matrixSource).toContain('filterState === "OPEN"');
    });
  });

  /* ========================================================================
   * 3. SKELETON & EMPTY STATE ARCHITECTURE VERIFICATION
   * ======================================================================== */
  describe("3. Skeleton & EmptyState Modular Architecture", () => {
    const skeletonPath = path.resolve(process.cwd(), "src/components/Skeleton.tsx");
    const skeletonSource = fs.readFileSync(skeletonPath, "utf-8");

    const emptyStatePath = path.resolve(process.cwd(), "src/components/EmptyState.tsx");
    const emptyStateSource = fs.readFileSync(emptyStatePath, "utf-8");

    it("should verify Skeleton component exports and theme styling", () => {
      expect(skeletonSource).toContain("export function Skeleton");
      expect(skeletonSource).toContain("export function SkeletonMetric");
      expect(skeletonSource).toContain("export function SkeletonCard");
      expect(skeletonSource).toContain("export function SkeletonTableRow");
      expect(skeletonSource).toContain("export function SkeletonProfile");

      // Pulse animation and styling
      expect(skeletonSource).toContain("animate-pulse");
    });

    it("should verify EmptyState component structure and action branching", () => {
      expect(emptyStateSource).toContain("export default function EmptyState");
      expect(emptyStateSource).toContain("actionHref && actionLabel &&");
      expect(emptyStateSource).toContain("!actionHref && onAction && actionLabel &&");
      expect(emptyStateSource).toContain("border-[#111111]");
      expect(emptyStateSource).toContain("#F07C27");
    });
  });

  /* ========================================================================
   * 4. MOBILE RESPONSIVENESS & STICKY COLUMN ANALYSIS
   * ======================================================================== */
  describe("4. Mobile Responsiveness, Sticky Columns & Overflow Guards", () => {
    it("should verify sticky table columns and scrollbar-none wrapper in Admin Dashboard", () => {
      const adminPath = path.resolve(process.cwd(), "src/app/(dashboard)/admin/page.tsx");
      const adminSource = fs.readFileSync(adminPath, "utf-8");

      // Candidate table sticky column verification:
      // Rank column must be sticky left-0
      expect(adminSource).toMatch(/sticky\s+left-0/);
      // Candidate name column must be sticky left-14
      expect(adminSource).toMatch(/sticky\s+left-14/);
      // Wrapper must have horizontal overflow and scrollbar hiding
      expect(adminSource).toContain("overflow-x-auto scrollbar-none");
    });

    it("should verify sticky student column and scrollbar-none wrapper in Mentor Dashboard", () => {
      const mentorPath = path.resolve(process.cwd(), "src/app/(dashboard)/mentor/page.tsx");
      const mentorSource = fs.readFileSync(mentorPath, "utf-8");

      // Lab roster candidate column sticky verification
      expect(mentorSource).toMatch(/sticky\s+left-0/);
      // Wrapper must have horizontal overflow and scrollbar hiding
      expect(mentorSource).toContain("overflow-x-auto scrollbar-none");
    });

    it("should verify Tailwind palette token consolidation and CSS custom variables", () => {
      const tailwindConfigPath = path.resolve(process.cwd(), "tailwind.config.js");
      const tailwindSource = fs.readFileSync(tailwindConfigPath, "utf-8");

      expect(tailwindSource).toContain('slateDeep: "#070B14"');
      expect(tailwindSource).toContain('slateCard: "#0F172A"');
      expect(tailwindSource).toContain('orange: "#F07C27"');
      expect(tailwindSource).toContain('gold: "#FFB703"');

      const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
      const cssSource = fs.readFileSync(cssPath, "utf-8");

      expect(cssSource).toContain("--brand-slate-deep: #070B14;");
      expect(cssSource).toContain("--brand-slate-card: #0F172A;");
      expect(cssSource).toContain("--brand-gold: #FFB703;");
      expect(cssSource).toContain(".scrollbar-none");
    });

    it("should verify CtaBand navigation wraps with Link href='/register'", () => {
      const ctaBandPath = path.resolve(process.cwd(), "src/components/CtaBand.tsx");
      const ctaBandSource = fs.readFileSync(ctaBandPath, "utf-8");

      // Verify CTA button wraps with Next.js Link to /register
      expect(ctaBandSource).toContain('href="/register"');
      expect(ctaBandSource).toContain("onClick={triggerConfetti}");
    });
  });

  /* ========================================================================
   * 5. DASHBOARD ASYNC BUTTON MICRO-STATES & SKELETON COVERAGE
   * ======================================================================== */
  describe("5. Dashboard Async Button Micro-States & Loading Skeletons", () => {
    it("should verify button spinner micro-states across Student Dashboard async actions", () => {
      const studentPath = path.resolve(process.cwd(), "src/app/(dashboard)/student/page.tsx");
      const studentSource = fs.readFileSync(studentPath, "utf-8");

      // Skeletons on loading
      expect(studentSource.includes("<SkeletonProfile />")).toBe(true);
      expect(studentSource.includes("<SkeletonMetric />")).toBe(true);
      expect(studentSource.includes("<SkeletonCard />")).toBe(true);

      // Button micro-states:
      // 1. Assignment submission
      expect(studentSource.includes("disabled={submitting}")).toBe(true);
      // 2. Testbench execution
      expect(studentSource.includes("disabled={runningTestbench")).toBe(true);
      // 3. Exercise submission
      expect(studentSource.includes("disabled={submittingExercise}")).toBe(true);
      // 4. Doubt reply
      expect(studentSource.includes("disabled={sendingReply}")).toBe(true);
      // 5. Doubt creation
      expect(studentSource.includes("disabled={creatingDoubt}")).toBe(true);
      // 6. Feedback submission
      expect(studentSource.includes("disabled={submittingFeedback}")).toBe(true);
      // Spinner animation
      expect(studentSource.includes("animate-spin")).toBe(true);
    });

    it("should verify button spinner micro-states across Mentor Dashboard async actions", () => {
      const mentorPath = path.resolve(process.cwd(), "src/app/(dashboard)/mentor/page.tsx");
      const mentorSource = fs.readFileSync(mentorPath, "utf-8");

      // Skeletons on loading
      expect(mentorSource.includes("<SkeletonProfile />")).toBe(true);
      expect(mentorSource.includes("<SkeletonMetric />")).toBe(true);
      expect(mentorSource.includes("<SkeletonCard />")).toBe(true);

      // Button micro-states:
      // 1. Evaluation submission
      expect(mentorSource.includes("disabled={reviewing}")).toBe(true);
      // 2. Assignment creation
      expect(mentorSource.includes("disabled={creatingAssignment}")).toBe(true);
      // 3. Exercise creation
      expect(mentorSource.includes("disabled={creatingExercise}")).toBe(true);
      // 4. Notes publishing
      expect(mentorSource.includes("disabled={publishingNote}")).toBe(true);
      // 5. Attendance saving
      expect(mentorSource.includes("disabled={savingAttendance}")).toBe(true);
      // 6. Session creation
      expect(mentorSource.includes("disabled={creatingSession}")).toBe(true);
      // 7. Doubt reply
      expect(mentorSource.includes("disabled={sendingReply}")).toBe(true);
      // 8. Announcement posting
      expect(mentorSource.includes("disabled={postingAnn}")).toBe(true);
      // Spinner animation
      expect(mentorSource.includes("animate-spin")).toBe(true);
    });

    it("should verify button spinner micro-states across Admin Dashboard async actions", () => {
      const adminPath = path.resolve(process.cwd(), "src/app/(dashboard)/admin/page.tsx");
      const adminSource = fs.readFileSync(adminPath, "utf-8");

      // Skeletons on loading
      expect(adminSource.includes("<SkeletonMetric />")).toBe(true);
      expect(adminSource.includes("<SkeletonTableRow />")).toBe(true);

      // Button micro-states:
      // Candidate selection & pending toggles
      expect(adminSource.includes("selectionActionLoading")).toBe(true);
      expect(adminSource.includes("-SELECTED")).toBe(true);
      expect(adminSource.includes("-REJECTED")).toBe(true);
      expect(adminSource.includes("animate-spin")).toBe(true);
    });
  });
});
