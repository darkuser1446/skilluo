import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notifyMany, workshopStudentIds } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const assessments = await prisma.assessment.findMany({
      where: { workshopId },
      include: {
        lab: true,
        questions: true,
        results: session?.role === "STUDENT"
          ? { where: { studentId: session.sub } }
          : {
              include: {
                student: { select: { id: true, name: true, email: true } },
              },
            },
      },
      orderBy: { startsAt: "desc" },
    });

    // SECURITY: never expose the answer key to students
    const sanitized =
      session?.role === "STUDENT"
        ? assessments.map((a) => ({
            ...a,
            questions: a.questions.map((q) => {
              const { correctAnswer: _hidden, ...rest } = q;
              return rest;
            }),
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
  labId: z.string().optional(),
  title: z.string().min(3),
  type: z.enum(["TEST", "QUIZ", "PROGRAMMING", "ASSIGNMENT"]).default("QUIZ"),
  totalMarks: z.number().int().positive().default(100),
  passingMarks: z.number().min(0).optional(),
  durationMinutes: z.number().int().positive().optional(),
  instructions: z.string().optional(),
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
        title: data.title,
        type: data.type,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks ?? null,
        durationMinutes: data.durationMinutes ?? null,
        instructions: data.instructions ?? null,
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
    const studentIds = await workshopStudentIds(data.workshopId, data.labId);
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
