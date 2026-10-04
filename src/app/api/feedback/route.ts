import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        workshopId,
        ...(user.role === "MENTOR" ? { mentorId: user.sub } : {}),
        ...(user.role === "STUDENT" ? { studentId: user.sub } : {}),
      },
      include: {
        mentor: { select: { id: true, name: true } },
        student: { select: { id: true, name: true } },
        lab: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitized = feedbacks.map((f) => {
      if (f.isAnonymous && user.role !== "ADMIN") {
        return {
          ...f,
          studentId: "ANONYMOUS",
          student: { id: "ANONYMOUS", name: "Anonymous Student" },
        };
      }
      return f;
    });

    return successResponse({ feedbacks: sanitized });
  } catch (err) {
    return handleApiError(err);
  }
}

const FeedbackSchema = z.object({
  workshopId: z.string(),
  labId: z.string(),
  mentorId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5),
  category: z.string().default("GENERAL"),
  isAnonymous: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "STUDENT") {
      return errorResponse("Only students can submit mentor feedback", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const data = FeedbackSchema.parse(body);

    const feedback = await prisma.feedback.upsert({
      where: {
        workshopId_studentId_mentorId: {
          workshopId: data.workshopId,
          studentId: user.sub,
          mentorId: data.mentorId,
        },
      },
      update: {
        rating: data.rating,
        comment: data.comment,
        category: data.category,
        isAnonymous: data.isAnonymous,
      },
      create: {
        workshopId: data.workshopId,
        labId: data.labId,
        studentId: user.sub,
        mentorId: data.mentorId,
        rating: data.rating,
        comment: data.comment,
        category: data.category,
        isAnonymous: data.isAnonymous,
      },
    });

    return successResponse({ feedback }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
