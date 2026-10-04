import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

/** Admin activity / audit log feed */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || "1");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    // Enrich with performer names where possible
    const performerIds = Array.from(
      new Set(logs.map((l) => l.performedBy).filter(Boolean))
    );
    const performers = await prisma.user.findMany({
      where: { id: { in: performerIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const performerMap = new Map(performers.map((p) => [p.id, p]));

    const enriched = logs.map((l) => ({
      ...l,
      performer: performerMap.get(l.performedBy) || null,
    }));

    return successResponse({ logs: enriched }, { page, limit, total });
  } catch (err) {
    return handleApiError(err);
  }
}