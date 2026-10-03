import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
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
    await requireAuth();
    const { id: doubtId } = await params;
    const body = await req.json();
    const { status } = StatusSchema.parse(body);

    const doubt = await prisma.doubt.update({
      where: { id: doubtId },
      data: { status, updatedAt: new Date() },
    });

    return successResponse({ doubt });
  } catch (err) {
    return handleApiError(err);
  }
}
