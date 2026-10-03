import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

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

    return successResponse({ assessments });
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
  startsAt: z.string(),
  endsAt: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = AssessmentCreateSchema.parse(body);

    const assessment = await prisma.assessment.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        title: data.title,
        type: data.type,
        totalMarks: data.totalMarks,
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

    return successResponse({ assessment }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
