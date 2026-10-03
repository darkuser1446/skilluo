import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const AssignMentorSchema = z.object({
  mentorId: z.string(),
  isLead: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id: labId } = await params;
    const body = await req.json();
    const data = AssignMentorSchema.parse(body);

    const labMentor = await prisma.labMentor.upsert({
      where: { labId_mentorId: { labId, mentorId: data.mentorId } },
      update: { isLead: data.isLead },
      create: { labId, mentorId: data.mentorId, isLead: data.isLead },
      include: {
        mentor: { select: { id: true, name: true, email: true } },
      },
    });

    return successResponse({ labMentor }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id: labId } = await params;
    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");

    if (!mentorId) return errorResponse("mentorId is required", "BAD_REQUEST", 400);

    await prisma.labMentor.delete({
      where: { labId_mentorId: { labId, mentorId } },
    });

    return successResponse({ message: "Mentor removed from lab" });
  } catch (err) {
    return handleApiError(err);
  }
}
