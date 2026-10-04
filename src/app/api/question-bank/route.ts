import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");
    const topic = searchParams.get("topic") || undefined;

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const where: Record<string, unknown> = { workshopId };
    if (topic) where.topic = topic;

    const questions = await prisma.questionBankItem.findMany({
      where,
      orderBy: [{ topic: "asc" }, { createdAt: "desc" }],
    });

    return successResponse({ questions });
  } catch (err) {
    return handleApiError(err);
  }
}

const CreateSchema = z.object({
  workshopId: z.string(),
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  prompt: z.string().min(3),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  marks: z.number().positive().default(10),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const data = CreateSchema.parse(await req.json());

    const question = await prisma.questionBankItem.create({
      data: {
        workshopId: data.workshopId,
        topic: data.topic || null,
        difficulty: data.difficulty,
        prompt: data.prompt,
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        marks: data.marks,
        createdBy: user.sub,
      },
    });

    return successResponse({ question }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
