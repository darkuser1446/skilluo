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

    const labId = searchParams.get("labId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      workshopId,
      ...(user.role === "STUDENT" ? { studentId: user.sub } : {}),
    };

    if (user.role === "MENTOR") {
      const mentorLabs = await prisma.labMentor.findMany({
        where: { mentorId: user.sub, lab: { workshopId } },
        select: { labId: true },
      });
      const labIds = mentorLabs.map((l) => l.labId);
      where.OR = [
        { mentorId: user.sub },
        ...(labIds.length > 0 ? [{ labId: { in: labIds } }] : []),
      ];
    }

    if (user.role === "ADMIN") {
      if (labId) where.labId = labId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        mentor: { select: { id: true, name: true } },
        student: { select: { id: true, name: true, email: true, rollNumber: true, college: true } },
        lab: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitized = feedbacks.map((f) => {
      if (f.isAnonymous && user.role !== "ADMIN") {
        const { student: _s, studentId: _sid, ...rest } = f;
        return {
          ...rest,
          studentId: "ANONYMOUS",
          student: { id: "ANONYMOUS", name: "Anonymous Student" },
        };
      }
      return f;
    });

    let isMarkedPresent = false;
    if (user.role === "STUDENT") {
      const presentRec = await prisma.attendanceRecord.findFirst({
        where: {
          studentId: user.sub,
          status: "PRESENT",
          session: { workshopId },
        },
      });
      isMarkedPresent = !!presentRec;
    }

    return successResponse({ feedbacks: sanitized, isMarkedPresent });
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

    // Strict mandate: Only students marked PRESENT in a lab session can give ratings
    const attendanceRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId: user.sub,
        status: "PRESENT",
        session: {
          workshopId: data.workshopId,
          ...(data.labId ? { labId: data.labId } : {}),
        },
      },
    });

    if (!attendanceRecord) {
      const anyPresent = await prisma.attendanceRecord.findFirst({
        where: {
          studentId: user.sub,
          status: "PRESENT",
          session: { workshopId: data.workshopId },
        },
      });

      if (!anyPresent) {
        return errorResponse(
          "Rating Locked: Only students who have been marked PRESENT by their mentor in a lab session are permitted to submit evaluations.",
          "FORBIDDEN",
          403
        );
      }
    }

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
        isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true,
      },
      create: {
        workshopId: data.workshopId,
        labId: data.labId,
        studentId: user.sub,
        mentorId: data.mentorId,
        rating: data.rating,
        comment: data.comment,
        category: data.category,
        isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true,
      },
    });

    return successResponse({
      feedback,
      message: "Feedback submitted successfully. Your feedback is anonymous to mentors.",
    }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
