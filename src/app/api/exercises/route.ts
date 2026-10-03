import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId") || undefined;
    const labId = searchParams.get("labId") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const topic = searchParams.get("topic") || undefined;

    const where: Record<string, unknown> = {};
    if (workshopId) where.workshopId = workshopId;
    if (labId) where.labId = labId;
    if (difficulty) where.difficulty = difficulty;
    if (topic) where.topic = topic;

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        topic: true,
        workshopId: true,
        labId: true,
        dueDate: true,
        maxScore: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
    });

    return successResponse({ exercises });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "MENTOR"]);
    const body = await req.json();
    const {
      workshopId,
      labId,
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
    } = body;

    if (!workshopId || !title || !description || !problemStatement) {
      throw new ApiError(
        "workshopId, title, description, and problemStatement are required",
        400,
        "VALIDATION_ERROR"
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        workshopId,
        labId: labId || null,
        title,
        description,
        problemStatement,
        difficulty: difficulty || "MEDIUM",
        topic: topic || null,
        examples: examples || null,
        inputFormat: inputFormat || null,
        outputFormat: outputFormat || null,
        constraints: constraints || null,
        sampleInput: sampleInput || null,
        sampleOutput: sampleOutput || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore ?? 100,
        createdBy: user.sub,
      },
    });

    return successResponse({ exercise }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
