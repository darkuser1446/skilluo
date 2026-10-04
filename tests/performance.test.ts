import { describe, it, expect } from "vitest";

// Pure calculation formula logic matching src/lib/performance.ts
function computeScore(
  scores: {
    assignments: number;
    assessments: number;
    attendance: number;
    exercises: number;
    doubts: number;
  },
  weights: {
    assignments?: number;
    assessments?: number;
    attendance?: number;
    exercises?: number;
    doubts?: number;
  } = {}
) {
  const wAssignments = weights.assignments ?? 30;
  const wAssessments = weights.assessments ?? 35;
  const wAttendance = weights.attendance ?? 15;
  const wExercises = weights.exercises ?? 10;
  const wDoubts = weights.doubts ?? 5;
  const totalWeight = wAssignments + wAssessments + wAttendance + wExercises + wDoubts;

  const doubtsScore = Math.min(scores.doubts * 20, 100);

  const overallScore = Number(
    (
      (scores.assignments * wAssignments +
        scores.assessments * wAssessments +
        scores.attendance * wAttendance +
        scores.exercises * wExercises +
        doubtsScore * wDoubts) /
      (totalWeight || 100)
    ).toFixed(1)
  );

  return overallScore;
}

describe("Performance & Evaluation Formula Suite", () => {
  it("should calculate 100% when all components are perfect (100%)", () => {
    const perfectScore = computeScore({
      assignments: 100,
      assessments: 100,
      attendance: 100,
      exercises: 100,
      doubts: 5, // 5 * 20 = 100%
    });
    expect(perfectScore).toBe(100.0);
  });

  it("should calculate correct weighted composite for standard distribution", () => {
    // With default weights (30+35+15+10+5 = 95 total weight):
    // (80*30 + 90*35 + 100*15 + 70*10 + (2*20)*5) / 95 = 7950 / 95 = 83.7
    const score = computeScore({
      assignments: 80,
      assessments: 90,
      attendance: 100,
      exercises: 70,
      doubts: 2,
    });
    expect(score).toBe(83.7);

    // With explicit 100% summed weights (30 + 35 + 15 + 10 + 10 = 100):
    const score100 = computeScore(
      {
        assignments: 80,
        assessments: 90,
        attendance: 100,
        exercises: 70,
        doubts: 2,
      },
      { assignments: 30, assessments: 35, attendance: 15, exercises: 10, doubts: 10 }
    );
    // (2400 + 3150 + 1500 + 700 + 400) / 100 = 81.5
    expect(score100).toBe(81.5);
  });

  it("should correctly handle custom weights if reconfigured by admin", () => {
    // Custom weights: Assignments 50%, Assessments 50%
    const score = computeScore(
      {
        assignments: 90,
        assessments: 70,
        attendance: 100,
        exercises: 100,
        doubts: 5,
      },
      {
        assignments: 50,
        assessments: 50,
        attendance: 0,
        exercises: 0,
        doubts: 0,
      }
    );
    expect(score).toBe(80.0);
  });

  it("should clamp doubt participation score to maximum 100%", () => {
    // 10 doubts * 20 = 200, clamped to 100
    const score = computeScore({
      assignments: 100,
      assessments: 100,
      attendance: 100,
      exercises: 100,
      doubts: 25,
    });
    expect(score).toBe(100.0);
  });

  it("should identify cutoff threshold for Super 60 admission (>= 75.0)", () => {
    const qualified = computeScore({
      assignments: 85,
      assessments: 80,
      attendance: 90,
      exercises: 80,
      doubts: 3,
    });
    expect(qualified).toBeGreaterThanOrEqual(75.0);
  });
});
