import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    const labs = await prisma.lab.findMany({
      where: workshopId ? { workshopId } : undefined,
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
            student: {
              select: { id: true, name: true, email: true, college: true },
            },
          },
        },
        _count: {
          select: {
            students: true,
            assignments: true,
            notes: true,
            sessions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse({ labs });
  } catch (err) {
    return handleApiError(err);
  }
}

const LabCreateSchema = z.object({
  workshopId: z.string(),
  name: z.string().min(2),
  schedule: z.string().optional(),
  capacity: z.number().int().default(30),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const body = await req.json();
    const data = LabCreateSchema.parse(body);

    const lab = await prisma.lab.create({
      data: {
        workshopId: data.workshopId,
        name: data.name,
        schedule: data.schedule,
        capacity: data.capacity,
      },
    });

    return successResponse({ lab }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
