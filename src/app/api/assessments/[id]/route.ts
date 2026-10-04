import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const { id } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true,
        lab: true,
        results:
          session?.role === "STUDENT"
            ? { where: { studentId: session?.sub } }
            : {
                include: {
                  student: { select: { id: true, name: true, email: true } },
                },
              },
      },
    });

    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    // SECURITY: never expose the answer key to students
    const sanitized =
      session?.role === "STUDENT"
        ? {
            ...assessment,
            questions: assessment.questions.map((q) => {
              const { correctAnswer: _hidden, ...rest } = q;
              return rest;
            }),
          }
        : assessment;

    return successResponse({ assessment: sanitized });
  } catch (err) {
    return handleApiError(err);
  }
}

const AssessmentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(["TEST", "QUIZ", "PROGRAMMING", "ASSIGNMENT"]).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  publishedAt: z.string().nullable().optional(),
  totalMarks: z.number().int().positive().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = AssessmentUpdateSchema.parse(body);

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.startsAt && { startsAt: new Date(data.startsAt) }),
        ...(data.endsAt && { endsAt: new Date(data.endsAt) }),
        ...(data.totalMarks !== undefined && { totalMarks: data.totalMarks }),
        ...(data.publishedAt !== undefined && {
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        }),
      },
    });

    return successResponse({ assessment });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    await prisma.assessment.delete({ where: { id } });
    return successResponse({ message: "Assessment deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
