import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/**
 * GET /api/feedback/mentor/:mentorId?workshopId=...
 * Returns all feedback received by a mentor.
 * Mentors can only see their own; admins see any.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mentorId: string }> }
) {
  try {
    const user = await requireAuth();
    const { mentorId } = await params;
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    // Students cannot query mentor feedback
    if (user.role === "STUDENT") {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }
    // Mentors can only see feedback about themselves
    if (user.role === "MENTOR" && user.sub !== mentorId) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const where: Record<string, unknown> = { mentorId };
    if (workshopId) where.workshopId = workshopId;

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        lab: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating = feedbacks.length
      ? Number((feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(2))
      : null;

    return successResponse({
      feedbacks,
      averageRating: avgRating,
      count: feedbacks.length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
