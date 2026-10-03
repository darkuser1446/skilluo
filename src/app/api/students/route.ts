import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/**
 * GET /api/students?workshopId=...&labId=...&page=1&limit=20
 * Returns enrolled students for a workshop/lab (mentor/admin only).
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");
    const labId = searchParams.get("labId");
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { role: "STUDENT", isActive: true };

    if (labId) {
      where.labStudents = { some: { labId } };
    } else if (workshopId) {
      where.enrollments = { some: { workshopId } };
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          college: true,
          phone: true,
          createdAt: true,
          labStudents: {
            include: { lab: { select: { id: true, name: true } } },
          },
          enrollments: { select: { workshopId: true, status: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({ students }, { page, limit, total });
  } catch (err) {
    return handleApiError(err);
  }
}
