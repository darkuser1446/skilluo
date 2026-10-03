import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        lab: { select: { id: true, name: true } },
        workshop: { select: { id: true, name: true } },
      },
    });

    if (!exercise) return errorResponse("Exercise not found", "NOT_FOUND", 404);

    // Attach the student's own submission if exists
    const submission = await prisma.exerciseSubmission.findUnique({
      where: { exerciseId_studentId: { exerciseId: id, studentId: user.sub } },
    });

    return successResponse({ exercise, submission: submission ?? null });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      problemStatement,
      difficulty,
      topic,
      examples,
      inputFormat,
      outputFormat,
      constraints,
      sampleInput,
      sampleOutput,
      dueDate,
      maxScore,
      labId,
    } = body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(problemStatement !== undefined && { problemStatement }),
        ...(difficulty !== undefined && { difficulty }),
        ...(topic !== undefined && { topic }),
        ...(examples !== undefined && { examples }),
        ...(inputFormat !== undefined && { inputFormat }),
        ...(outputFormat !== undefined && { outputFormat }),
        ...(constraints !== undefined && { constraints }),
        ...(sampleInput !== undefined && { sampleInput }),
        ...(sampleOutput !== undefined && { sampleOutput }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(maxScore !== undefined && { maxScore }),
        ...(labId !== undefined && { labId: labId || null }),
      },
    });

    return successResponse({ exercise });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id } = await params;
    await prisma.exercise.delete({ where: { id } });
    return successResponse({ message: "Exercise deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
