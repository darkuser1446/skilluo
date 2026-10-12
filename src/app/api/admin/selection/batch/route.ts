import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const BatchSelectionSchema = z.object({
  workshopId: z.string(),
  status: z.enum(["PENDING", "ENROLLED", "SELECTED", "REJECTED"]).default("SELECTED"),
  count: z.number().int().min(1).max(500).optional(),
  studentIds: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/selection/batch
 * Batch select students (e.g. Top 100 by test score or specific array of IDs).
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const body = await req.json();
    const data = BatchSelectionSchema.parse(body);

    let targetIds: string[] = [];

    if (data.studentIds && data.studentIds.length > 0) {
      targetIds = data.studentIds;
    } else if (data.count) {
      // Find top candidates by assessment score
      const results = await prisma.assessmentResult.findMany({
        where: { assessment: { workshopId: data.workshopId } },
        select: { studentId: true },
        orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
        take: data.count,
      });
      targetIds = results.map((r) => r.studentId);

      // If fewer test results than count, fill up with enrollments
      if (targetIds.length < data.count) {
        const enrollments = await prisma.workshopEnrollment.findMany({
          where: { workshopId: data.workshopId },
          select: { studentId: true },
          orderBy: { appliedAt: "asc" },
          take: data.count,
        });
        const combined = Array.from(new Set([...targetIds, ...enrollments.map((e) => e.studentId)]));
        targetIds = combined.slice(0, data.count);
      }
    } else {
      return errorResponse("Either studentIds or count must be provided", "VALIDATION_ERROR", 400);
    }

    if (targetIds.length === 0) {
      return errorResponse("No eligible candidates found for batch selection", "NOT_FOUND", 404);
    }

    // Update WorkshopEnrollment for all target IDs
    for (const studentId of targetIds) {
      await prisma.workshopEnrollment.upsert({
        where: {
          workshopId_studentId: {
            workshopId: data.workshopId,
            studentId,
          },
        },
        update: { status: data.status },
        create: {
          workshopId: data.workshopId,
          studentId,
          status: data.status,
        },
      });
    }

    // Record in audit log
    await prisma.auditLog.create({
      data: {
        action: `BATCH_STUDENT_STATUS_${data.status}`,
        performedBy: admin.sub,
        details: {
          workshopId: data.workshopId,
          status: data.status,
          count: targetIds.length,
          studentIds: targetIds,
        },
      },
    });

    return successResponse({
      message: `Successfully marked ${targetIds.length} candidates as ${data.status}.`,
      count: targetIds.length,
      studentIds: targetIds,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
