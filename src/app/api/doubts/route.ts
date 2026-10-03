import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const doubts = await prisma.doubt.findMany({
      where: {
        workshopId,
        ...(session?.role === "STUDENT" ? { studentId: session.sub } : {}),
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        lab: true,
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse({ doubts });
  } catch (err) {
    return handleApiError(err);
  }
}

const CreateDoubtSchema = z.object({
  workshopId: z.string(),
  labId: z.string(),
  title: z.string().min(5),
  description: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = CreateDoubtSchema.parse(body);

    const doubt = await prisma.doubt.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId,
        studentId: user.sub,
        title: data.title,
        description: data.description,
        messages: {
          create: {
            senderId: user.sub,
            body: data.description,
          },
        },
      },
      include: {
        messages: true,
        student: { select: { id: true, name: true } },
      },
    });

    return successResponse({ doubt }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
