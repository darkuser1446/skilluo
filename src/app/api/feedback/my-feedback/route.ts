import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/**
 * GET /api/feedback/my-feedback?workshopId=...
 * Returns all feedback the authenticated student has submitted.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) return errorResponse("workshopId is required", "BAD_REQUEST", 400);

    const feedbacks = await prisma.feedback.findMany({
      where: { workshopId, studentId: user.sub },
      include: {
        mentor: {
          select: { id: true, name: true, mentorProfile: true },
        },
        lab: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ feedbacks });
  } catch (err) {
    return handleApiError(err);
  }
}
