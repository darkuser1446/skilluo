import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const StatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: doubtId } = await params;
    const body = await req.json();
    const { status } = StatusSchema.parse(body);

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
    });

    if (!doubt) {
      return errorResponse("Doubt not found", "NOT_FOUND", 404);
    }

    if (user.role === "STUDENT") {
      if (doubt.studentId !== user.sub) {
        return errorResponse("Forbidden: You cannot modify this doubt", "FORBIDDEN", 403);
      }
      if (status === "RESOLVED") {
        return errorResponse("Forbidden: Students cannot self-resolve doubts", "FORBIDDEN", 403);
      }
    } else if (user.role !== "ADMIN" && user.role !== "MENTOR") {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const updated = await prisma.doubt.update({
      where: { id: doubtId },
      data: { status, updatedAt: new Date() },
    });

    return successResponse({ doubt: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
