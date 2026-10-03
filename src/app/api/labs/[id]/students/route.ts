import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const AssignStudentSchema = z.object({
  studentId: z.string(),
  workshopId: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id: labId } = await params;
    const body = await req.json();
    const data = AssignStudentSchema.parse(body);

    // Ensure the student is enrolled in the workshop
    await prisma.workshopEnrollment.upsert({
      where: {
        workshopId_studentId: {
          workshopId: data.workshopId,
          studentId: data.studentId,
        },
      },
      update: {},
      create: {
        workshopId: data.workshopId,
        studentId: data.studentId,
        status: "ENROLLED",
      },
    });

    const labStudent = await prisma.labStudent.upsert({
      where: { labId_studentId: { labId, studentId: data.studentId } },
      update: {},
      create: { labId, studentId: data.studentId },
      include: {
        student: { select: { id: true, name: true, email: true, college: true } },
      },
    });

    return successResponse({ labStudent }, undefined, 201);
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
    const studentId = searchParams.get("studentId");

    if (!studentId) return errorResponse("studentId is required", "BAD_REQUEST", 400);

    await prisma.labStudent.delete({
      where: { labId_studentId: { labId, studentId } },
    });

    return successResponse({ message: "Student removed from lab" });
  } catch (err) {
    return handleApiError(err);
  }
}
