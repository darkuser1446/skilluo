import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return errorResponse("Announcement not found", "NOT_FOUND", 404);
    return successResponse({ announcement });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["ADMIN", "MENTOR"]);
    const { id } = await params;

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return errorResponse("Announcement not found", "NOT_FOUND", 404);

    if (user.role !== "ADMIN" && existing.createdBy !== user.sub) {
      return errorResponse("Forbidden: You can only edit your own announcements", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const { title, body: bodyText, workshopId, labId, isPublic, pinned } = body;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(bodyText !== undefined && { body: bodyText }),
        ...(workshopId !== undefined && { workshopId }),
        ...(labId !== undefined && { labId }),
        ...(isPublic !== undefined && { isPublic }),
        ...(pinned !== undefined && { pinned }),
      },
    });

    return successResponse({ announcement });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });
    return successResponse({ message: "Announcement deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
