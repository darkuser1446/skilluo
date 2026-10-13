import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notifyMany, workshopStudentIds } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    let studentLabId: string | null = null;
    if (user.role === "STUDENT" && prisma.labStudent?.findFirst) {
      try {
        const enrollment = await prisma.labStudent.findFirst({
          where: { studentId: user.sub },
          select: { labId: true },
        });
        studentLabId = enrollment?.labId || null;
      } catch {
        studentLabId = null;
      }
    }

    const assessments = await prisma.assessment.findMany({
      where: {
        workshopId,
        ...(user.role === "STUDENT" && studentLabId
          ? {
              OR: [
                { labId: null, targetLabIds: { isEmpty: true } },
                { labId: studentLabId },
                { targetLabIds: { has: studentLabId } },
              ],
            }
          : {}),
      },
      include: {
        lab: true,
        questions: true,
        results: user.role === "STUDENT"
          ? { where: { studentId: user.sub } }
          : {
              include: {
                student: { select: { id: true, name: true, email: true } },
              },
            },
      },
      orderBy: { startsAt: "desc" },
    });

    // SECURITY: only ADMIN and MENTOR may see correctAnswer and student results/scores
    const isPrivileged = user.role === "ADMIN" || user.role === "MENTOR";
    const sanitized = !isPrivileged
      ? assessments.map((a) => ({
          ...a,
          questions: a.questions.map((q) => {
            const { correctAnswer: _hidden, ...rest } = q;
            return rest;
          }),
          results: a.results.map((r) => ({
            id: r.id,
            studentId: r.studentId,
            status: r.status,
            score: r.score,
            correctCount: r.correctCount,
            incorrectCount: r.incorrectCount,
            unansweredCount: r.unansweredCount,
            isLocked: r.isLocked,
            violationCount: r.violationCount,
            violationReason: r.violationReason,
            submittedAt: r.submittedAt,
            durationSec: r.durationSec,
          })),
        }))
      : assessments;

    return successResponse({ assessments: sanitized });
  } catch (err) {
    return handleApiError(err);
  }
}

const QuestionSchema = z.object({
  prompt: z.string().min(3),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  marks: z.number().int().positive(),
});

const AssessmentCreateSchema = z.object({
  workshopId: z.string(),
  labId: z.string().optional().nullable(),
  targetLabIds: z.array(z.string()).optional().default([]),
  title: z.string().min(3),
  description: z.string().optional().nullable(),
  type: z.enum(["TEST", "QUIZ", "PROGRAMMING", "ASSIGNMENT"]).default("QUIZ"),
  totalMarks: z.number().positive().default(100),
  passingMarks: z.number().min(0).optional().nullable(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  allowedViolations: z.number().int().positive().default(3),
  instructions: z.string().optional().nullable(),
  startsAt: z.string(),
  endsAt: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const creator = await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = AssessmentCreateSchema.parse(body);

    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      return errorResponse("End time must be after start time", "VALIDATION_ERROR", 400);
    }

    const assessment = await prisma.assessment.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        targetLabIds: data.targetLabIds || [],
        title: data.title,
        description: data.description || null,
        type: data.type,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks ?? null,
        durationMinutes: data.durationMinutes ?? null,
        allowedViolations: data.allowedViolations ?? 3,
        instructions: data.instructions || data.description || null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        questions: {
          create: data.questions.map((q) => ({
            prompt: q.prompt,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            marks: q.marks,
          })),
        },
      },
      include: { questions: true },
    });

    // Notify enrolled students that a new test is scheduled
    let studentIds: string[] = [];
    if (data.targetLabIds && data.targetLabIds.length > 0 && prisma.labStudent?.findMany) {
      try {
        const enrollments = await prisma.labStudent.findMany({
          where: { labId: { in: data.targetLabIds } },
          select: { studentId: true },
        });
        studentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));
      } catch {
        studentIds = [];
      }
    } else {
      studentIds = await workshopStudentIds(data.workshopId, data.labId || undefined);
    }

    await notifyMany(
      studentIds,
      "New test scheduled",
      `"${data.title}" (${data.type}) — ${data.totalMarks} marks. Starts ${new Date(data.startsAt).toLocaleString()}.`,
      "ASSESSMENT",
      "/student"
    );

    await prisma.auditLog.create({
      data: {
        action: "ASSESSMENT_CREATED",
        performedBy: creator.sub,
        targetId: assessment.id,
        details: { title: data.title, type: data.type, workshopId: data.workshopId },
      },
    });

    return successResponse({ assessment }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
