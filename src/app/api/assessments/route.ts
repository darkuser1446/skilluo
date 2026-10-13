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

    let targetWorkshopId = workshopId;
    if (!targetWorkshopId) {
      const activeWs = await prisma.workshop.findFirst({
        where: { status: "ACTIVE" },
        select: { id: true },
        orderBy: { createdAt: "desc" },
      });
      targetWorkshopId = activeWs?.id || null;
    }

    if (!targetWorkshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    let isSelectedStudent = false;
    let studentLabId: string | null = null;
    if (user.role === "STUDENT") {
      try {
        if (prisma.workshopEnrollment?.findFirst) {
          const enr = await prisma.workshopEnrollment.findFirst({
            where: { workshopId: targetWorkshopId, studentId: user.sub },
            select: { status: true },
          });
          isSelectedStudent = enr?.status === "SELECTED";
        }
        if (prisma.labStudent?.findFirst) {
          const enrollment = await prisma.labStudent.findFirst({
            where: { studentId: user.sub },
            select: { labId: true },
          });
          studentLabId = enrollment?.labId || null;
          if (studentLabId) isSelectedStudent = true;
        }
      } catch {
        studentLabId = null;
      }
    }

    const allAssessments = await prisma.assessment.findMany({
      where: { workshopId: targetWorkshopId },
      include: {
        lab: true,
        questions: true,
        results: user.role === "STUDENT"
          ? { where: { studentId: user.sub } }
          : {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    rollNumber: true,
                    labStudents: {
                      include: { lab: { select: { id: true, name: true } } },
                    },
                  },
                },
              },
            },
      },
      orderBy: { startsAt: "desc" },
    });

    const assessments = user.role === "STUDENT"
      ? allAssessments.filter((a) => {
          const hasResult = a.results && a.results.length > 0;
          // Submissions must permanently remain visible in student's Test History!
          if (hasResult) return true;

          if (a.targetAudience === "NON_SELECTED") {
            return !isSelectedStudent;
          }
          if (a.targetAudience === "LABS" || (a.targetLabIds && a.targetLabIds.length > 0) || a.labId) {
            if (!studentLabId) return false;
            return a.labId === studentLabId || (a.targetLabIds && a.targetLabIds.includes(studentLabId));
          }
          return true;
        })
      : allAssessments;

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
  targetAudience: z.enum(["ALL", "NON_SELECTED", "LABS"]).optional().default("ALL"),
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

    // ── MCQ Correct Answer Validation ──
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

    const assessment = await prisma.assessment.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        targetLabIds: data.targetLabIds || [],
        targetAudience: data.targetAudience || (data.targetLabIds && data.targetLabIds.length > 0 ? "LABS" : "ALL"),
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
