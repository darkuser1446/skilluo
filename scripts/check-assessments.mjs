import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const enrollments = await prisma.workshopEnrollment.findMany({
    where: { workshop: { status: "ACTIVE" } },
    select: { status: true }
  });
  const totalStudents = enrollments.length;
  const selectedCount = enrollments.filter(e => e.status === "SELECTED").length;
  const nonSelectedCount = enrollments.filter(e => e.status !== "SELECTED").length;
  console.log(`WORKSHOP STUDENTS: Total=${totalStudents}, Selected=${selectedCount}, NonSelected=${nonSelectedCount}`);

  const assessments = await prisma.assessment.findMany({
    include: {
      results: {
        include: {
          student: { select: { id: true, name: true, rollNumber: true, email: true } }
        }
      },
      questions: true
    }
  });

  console.log("TOTAL ASSESSMENTS:", assessments.length);
  for (const a of assessments) {
    console.log("ASSESSMENT:", {
      id: a.id,
      title: a.title,
      type: a.type,
      workshopId: a.workshopId,
      labId: a.labId,
      targetLabIds: a.targetLabIds,
      startsAt: a.startsAt.toISOString(),
      endsAt: a.endsAt.toISOString(),
      totalMarks: a.totalMarks,
      resultsCount: a.results.length,
      questionsCount: a.questions.length,
    });
    for (const r of a.results) {
      console.log("  -> RESULT:", {
        id: r.id,
        studentName: r.student?.name,
        studentRoll: r.student?.rollNumber,
        score: r.score,
        correctCount: r.correctCount,
        incorrectCount: r.incorrectCount,
        status: r.status,
        submittedAt: r.submittedAt.toISOString(),
        answers: r.answers,
      });
    }
  }

  const allResults = await prisma.assessmentResult.findMany({
    include: {
      student: { select: { name: true, rollNumber: true } },
      assessment: { select: { id: true, title: true } }
    }
  });
  console.log("\nALL RESULTS IN DB:", allResults.length);
  for (const r of allResults) {
    console.log("  RESULT ROW:", {
      id: r.id,
      assessmentTitle: r.assessment?.title,
      studentName: r.student?.name,
      score: r.score,
      status: r.status,
      submittedAt: r.submittedAt.toISOString(),
    });
  }

  // Also check assignments and submissions
  const assignments = await prisma.assignment.findMany({
    include: {
      submissions: {
        include: {
          student: { select: { name: true, rollNumber: true } }
        }
      }
    }
  });
  console.log("\nALL ASSIGNMENTS IN DB:", assignments.length);
  for (const a of assignments) {
    console.log("  ASSIGNMENT:", a.id, a.title, "submissions:", a.submissions.length);
    for (const s of a.submissions) {
      console.log("    -> SUBMISSION:", s.student?.name, s.score, s.status, s.submittedAt);
    }
  }
  // All audit logs
  const allLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "asc" },
  });
  console.log("\nTOTAL AUDIT LOGS IN DB:", allLogs.length);
  for (const l of allLogs) {
    console.log(l.createdAt.toISOString(), l.action, JSON.stringify(l.details || {}));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
