import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function PATCH(_req: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await prisma.notification.updateMany({
      where: { userId: user.sub, isRead: false },
      data: { isRead: true },
    });

    return successResponse({ updatedCount: result.count });
  } catch (err) {
    return handleApiError(err);
  }
}

export const POST = PATCH;

