import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notify } from "@/lib/notify";

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
        results:
          user.role === "STUDENT"
            ? {
                where: { studentId: user.sub },
                include: { student: { select: { id: true, name: true } } },
              }
            : {
                include: {
                  student: {
                    select: { id: true, name: true, email: true, college: true },
                  },
                },
                orderBy: { score: "desc" },
              },
        _count: { select: { results: true } },
      },
    });

    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    const scores = assessment.results.map((r) => r.score);
    const average = scores.length
      ? (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)
      : null;

    return successResponse({
      assessmentId,
      title: assessment.title,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      submittedCount: assessment._count.results,
      averageScore: average ? Number(average) : null,
      results: assessment.results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/* Mentor/Admin manually grades text/code answers (PENDING_REVIEW results) */
const GradeSchema = z.object({
  studentId: z.string(),
  score: z.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(["COMPLETED", "PENDING_REVIEW"]).default("COMPLETED"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id: assessmentId } = await params;
    const body = await req.json();
    const data = GradeSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { title: true, totalMarks: true },
    });
    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);
    if (data.score > assessment.totalMarks) {
      return errorResponse(
        `Score cannot exceed total marks (${assessment.totalMarks})`,
        "VALIDATION_ERROR",
        400
      );
    }

    const existing = await prisma.assessmentResult.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: data.studentId } },
    });
    if (!existing) return errorResponse("Result not found", "NOT_FOUND", 404);

    const result = await prisma.assessmentResult.update({
      where: { id: existing.id },
      data: { score: data.score, status: data.status, feedback: data.feedback },
    });

    await notify(
      data.studentId,
      "Test result updated",
      `Your submission for "${assessment.title}" has been graded: ${data.score}/${assessment.totalMarks}.`,
      "RESULT",
      "/student"
    );

    return successResponse({ result });
  } catch (err) {
    return handleApiError(err);
  }
}
