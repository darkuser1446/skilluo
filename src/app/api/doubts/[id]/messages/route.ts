import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notify, notifyMany, labMentorIds } from "@/lib/notify";

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

    const doubt = await prisma.doubt.findUnique({
      where: { id: doubtId },
      select: { title: true, studentId: true, workshopId: true, labId: true },
    });
    if (!doubt) return errorResponse("Doubt not found", "NOT_FOUND", 404);

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

    // Notify the counterpart party
    if (user.role === "STUDENT") {
      const mentorIds = await labMentorIds(doubt.workshopId, doubt.labId);
      await notifyMany(
        mentorIds,
        "New reply on a doubt",
        `${user.name} replied to "${doubt.title}".`,
        "DOUBT",
        "/mentor"
      );
    } else {
      await notify(
        doubt.studentId,
        "Mentor replied to your doubt",
        `New reply on "${doubt.title}".`,
        "DOUBT",
        "/student"
      );
    }

    return successResponse({ message }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
