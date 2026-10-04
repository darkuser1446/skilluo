import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: exerciseId } = await params;
    const { code, language } = await req.json();

    if (!code || !language) {
      throw new ApiError("code and language are required", 400, "VALIDATION_ERROR");
    }

    // Verify exercise exists
    const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) return errorResponse("Exercise not found", "NOT_FOUND", 404);

    const existingSubmission = await prisma.exerciseSubmission.findUnique({
      where: {
        exerciseId_studentId: { exerciseId, studentId: user.sub },
      },
    });

    if (
      existingSubmission &&
      (existingSubmission.status === "COMPLETED" ||
        (existingSubmission.status as string) === "REVIEWED" ||
        existingSubmission.score !== null)
    ) {
      return errorResponse(
        "Cannot resubmit an exercise that has already been completed or evaluated",
        "BAD_REQUEST",
        400
      );
    }

    // Upsert — one submission per student per exercise
    const submission = await prisma.exerciseSubmission.upsert({
      where: {
        exerciseId_studentId: { exerciseId, studentId: user.sub },
      },
      create: {
        exerciseId,
        studentId: user.sub,
        code,
        language,
        status: "SUBMITTED",
      },
      update: {
        code,
        language,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return successResponse({ submission }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
