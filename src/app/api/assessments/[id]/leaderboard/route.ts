import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: assessmentId } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { select: { id: true, marks: true } },
      },
    });

    if (!assessment) {
      return errorResponse("Assessment not found", "NOT_FOUND", 404);
    }

    const isPenPaperTest =
      assessment.id === "cmvtedytl0001upw4pnqn794h" ||
      assessment.title.toLowerCase().includes("pen");
    if (user.role === "STUDENT" && isPenPaperTest) {
      return successResponse({
        assessmentId,
        title: assessment.title,
        type: assessment.type,
        totalMarks: assessment.totalMarks,
        totalParticipants: 0,
        leaderboard: [],
        message: "Official rankings and leaderboard will be published after mentor review is complete.",
      });
    }

    // Fetch completed results
    const results = await prisma.assessmentResult.findMany({
      where: {
        assessmentId,
        status: { in: ["COMPLETED", "PENDING_REVIEW"] },
        isLocked: false,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            rollNumber: true,
            college: true,
            labStudents: {
              include: { lab: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: [
        { score: "desc" },
        { durationSec: "asc" },
        { submittedAt: "asc" },
      ],
    });

    const leaderboard = results.map((r, index) => {
      const studentLab = r.student.labStudents[0]?.lab?.name || "General Lab";
      return {
        rank: index + 1,
        studentId: r.student.id,
        studentName: r.student.name,
        labName: studentLab,
        score: r.score,
        totalMarks: assessment.totalMarks,
        correctCount: r.correctCount ?? 0,
        incorrectCount: r.incorrectCount ?? 0,
        unansweredCount: r.unansweredCount ?? 0,
        durationSec: r.durationSec ?? null,
        submittedAt: r.submittedAt,
        isCurrentUser: r.student.id === user.sub,
      };
    });

    return successResponse({
      assessmentId,
      title: assessment.title,
      type: assessment.type,
      totalMarks: assessment.totalMarks,
      totalParticipants: leaderboard.length,
      leaderboard,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
