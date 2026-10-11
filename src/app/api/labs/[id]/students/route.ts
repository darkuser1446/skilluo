import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { notify } from "@/lib/notify";
import { z } from "zod";

const AssignStudentSchema = z.object({
  studentId: z.string(),
  workshopId: z.string(),
});

const MoveStudentSchema = z.object({
  studentId: z.string(),
  targetLabId: z.string(),
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

    // Verify lab exists and fetch workshop info
    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      select: { id: true, name: true, workshopId: true },
    });
    if (!lab) return errorResponse("Lab not found", "NOT_FOUND", 404);

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

    // Remove any previous lab assignment in this workshop so the student is strictly in 1 lab
    const workshopLabs = await prisma.lab.findMany({
      where: { workshopId: data.workshopId },
      select: { id: true },
    });
    const labIds = workshopLabs.map((l) => l.id);
    if (labIds.length > 0) {
      await prisma.labStudent.deleteMany({
        where: {
          studentId: data.studentId,
          labId: { in: labIds },
        },
      });
    }

    const labStudent = await prisma.labStudent.create({
      data: { labId, studentId: data.studentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            phone: true,
            rollNumber: true,
            branch: true,
            semester: true,
          },
        },
      },
    });

    await notify(
      data.studentId,
      `🏛️ Assigned to ${lab.name}`,
      `You have been assigned to ${lab.name}. View your schedule and assignments in your student dashboard.`,
      "INFO",
      "/student"
    );

    return successResponse({ labStudent }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id: sourceLabId } = await params;
    const body = await req.json();
    const { studentId, targetLabId } = MoveStudentSchema.parse(body);

    // Verify target lab
    const targetLab = await prisma.lab.findUnique({
      where: { id: targetLabId },
      select: { id: true, name: true, workshopId: true },
    });
    if (!targetLab) return errorResponse("Target lab not found", "NOT_FOUND", 404);

    // Remove from source lab (and any other labs in the same workshop)
    const workshopLabs = await prisma.lab.findMany({
      where: { workshopId: targetLab.workshopId },
      select: { id: true },
    });
    const labIds = workshopLabs.map((l) => l.id);
    await prisma.labStudent.deleteMany({
      where: {
        studentId,
        labId: { in: labIds },
      },
    });

    // Create in target lab
    const labStudent = await prisma.labStudent.create({
      data: { labId: targetLabId, studentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            phone: true,
            rollNumber: true,
            branch: true,
            semester: true,
          },
        },
      },
    });

    await notify(
      studentId,
      `🏛️ Lab Transferred: ${targetLab.name}`,
      `Your laboratory track has been updated to ${targetLab.name}. Check your student dashboard for details.`,
      "INFO",
      "/student"
    );

    return successResponse({
      message: `Student successfully moved to ${targetLab.name}`,
      labStudent,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id: labId } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) return errorResponse("studentId is required", "BAD_REQUEST", 400);

    await prisma.labStudent.deleteMany({
      where: { labId, studentId },
    });

    return successResponse({ message: "Student removed from lab" });
  } catch (err) {
    return handleApiError(err);
  }
}
