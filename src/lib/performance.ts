import { prisma } from "./prisma";

export interface PerformanceBreakdown {
  studentId: string;
  studentName: string;
  college?: string | null;
  workshopId: string;
  assignmentsScore: number; // 0-100 normalized
  assessmentsScore: number; // 0-100 normalized
  attendancePercentage: number; // 0-100
  doubtsResolved: number;
  overallScore: number; // 0-100 weighted
  rank?: number;
}

export async function calculateOverallPerformance(
  studentId: string,
  workshopId: string
): Promise<PerformanceBreakdown> {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, college: true },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // 1. Fetch workshop weights
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: { evaluationConfig: true },
  });

  const config = (workshop?.evaluationConfig as any) || {
    assignments: 30,
    assessments: 35,
    attendance: 15,
    exercises: 10,
    doubts: 5,
  };

  // 2. Assignments score
  const submissions = await prisma.submission.findMany({
    where: {
      studentId,
      assignment: { workshopId },
    },
    include: { assignment: true },
  });

  let totalAssignmentEarned = 0;
  let totalAssignmentMax = 0;
  for (const s of submissions) {
    if (s.score !== null) {
      totalAssignmentEarned += s.score;
      totalAssignmentMax += s.assignment.maxScore;
    }
  }
  const assignmentsScore =
    totalAssignmentMax > 0 ? (totalAssignmentEarned / totalAssignmentMax) * 100 : 0;

  // 3. Assessments score
  const assessmentResults = await prisma.assessmentResult.findMany({
    where: {
      studentId,
      assessment: { workshopId },
    },
    include: { assessment: true },
  });

  let totalAssessEarned = 0;
  let totalAssessMax = 0;
  for (const r of assessmentResults) {
    totalAssessEarned += r.score;
    totalAssessMax += r.assessment.totalMarks;
  }
  const assessmentsScore =
    totalAssessMax > 0 ? (totalAssessEarned / totalAssessMax) * 100 : 0;

  // 4. Attendance percentage
  const totalSessions = await prisma.session.count({
    where: { workshopId },
  });

  const presentRecords = await prisma.attendanceRecord.count({
    where: {
      studentId,
      session: { workshopId },
      status: "PRESENT",
    },
  });

  const attendancePercentage =
    totalSessions > 0 ? (presentRecords / totalSessions) * 100 : 100;

  // 5. Doubts / Participation
  const doubtsResolved = await prisma.doubt.count({
    where: {
      studentId,
      workshopId,
      status: "RESOLVED",
    },
  });
  const doubtsScore = Math.min(doubtsResolved * 20, 100);

  // 6. Overall weighted score
  const wAssignments = config.assignments ?? 30;
  const wAssessments = config.assessments ?? 35;
  const wAttendance = config.attendance ?? 15;
  const wExercises = config.exercises ?? 10;
  const wDoubts = config.doubts ?? 5;
  const totalWeight = wAssignments + wAssessments + wAttendance + wExercises + wDoubts;

  const overallScore = Number(
    (
      (assignmentsScore * wAssignments +
        assessmentsScore * wAssessments +
        attendancePercentage * wAttendance +
        assignmentsScore * wExercises + // exercises proxy
        doubtsScore * wDoubts) /
      (totalWeight || 100)
    ).toFixed(1)
  );

  return {
    studentId,
    studentName: student.name,
    college: student.college,
    workshopId,
    assignmentsScore: Number(assignmentsScore.toFixed(1)),
    assessmentsScore: Number(assessmentsScore.toFixed(1)),
    attendancePercentage: Number(attendancePercentage.toFixed(1)),
    doubtsResolved,
    overallScore,
  };
}

export async function getWorkshopLeaderboard(workshopId: string) {
  const enrollments = await prisma.workshopEnrollment.findMany({
    where: { workshopId },
    select: { studentId: true },
  });

  const list: PerformanceBreakdown[] = [];
  for (const e of enrollments) {
    const perf = await calculateOverallPerformance(e.studentId, workshopId);
    list.push(perf);
  }

  // Sort descending by overallScore
  list.sort((a, b) => b.overallScore - a.overallScore);
  return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
}
