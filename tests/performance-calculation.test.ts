import { describe, it, expect } from "vitest";

/**
 * Isolated calculation models directly reflecting the logic in src/lib/performance.ts
 */

export interface EvaluationConfig {
  assignments?: number;
  assessments?: number;
  attendance?: number;
  exercises?: number;
  doubts?: number;
}

export interface MetricInputs {
  assignmentsScore: number;
  assessmentsScore: number;
  attendancePercentage: number;
  exercisesScore: number;
  doubtsResolved: number;
}

export function computeDoubtScore(doubtsResolved: number): number {
  if (doubtsResolved < 0) return 0;
  return Math.min(doubtsResolved * 20, 100);
}

export function computeOverallComposite(
  inputs: MetricInputs,
  config: EvaluationConfig = {}
): number {
  const wAssignments = config.assignments ?? 30;
  const wAssessments = config.assessments ?? 35;
  const wAttendance = config.attendance ?? 15;
  const wExercises = config.exercises ?? 10;
  const wDoubts = config.doubts ?? 5;
  const totalWeight = wAssignments + wAssessments + wAttendance + wExercises + wDoubts;

  const doubtsScore = computeDoubtScore(inputs.doubtsResolved);

  const overallScore = Number(
    (
      (inputs.assignmentsScore * wAssignments +
        inputs.assessmentsScore * wAssessments +
        inputs.attendancePercentage * wAttendance +
        inputs.exercisesScore * wExercises +
        doubtsScore * wDoubts) /
      (totalWeight || 100)
    ).toFixed(1)
  );

  return overallScore;
}

export interface SessionRecord {
  id: string;
  workshopId: string;
  labId: string | null; // null represents workshop-wide session
}

export interface AttendanceEntry {
  sessionId: string;
  studentId: string;
  status: "PRESENT" | "LATE" | "ABSENT";
}

export function computeScopedAttendance(
  sessions: SessionRecord[],
  records: AttendanceEntry[],
  studentId: string,
  studentLabIds: string[]
): number {
  // Scoped to student's labs + workshop-wide (labId == null)
  const scopedSessions = sessions.filter((s) => {
    if (studentLabIds.length > 0) {
      return s.labId === null || studentLabIds.includes(s.labId);
    }
    return true;
  });

  const totalScopedSessions = scopedSessions.length;
  if (totalScopedSessions === 0) {
    return 100.0; // Default to 100% when no sessions scheduled yet
  }

  const scopedSessionIds = new Set(scopedSessions.map((s) => s.id));
  const attendedCount = records.filter(
    (r) =>
      r.studentId === studentId &&
      scopedSessionIds.has(r.sessionId) &&
      (r.status === "PRESENT" || r.status === "LATE")
  ).length;

  return Number(((attendedCount / totalScopedSessions) * 100).toFixed(1));
}

export function computeNormalizedScore(earned: number, max: number): number {
  if (max <= 0) return 0;
  return Number(((earned / max) * 100).toFixed(1));
}

export function evaluateSuper60Benchmark(score: number, threshold = 75.0): boolean {
  return score >= threshold;
}

