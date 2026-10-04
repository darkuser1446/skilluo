import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const sessions = await prisma.session.findMany({
      where: { workshopId },
      include: {
        lab: true,
        attendanceRecords: user.role === "STUDENT"
          ? { where: { studentId: user.sub } }
          : {
              include: {
                student: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
        _count: {
          select: { attendanceRecords: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return successResponse({ sessions });
  } catch (err) {
    return handleApiError(err);
  }
}

const SessionSchema = z.object({
  workshopId: z.string(),
  labId: z.string().optional(),
  title: z.string().min(3),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  topic: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = SessionSchema.parse(body);

    const session = await prisma.session.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        title: data.title,
        date: new Date(data.date),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        topic: data.topic,
      },
    });

    return successResponse({ session }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
