import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
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

    const isPrivileged = user.role === "ADMIN" || user.role === "MENTOR";
    const sanitizedLab = isPrivileged
      ? lab
      : {
          ...lab,
          students: lab.students.map((ls) => ({
            ...ls,
            student: {
              id: ls.student.id,
              name: ls.student.name,
            },
          })),
        };

    return successResponse({ lab: sanitizedLab });
  } catch (err) {
    return handleApiError(err);
  }
}

const LabUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  schedule: z.string().optional(),
  capacity: z.number().int().optional(),
  leadMentorId: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { id } = await params;
    const body = await req.json();
    const data = LabUpdateSchema.parse(body);
    const { leadMentorId, ...labData } = data;

    const lab = await prisma.lab.update({
      where: { id },
      data: labData,
      include: {
        mentors: {
          include: {
            mentor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (leadMentorId !== undefined) {
      if (leadMentorId && leadMentorId.trim()) {
        await prisma.labMentor.upsert({
          where: { labId_mentorId: { labId: id, mentorId: leadMentorId } },
          update: { isLead: true },
          create: { labId: id, mentorId: leadMentorId, isLead: true },
        });
      }
    }

    const updatedLab = await prisma.lab.findUnique({
      where: { id },
      include: {
        mentors: {
          include: {
            mentor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return successResponse({ lab: updatedLab || lab });
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
