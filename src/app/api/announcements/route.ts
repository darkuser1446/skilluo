import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId") || undefined;
    const isPublicParam = searchParams.get("isPublic");

    const where: Record<string, unknown> = {};
    if (workshopId) where.workshopId = workshopId;
    if (isPublicParam === "true") where.isPublic = true;

    // If workshop-specific, require auth
    if (workshopId) {
      const user = await getSessionUser();
      if (!user) throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    return successResponse({ announcements });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["ADMIN", "MENTOR"]);
    const body = await req.json();
    const { title, body: bodyText, workshopId, labId, isPublic, pinned } = body;

    if (!title || !bodyText) {
      throw new ApiError("Title and body are required", 400, "VALIDATION_ERROR");
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body: bodyText,
        workshopId: workshopId || null,
        labId: labId || null,
        isPublic: isPublic ?? false,
        pinned: pinned ?? false,
        createdBy: user.sub,
      },
    });

    return successResponse({ announcement }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
