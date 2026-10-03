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
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        labs: {
          include: {
            mentors: {
              include: { mentor: { select: { id: true, name: true, email: true } } },
            },
            students: {
              include: { student: { select: { id: true, name: true, email: true, college: true } } },
            },
            _count: { select: { students: true, assignments: true, sessions: true } },
          },
        },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true, college: true } },
          },
        },
        _count: { select: { labs: true, enrollments: true, assignments: true, notes: true } },
      },
    });

    if (!workshop) return errorResponse("Workshop not found", "NOT_FOUND", 404);
    return successResponse({ workshop });
  } catch (err) {
    return handleApiError(err);
  }
}

const WorkshopUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  evaluationConfig: z
    .object({
      assignments: z.number().optional(),
      assessments: z.number().optional(),
      attendance: z.number().optional(),
      exercises: z.number().optional(),
      doubts: z.number().optional(),
      feedbackThreshold: z.number().optional(),
    })
    .optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = WorkshopUpdateSchema.parse(body);

    const workshop = await prisma.workshop.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.evaluationConfig && { evaluationConfig: data.evaluationConfig }),
      },
    });

    return successResponse({ workshop });
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
    await prisma.workshop.delete({ where: { id } });
    return successResponse({ message: "Workshop deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
