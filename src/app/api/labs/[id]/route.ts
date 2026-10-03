import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lab = await prisma.lab.findUnique({
      where: { id },
      include: {
        mentors: {
          include: {
            mentor: {
              select: { id: true, name: true, email: true, mentorProfile: true },
            },
          },
        },
        students: {
          include: {
            student: { select: { id: true, name: true, email: true, college: true } },
          },
        },
        assignments: { orderBy: { dueDate: "asc" } },
        notes: { orderBy: { createdAt: "desc" } },
        sessions: { orderBy: { date: "desc" } },
        _count: {
          select: { students: true, assignments: true, notes: true, sessions: true },
        },
      },
    });

    if (!lab) return errorResponse("Lab not found", "NOT_FOUND", 404);
    return successResponse({ lab });
  } catch (err) {
    return handleApiError(err);
  }
}

const LabUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  schedule: z.string().optional(),
  capacity: z.number().int().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = LabUpdateSchema.parse(body);
    const lab = await prisma.lab.update({ where: { id }, data });
    return successResponse({ lab });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    await prisma.lab.delete({ where: { id } });
    return successResponse({ message: "Lab deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
