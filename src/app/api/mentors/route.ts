import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/**
 * GET /api/mentors?workshopId=...
 * Returns all active mentors. If workshopId is provided, filters to mentors
 * assigned to labs in that workshop.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    const mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
        isActive: true,
        ...(workshopId
          ? { labMentors: { some: { lab: { workshopId } } } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        mentorProfile: true,
        labMentors: {
          include: { lab: { select: { id: true, name: true, workshopId: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse({ mentors });
  } catch (err) {
    return handleApiError(err);
  }
}
