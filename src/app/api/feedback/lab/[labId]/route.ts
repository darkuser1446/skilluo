import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/**
 * GET /api/feedback/lab/:labId?workshopId=...
 * Returns all feedback for a specific lab (mentor/admin only).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { labId } = await params;
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    const where: Record<string, unknown> = { labId };
    if (workshopId) where.workshopId = workshopId;

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } },
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
