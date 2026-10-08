import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";
import { notifyMany, workshopStudentIds } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId") || undefined;
    const isPublicParam = searchParams.get("isPublic");
    const user = await getSessionUser();

    const where: Record<string, unknown> = {};
    if (workshopId) where.workshopId = workshopId;
    if (isPublicParam === "true") where.isPublic = true;

    // SECURITY: unauthenticated visitors may only ever see public announcements
    if (!user) {
      where.isPublic = true;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });

    const response = successResponse({ announcements });
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    return response;
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

    // Push an in-app notification to the target audience
    if (workshopId) {
      const studentIds = await workshopStudentIds(workshopId, labId);
      await notifyMany(
        studentIds,
        pinned ? `📌 Pinned: ${title}` : `📢 ${title}`,
        bodyText.length > 160 ? `${bodyText.slice(0, 160)}…` : bodyText,
        "ANNOUNCEMENT",
        "/student"
      );
    }

    return successResponse({ announcement }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
