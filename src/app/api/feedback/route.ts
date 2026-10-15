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
      const mentorLabs = (await prisma.labMentor?.findMany?.({
        where: { mentorId: user.sub, lab: { workshopId } },
        select: { labId: true },
      })) || [];
      const labIds = mentorLabs.map((l: any) => l.labId);
      if (labId && labIds.includes(labId)) {
        where.labId = labId;
        where.OR = [
          { mentorId: user.sub },
          { labId },
        ];
      } else {
        where.OR = [
          { mentorId: user.sub },
          ...(labIds.length > 0 ? [{ labId: { in: labIds } }] : []),
        ];
      }
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

    // Workshop labs to ensure full lab-wise listing
    const workshopLabs = await prisma.lab.findMany({
      where: { workshopId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const analytics = computeFeedbackAnalytics(feedbacks, workshopLabs);

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

    return successResponse({ feedbacks: sanitized, analytics, isMarkedPresent });
  } catch (err) {
    return handleApiError(err);
  }
}

function computeFeedbackAnalytics(feedbacks: any[], labs: { id: string; name: string }[] = []) {
  if (!feedbacks || feedbacks.length === 0) {
    return {
      overall: {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      labWise: labs.map((l) => ({
        labId: l.id,
        labName: l.name,
        totalReviews: 0,
        sumRating: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })),
      dateWise: [],
    };
  }

  const overallDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let overallSum = 0;

  const labMap = new Map<string, any>();
  const dateMap = new Map<string, any>();

  labs.forEach((l) => {
    labMap.set(l.id, {
      labId: l.id,
      labName: l.name,
      totalReviews: 0,
      sumRating: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });

  feedbacks.forEach((f) => {
    const rating = Math.min(5, Math.max(1, Math.round(f.rating || 5)));
    overallDist[rating] = (overallDist[rating] || 0) + 1;
    overallSum += rating;

    const labId = f.labId || f.lab?.id || "unassigned";
    const labName = f.lab?.name || (labId === "unassigned" ? "General / Unassigned" : "Lab");

    if (!labMap.has(labId)) {
      labMap.set(labId, {
        labId,
        labName,
        totalReviews: 0,
        sumRating: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const labEntry = labMap.get(labId)!;
    labEntry.totalReviews += 1;
    labEntry.sumRating += rating;
    labEntry.distribution[rating] = (labEntry.distribution[rating] || 0) + 1;

    const createdAt = new Date(f.createdAt);
    // Indian Standard Time (UTC+5:30)
    const istTime = new Date(createdAt.getTime() + 5.5 * 3600 * 1000);
    const dateKey = istTime.toISOString().slice(0, 10);
    const displayDate = createdAt.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        dateKey,
        displayDate,
        totalReviews: 0,
        sumRating: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });
    }

    const dateEntry = dateMap.get(dateKey)!;
    dateEntry.totalReviews += 1;
    dateEntry.sumRating += rating;
    dateEntry.distribution[rating] = (dateEntry.distribution[rating] || 0) + 1;
  });

  const labWise = Array.from(labMap.values())
    .map((l) => ({
      ...l,
      averageRating: l.totalReviews > 0 ? parseFloat((l.sumRating / l.totalReviews).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.totalReviews - a.totalReviews || b.averageRating - a.averageRating);

  const dateWise = Array.from(dateMap.values())
    .map((d) => ({
      ...d,
      averageRating: d.totalReviews > 0 ? parseFloat((d.sumRating / d.totalReviews).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  return {
    overall: {
      averageRating: parseFloat((overallSum / feedbacks.length).toFixed(2)),
      totalReviews: feedbacks.length,
      distribution: overallDist,
    },
    labWise,
    dateWise,
  };
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
