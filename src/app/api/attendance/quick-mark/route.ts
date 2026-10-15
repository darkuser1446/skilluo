import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

const QuickMarkSchema = z.object({
  workshopId: z.string(),
  labId: z.string(),
  sessionId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]).default("PRESENT"),
  markAll: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = QuickMarkSchema.parse(body);

    const { workshopId, labId, status, markAll } = data;

    // Verify lab exists
    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      select: { id: true, name: true, workshopId: true },
    });

    if (!lab) {
      return errorResponse("Lab not found", "NOT_FOUND", 404);
    }

    // 1. Resolve or auto-create an active session for this lab
    let sessionId = data.sessionId;
    let session = null;

    if (sessionId) {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { attendanceRecords: true },
      });
    }

    if (!session) {
      // Find today's existing session for this lab
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      session = await prisma.session.findFirst({
        where: {
          workshopId,
          labId,
          date: { gte: startOfDay, lte: endOfDay },
        },
        include: { attendanceRecords: true },
        orderBy: { createdAt: "desc" },
      });
    }

    // If still no session exists today, auto-create one so attendance never fails
    if (!session) {
      const todayFormatted = new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date());

      session = await prisma.session.create({
        data: {
          workshopId,
          labId,
          title: `${lab.name} — Session (${todayFormatted})`,
          topic: "Laboratory Hands-on & Systems Implementation",
          date: new Date(),
          startTime: "09:00",
          endTime: "18:00",
        },
        include: { attendanceRecords: true },
      });
    }

    sessionId = session.id;

    // 2. Mark attendance
    let updatedRecords = [];

    if (markAll) {
      // Fetch all students enrolled in this lab
      const enrolledStudents = await prisma.labStudent.findMany({
        where: { labId },
        select: { studentId: true },
      });

      if (enrolledStudents.length === 0) {
        return errorResponse("No students are currently enrolled in this lab", "BAD_REQUEST", 400);
      }

      // Upsert attendance records for all enrolled students
      updatedRecords = await prisma.$transaction(
        enrolledStudents.map((es) =>
          prisma.attendanceRecord.upsert({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: es.studentId,
              },
            },
            update: {
              status: status || "PRESENT",
              markedBy: user.sub,
            },
            create: {
              sessionId,
              studentId: es.studentId,
              status: status || "PRESENT",
              markedBy: user.sub,
            },
          })
        )
      );

      const freshSessionAll = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          lab: true,
          attendanceRecords: {
            include: {
              student: {
                select: { id: true, name: true, email: true, rollNumber: true, branch: true },
              },
            },
          },
          _count: {
            select: { attendanceRecords: true },
          },
        },
      });

      return successResponse({
        message: `Successfully marked all ${updatedRecords.length} students as ${status}`,
        count: updatedRecords.length,
        sessionId,
        session: freshSessionAll,
        records: updatedRecords,
      });
    }

    // Single student marking
    if (!data.studentId) {
      return errorResponse("studentId is required when markAll is false", "VALIDATION_ERROR", 400);
    }

    const record = await prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: data.studentId,
        },
      },
      update: {
        status: status || "PRESENT",
        markedBy: user.sub,
      },
      create: {
        sessionId,
        studentId: data.studentId,
        status: status || "PRESENT",
        markedBy: user.sub,
      },
    });

    const freshSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        lab: true,
        attendanceRecords: {
          include: {
            student: {
              select: { id: true, name: true, email: true, rollNumber: true, branch: true },
            },
          },
        },
        _count: {
          select: { attendanceRecords: true },
        },
      },
    });

    return successResponse({
      message: `Successfully marked student as ${status}`,
      count: 1,
      sessionId,
      session: freshSession,
      record,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
