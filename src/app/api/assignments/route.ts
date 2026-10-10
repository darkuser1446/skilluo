import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notifyMany, workshopStudentIds } from "@/lib/notify";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const assignments = await prisma.assignment.findMany({
      where: { workshopId },
      include: {
        lab: true,
        submissions: session?.role === "STUDENT"
          ? {
              where: { studentId: session.sub },
            }
          : {
              include: {
                student: {
                  select: { id: true, name: true, email: true, college: true, rollNumber: true, branch: true },
                },
              },
            },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return successResponse({ assignments });
  } catch (err) {
    return handleApiError(err);
  }
}

const AssignmentSchema = z.object({
  workshopId: z.string(),
  labId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().min(5),
  dueDate: z.string(),
  maxScore: z.number().default(100),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = AssignmentSchema.parse(body);

    const assignment = await prisma.assignment.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        maxScore: data.maxScore,
        createdBy: user.sub,
      },
    });

    // Notify the target students about the new assignment
    const studentIds = await workshopStudentIds(data.workshopId, data.labId);
    await notifyMany(
      studentIds,
      "New assignment",
      `"${data.title}" — due ${new Date(data.dueDate).toLocaleDateString()}.`,
      "ASSIGNMENT",
      "/student"
    );

    return successResponse({ assignment }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
