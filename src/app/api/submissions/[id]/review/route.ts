import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notify } from "@/lib/notify";

const ReviewSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().min(2),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reviewer = await requireRole(["MENTOR", "ADMIN"]);
    const { id: submissionId } = await params;
    const body = await req.json();
    const data = ReviewSchema.parse(body);

    const existing = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!existing) {
      return errorResponse("Submission not found", "NOT_FOUND", 404);
    }

    if (data.score > existing.assignment.maxScore) {
      return errorResponse(
        `Score cannot exceed assignment maximum score of ${existing.assignment.maxScore}`,
        "VALIDATION_ERROR",
        400
      );
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        status: "REVIEWED",
        reviewedBy: reviewer.sub,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        assignment: true,
      },
    });

    // Tell the student their work was reviewed
    await notify(
      submission.student.id,
      "Assignment evaluated",
      `"${submission.assignment.title}" was graded: ${data.score}/${submission.assignment.maxScore}.`,
      "REVIEW",
      "/student"
    );

    return successResponse({ submission });
  } catch (err) {
    return handleApiError(err);
  }
}
