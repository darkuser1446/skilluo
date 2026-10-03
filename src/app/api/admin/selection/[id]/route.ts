import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const SelectionSchema = z.object({
  workshopId: z.string(),
  status: z.enum(["PENDING", "ENROLLED", "SELECTED", "REJECTED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["ADMIN"]);
    const { id: studentId } = await params;
    const body = await req.json();
    const data = SelectionSchema.parse(body);

    const enrollment = await prisma.workshopEnrollment.upsert({
      where: {
        workshopId_studentId: {
          workshopId: data.workshopId,
          studentId,
        },
      },
      update: {
        status: data.status,
      },
      create: {
        workshopId: data.workshopId,
        studentId,
        status: data.status,
      },
    });

    // Record in audit log
    await prisma.auditLog.create({
      data: {
        action: `STUDENT_STATUS_${data.status}`,
        performedBy: admin.sub,
        targetId: studentId,
        details: { workshopId: data.workshopId, newStatus: data.status },
      },
    });

    return successResponse({ enrollment });
  } catch (err) {
    return handleApiError(err);
  }
}
