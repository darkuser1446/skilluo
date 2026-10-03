import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: Record<string, unknown> = { userId: user.sub };
    if (unreadOnly) where.isRead = false;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.sub, isRead: false },
    });

    return successResponse({ notifications, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Internal helper — admin only
    await requireRole(["ADMIN"]);
    const body = await req.json();
    const { userId, title, body: bodyText, type, link } = body;

    if (!userId || !title || !bodyText) {
      throw new ApiError("userId, title, and body are required", 400, "VALIDATION_ERROR");
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body: bodyText,
        type: type || "INFO",
        link: link || null,
      },
    });

    return successResponse({ notification }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
