import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const AssessmentSubmitSchema = z.object({
  answers: z.record(z.string(), z.string()), // questionId -> selected answer string
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: assessmentId } = await params;
    const body = await req.json();
    const { answers } = AssessmentSubmitSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return errorResponse("Assessment not found", "NOT_FOUND", 404);
    }

    // Score answers automatically
    let totalScore = 0;
    for (const q of assessment.questions) {
      const selected = answers[q.id];
      if (selected && q.correctAnswer && selected.trim() === String(q.correctAnswer).trim()) {
        totalScore += q.marks;
      }
    }

    const result = await prisma.assessmentResult.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId,
          studentId: user.sub,
        },
      },
      update: {
        score: totalScore,
        submittedAt: new Date(),
        status: "COMPLETED",
      },
      create: {
        assessmentId,
        studentId: user.sub,
        score: totalScore,
        status: "COMPLETED",
      },
    });

    return successResponse({ result, score: totalScore, totalMarks: assessment.totalMarks });
  } catch (err) {
    return handleApiError(err);
  }
}
