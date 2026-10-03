import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const MessageSchema = z.object({
  body: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: doubtId } = await params;
    const json = await req.json();
    const { body } = MessageSchema.parse(json);

    const message = await prisma.doubtMessage.create({
      data: {
        doubtId,
        senderId: user.sub,
        body,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Touch doubt updatedAt and set status to IN_PROGRESS if mentor replied
    await prisma.doubt.update({
      where: { id: doubtId },
      data: {
        updatedAt: new Date(),
        ...(user.role === "MENTOR" ? { status: "IN_PROGRESS" } : {}),
      },
    });

    return successResponse({ message }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
