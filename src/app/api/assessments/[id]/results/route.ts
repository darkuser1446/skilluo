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
      submittedCount: assessment._count.results,
      averageScore: average ? Number(average) : null,
      results: assessment.results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
