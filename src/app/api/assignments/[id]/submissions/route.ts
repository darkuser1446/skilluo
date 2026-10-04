import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const SubmitSchema = z.object({
  content: z.string().min(5, "Submission content cannot be empty"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: assignmentId } = await params;
    const body = await req.json();
    const { content } = SubmitSchema.parse(body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return errorResponse("Assignment not found", "NOT_FOUND", 404);
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.sub,
        },
      },
    });

    if (existingSubmission && existingSubmission.status === "REVIEWED") {
      return errorResponse("Cannot resubmit an assignment that has already been reviewed", "BAD_REQUEST", 400);
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.sub,
        },
      },
      update: {
        content,
        submittedAt: new Date(),
        status: isLate ? "LATE" : "SUBMITTED",
      },
      create: {
        assignmentId,
        studentId: user.sub,
        content,
        status: isLate ? "LATE" : "SUBMITTED",
      },
    });

    return successResponse({ submission }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
