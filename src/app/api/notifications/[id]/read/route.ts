import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) return errorResponse("Notification not found", "NOT_FOUND", 404);

    // Users can only mark their own notifications as read
    if (notification.userId !== user.sub) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return successResponse({ notification: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