describe("Performance Calculation & Formula Verification Suite", () => {
  describe("Attendance Scoping Engine", () => {
    const allWorkshopSessions: SessionRecord[] = [
      { id: "s1", workshopId: "ws_2026", labId: null }, // Workshop-wide session
      { id: "s2", workshopId: "ws_2026", labId: "lab_systems_a" }, // Lab A session
      { id: "s3", workshopId: "ws_2026", labId: "lab_systems_a" }, // Lab A session
      { id: "s4", workshopId: "ws_2026", labId: "lab_systems_b" }, // Lab B session
      { id: "s5", workshopId: "ws_2026", labId: "lab_systems_b" }, // Lab B session
      { id: "s6", workshopId: "ws_2026", labId: "lab_systems_b" }, // Lab B session
    ];

    it("should strictly scope sessions to student lab without cross-lab dilution", () => {
      // Student is allocated ONLY to Lab A
      // Relevant sessions: s1 (workshop-wide), s2 (lab A), s3 (lab A) => Total 3 sessions
      // Lab B sessions (s4, s5, s6) MUST NOT dilute student's attendance percentage!
      const studentRecords: AttendanceEntry[] = [
        { sessionId: "s1", studentId: "stu_1", status: "PRESENT" },
        { sessionId: "s2", studentId: "stu_1", status: "PRESENT" },
        { sessionId: "s3", studentId: "stu_1", status: "PRESENT" },
      ];

      const scopedAttendance = computeScopedAttendance(
        allWorkshopSessions,
        studentRecords,
        "stu_1",
        ["lab_systems_a"]
      );

      // Student attended all 3 relevant sessions = 100%
      expect(scopedAttendance).toBe(100.0);

      // Verify that if un-scoped, attendance would falsely be 3/6 = 50%
      const unscopedCount = studentRecords.filter((r) => r.status === "PRESENT").length;
      expect((unscopedCount / allWorkshopSessions.length) * 100).toBe(50.0);
    });

    it("should count both PRESENT and LATE status towards attended percentage", () => {
      const studentRecords: AttendanceEntry[] = [
        { sessionId: "s1", studentId: "stu_2", status: "PRESENT" },
        { sessionId: "s2", studentId: "stu_2", status: "LATE" }, // LATE counts as attended
        { sessionId: "s3", studentId: "stu_2", status: "ABSENT" },
      ];

      const attendance = computeScopedAttendance(
        allWorkshopSessions,
        studentRecords,
        "stu_2",
        ["lab_systems_a"]
      );

      // Attended: s1 (PRESENT) + s2 (LATE) = 2 out of 3 = 66.7%
      expect(attendance).toBe(66.7);
    });

    it("should return 100% default when zero sessions exist", () => {
      const attendance = computeScopedAttendance([], [], "stu_fresh", ["lab_systems_a"]);
      expect(attendance).toBe(100.0);
    });
  });

  describe("Doubt Participation Score Clamping", () => {
    it("should scale doubts linearly at 20 points per resolved doubt up to 5 doubts", () => {
      expect(computeDoubtScore(0)).toBe(0);
      expect(computeDoubtScore(1)).toBe(20);
      expect(computeDoubtScore(2)).toBe(40);
      expect(computeDoubtScore(3)).toBe(60);
      expect(computeDoubtScore(4)).toBe(80);
      expect(computeDoubtScore(5)).toBe(100);
    });

    it("should strictly clamp doubt score to 100% ceiling when resolved doubts exceed 5", () => {
      expect(computeDoubtScore(6)).toBe(100);
      expect(computeDoubtScore(10)).toBe(100);
      expect(computeDoubtScore(50)).toBe(100);
      expect(computeDoubtScore(1000)).toBe(100);
    });

    it("should gracefully handle negative resolved counts", () => {
      expect(computeDoubtScore(-1)).toBe(0);
      expect(computeDoubtScore(-10)).toBe(0);
    });
  });

  describe("Weighted Overall Composite Formula", () => {
    it("should calculate exact 100.0% when all performance components are perfect", () => {
      const perfectMetrics: MetricInputs = {
        assignmentsScore: 100,
        assessmentsScore: 100,
        attendancePercentage: 100,
        exercisesScore: 100,
        doubtsResolved: 5,
      };

      const result = computeOverallComposite(perfectMetrics);
      expect(result).toBe(100.0);
    });

    it("should calculate exact 0.0% when all performance components are zero", () => {
      const zeroMetrics: MetricInputs = {
        assignmentsScore: 0,
        assessmentsScore: 0,
        attendancePercentage: 0,
        exercisesScore: 0,
        doubtsResolved: 0,
      };

      const result = computeOverallComposite(zeroMetrics);
      expect(result).toBe(0.0);
    });

    it("should correctly compute standard weighted composite with 100% summed weights", () => {
      // Configuration with 100 total weight: 30 + 35 + 15 + 10 + 10 = 100
      const weights: EvaluationConfig = {
        assignments: 30,
        assessments: 35,
        attendance: 15,
        exercises: 10,
        doubts: 10,
      };

      const metrics: MetricInputs = {
        assignmentsScore: 85, // 85 * 30 = 2550
        assessmentsScore: 90, // 90 * 35 = 3150
        attendancePercentage: 100, // 100 * 15 = 1500
        exercisesScore: 80, // 80 * 10 = 800
        doubtsResolved: 3, // 60 * 10 = 600
      };
      // Total = (2550 + 3150 + 1500 + 800 + 600) / 100 = 8600 / 100 = 86.0

      const result = computeOverallComposite(metrics, weights);
      expect(result).toBe(86.0);
    });

    it("should support custom weight reconfigurations by workshop administrators", () => {
      // Admin prioritizes code exercises (40%) and assessments (60%)
      const customConfig: EvaluationConfig = {
        assignments: 0,
        assessments: 60,
        attendance: 0,
        exercises: 40,
        doubts: 0,
      };

      const metrics: MetricInputs = {
        assignmentsScore: 20,
        assessmentsScore: 80, // 80 * 60 = 4800
        attendancePercentage: 50,
        exercisesScore: 90, // 90 * 40 = 3600
        doubtsResolved: 0,
      };
      // Total = (4800 + 3600) / 100 = 8400 / 100 = 84.0

      const result = computeOverallComposite(metrics, customConfig);
      expect(result).toBe(84.0);
    });

    it("should prevent NaN division if all weights are configured to 0", () => {
      const zeroWeights: EvaluationConfig = {
        assignments: 0,
        assessments: 0,
        attendance: 0,
        exercises: 0,
        doubts: 0,
      };

      const metrics: MetricInputs = {
        assignmentsScore: 80,
        assessmentsScore: 80,
        attendancePercentage: 80,
        exercisesScore: 80,
        doubtsResolved: 4,
      };

      const result = computeOverallComposite(metrics, zeroWeights);
      expect(Number.isNaN(result)).toBe(false);
      expect(result).toBe(0.0);
    });
  });

  describe("Score Normalization & Super 60 Benchmark Cutoff", () => {
    it("should normalize earned score against total maximum marks", () => {
      expect(computeNormalizedScore(45, 50)).toBe(90.0);
      expect(computeNormalizedScore(18, 20)).toBe(90.0);
      expect(computeNormalizedScore(0, 100)).toBe(0.0);
      expect(computeNormalizedScore(100, 0)).toBe(0.0); // Zero max marks edge case
    });

    it("should accurately evaluate the Super 60 cutoff benchmark (>= 75.0)", () => {
      expect(evaluateSuper60Benchmark(75.0, 75.0)).toBe(true);
      expect(evaluateSuper60Benchmark(85.5, 75.0)).toBe(true);
      expect(evaluateSuper60Benchmark(74.9, 75.0)).toBe(false);
      expect(evaluateSuper60Benchmark(60.0, 75.0)).toBe(false);
    });

    it("should accurately rank a cohort of students in descending order", () => {
      const candidates = [
        { id: "stu_1", overallScore: 78.4 },
        { id: "stu_2", overallScore: 92.1 },
        { id: "stu_3", overallScore: 85.0 },
        { id: "stu_4", overallScore: 64.2 },
      ];

      const ranked = [...candidates].sort((a, b) => b.overallScore - a.overallScore);

      expect(ranked[0].id).toBe("stu_2");
      expect(ranked[0].overallScore).toBe(92.1);
      expect(ranked[1].id).toBe("stu_3");
      expect(ranked[2].id).toBe("stu_1");
      expect(ranked[3].id).toBe("stu_4");

      // Super 60 admissions filter
      const admitted = ranked.filter((c) => evaluateSuper60Benchmark(c.overallScore, 75.0));
      expect(admitted.length).toBe(3);
      expect(admitted.map((c) => c.id)).toEqual(["stu_2", "stu_3", "stu_1"]);
    });
  });
});
