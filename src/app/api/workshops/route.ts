import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const workshops = await prisma.workshop.findMany({
      orderBy: { year: "desc" },
      include: {
        _count: {
          select: {
            labs: true,
            enrollments: true,
            assignments: true,
            notes: true,
          },
        },
      },
    });

    const response = successResponse({ workshops });
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

const WorkshopCreateSchema = z.object({
  name: z.string().min(2),
  year: z.number().int().min(2020),
  slug: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await req.json();
    const data = WorkshopCreateSchema.parse(body);

    const workshop = await prisma.workshop.create({
      data: {
        name: data.name,
        year: data.year,
        slug: data.slug,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "ACTIVE",
      },
    });

    return successResponse({ workshop }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
