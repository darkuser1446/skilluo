import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const MarkAttendanceSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE"]),
    })
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const { id: sessionId } = await params;
    const body = await req.json();
    const { records } = MarkAttendanceSchema.parse(body);

    const results = [];
    for (const r of records) {
      const record = await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: r.studentId,
          },
        },
        update: {
          status: r.status,
          markedBy: user.sub,
        },
        create: {
          sessionId,
          studentId: r.studentId,
          status: r.status,
          markedBy: user.sub,
        },
      });
      results.push(record);
    }

    return successResponse({ markedCount: results.length, records: results });
  } catch (err) {
    return handleApiError(err);
  }
}
