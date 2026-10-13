import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        questions: true,
        lab: true,
        results:
          user.role === "STUDENT"
            ? { where: { studentId: user.sub } }
            : {
                include: {
                  student: { select: { id: true, name: true, email: true } },
                },
              },
      },
    });

    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    // SECURITY: only ADMIN and MENTOR may see correctAnswer and student results/scores
    const isPrivileged = user.role === "ADMIN" || user.role === "MENTOR";
    const sanitized = !isPrivileged
      ? {
          ...assessment,
          questions: assessment.questions.map((q) => {
            const { correctAnswer: _hidden, ...rest } = q;
            return rest;
          }),
          results: assessment.results.map((r) => ({
            id: r.id,
            studentId: r.studentId,
            status: r.status,
            isLocked: r.isLocked,
            violationCount: r.violationCount,
            violationReason: r.violationReason,
            submittedAt: r.submittedAt,
            durationSec: r.durationSec,
          })),
        }
      : assessment;

    return successResponse({ assessment: sanitized });
  } catch (err) {
    return handleApiError(err);
  }
}

const QuestionSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().min(3),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  marks: z.number().int().positive(),
});

const AssessmentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  type: z.enum(["TEST", "QUIZ", "PROGRAMMING", "ASSIGNMENT"]).optional(),
  labId: z.string().nullable().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  durationMinutes: z.number().int().positive().nullable().optional(),
  passingMarks: z.number().min(0).nullable().optional(),
  allowedViolations: z.number().int().min(0).optional(),
  instructions: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  totalMarks: z.number().int().positive().optional(),
  questions: z.array(QuestionSchema).optional(),
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

    const existing = await prisma.assessment.findUnique({
      where: { id },
      include: { _count: { select: { results: true } } },
    });
    if (!existing) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    if (data.questions && data.questions.length > 0) {
      if (existing._count.results > 0) {
        return errorResponse(
          "Cannot modify questions for a test that has already received student submissions",
          "BAD_REQUEST",
          400
        );
      }

      // Validate MCQ correct answer designations
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        const hasOptions = Array.isArray(q.options) && q.options.length > 0;
        if (hasOptions && q.options) {
          const cleanOpts = q.options.map((o) => o.trim()).filter(Boolean);
          if (cleanOpts.length < 2) {
            return errorResponse(
              `Question #${i + 1} must have at least 2 answer options`,
              "VALIDATION_ERROR",
              400
            );
          }
          if (!q.correctAnswer || !q.correctAnswer.trim()) {
            return errorResponse(
              `Please designate a correct answer for Question #${i + 1}`,
              "VALIDATION_ERROR",
              400
            );
          }
          const matchesOption = cleanOpts.some(
            (opt) => opt.toLowerCase() === q.correctAnswer!.trim().toLowerCase()
          );
          if (!matchesOption) {
            return errorResponse(
              `The selected correct answer for Question #${i + 1} must match one of the provided options`,
              "VALIDATION_ERROR",
              400
            );
          }
        }
      }
    }

    const calculatedTotal =
      data.questions && data.questions.length > 0
        ? data.questions.reduce((sum, q) => sum + q.marks, 0)
        : data.totalMarks;

    const assessment = await prisma.$transaction(async (tx) => {
      if (data.questions && data.questions.length > 0) {
        await tx.assessmentQuestion.deleteMany({ where: { assessmentId: id } });
        await tx.assessmentQuestion.createMany({
          data: data.questions.map((q) => ({
            assessmentId: id,
            prompt: q.prompt,
            options: q.options || [],
            correctAnswer: q.correctAnswer || null,
            marks: q.marks,
          })),
        });
      }

      return tx.assessment.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.type && { type: data.type }),
          ...(data.labId !== undefined && { labId: data.labId }),
          ...(data.startsAt && { startsAt: new Date(data.startsAt) }),
          ...(data.endsAt && { endsAt: new Date(data.endsAt) }),
          ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
          ...(data.passingMarks !== undefined && { passingMarks: data.passingMarks }),
          ...(data.allowedViolations !== undefined && { allowedViolations: data.allowedViolations }),
          ...(data.instructions !== undefined && { instructions: data.instructions }),
          ...(calculatedTotal !== undefined && { totalMarks: calculatedTotal }),
          ...(data.publishedAt !== undefined && {
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
          }),
        },
        include: { questions: true },
      });
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
    const existing = await prisma.assessment.findUnique({
      where: { id },
      include: { _count: { select: { results: true } } },
    });
    if (!existing) return errorResponse("Assessment not found", "NOT_FOUND", 404);
    if (existing._count.results > 0) {
      return errorResponse(
        `Cannot delete this test because ${existing._count.results} students have already submitted results. Test responses and score records are permanently preserved.`,
        "BAD_REQUEST",
        400
      );
    }
    await prisma.assessment.delete({ where: { id } });
    return successResponse({ message: "Assessment deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
