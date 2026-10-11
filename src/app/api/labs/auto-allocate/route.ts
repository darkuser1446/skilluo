import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { notifyMany } from "@/lib/notify";
import { z } from "zod";

const AutoAllocateSchema = z.object({
  workshopId: z.string(),
  studentsPerLab: z.number().int().min(1).max(200).default(15),
  targetGroup: z.enum(["SELECTED", "ALL"]).default("SELECTED"),
  mode: z.enum(["CREATE_AND_ALLOCATE", "ALLOCATE_EXISTING"]).default("CREATE_AND_ALLOCATE"),
  labPrefix: z.string().min(1).max(50).default("Lab"),
  defaultSchedule: z.string().optional(),
  clearExisting: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["ADMIN", "MENTOR"]);
    const body = await req.json();
    const {
      workshopId,
      studentsPerLab,
      targetGroup,
      mode,
      labPrefix,
      defaultSchedule,
      clearExisting,
    } = AutoAllocateSchema.parse(body);

    // Verify workshop exists
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { id: true, name: true },
    });
    if (!workshop) {
      return errorResponse("Workshop not found", "NOT_FOUND", 404);
    }

    // 1. Gather target eligible students
    let studentIds: string[] = [];

    if (targetGroup === "SELECTED") {
      // Find students marked SELECTED in WorkshopEnrollment
      const selectedEnrollments = await prisma.workshopEnrollment.findMany({
        where: { workshopId, status: "SELECTED" },
        select: { studentId: true },
      });
      studentIds = selectedEnrollments.map((e) => e.studentId);

      // If no enrollments explicitly marked SELECTED, check assessment results marked SELECTED
      if (studentIds.length === 0) {
        const selectedResults = await prisma.assessmentResult.findMany({
          where: {
            assessment: { workshopId },
            status: "SELECTED",
          },
          select: { studentId: true },
        });
        studentIds = Array.from(new Set(selectedResults.map((r) => r.studentId)));
      }
    } else {
      // All enrolled students
      const allEnrollments = await prisma.workshopEnrollment.findMany({
        where: { workshopId },
        select: { studentId: true },
      });
      studentIds = allEnrollments.map((e) => e.studentId);
    }

    if (studentIds.length === 0) {
      return errorResponse(
        targetGroup === "SELECTED"
          ? "No candidates currently have 'SELECTED' status in this workshop. Please select candidates in the Selection tab or Test Manager first, or choose 'All Enrolled Students'."
          : "No students are enrolled in this workshop.",
        "VALIDATION_ERROR",
        400
      );
    }

    // 2. Determine target labs
    let targetLabs: { id: string; name: string; capacity: number }[] = [];

    if (mode === "CREATE_AND_ALLOCATE") {
      const numLabsNeeded = Math.max(1, Math.ceil(studentIds.length / studentsPerLab));

      for (let i = 0; i < numLabsNeeded; i++) {
        const letter =
          String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26)) : "");
        const labName = `${labPrefix.trim()} ${letter}`.trim();

        let lab = await prisma.lab.findUnique({
          where: { workshopId_name: { workshopId, name: labName } },
        });

        if (!lab) {
          lab = await prisma.lab.create({
            data: {
              workshopId,
              name: labName,
              capacity: studentsPerLab,
              schedule: defaultSchedule || "Tue/Thu 18:00 - 20:30",
            },
          });
        } else if (lab.capacity !== studentsPerLab) {
          lab = await prisma.lab.update({
            where: { id: lab.id },
            data: { capacity: studentsPerLab },
          });
        }

        targetLabs.push(lab);
      }
    } else {
      // Use existing labs in the workshop
      const existing = await prisma.lab.findMany({
        where: { workshopId },
        orderBy: { name: "asc" },
      });

      if (existing.length === 0) {
        return errorResponse(
          "No existing laboratory tracks found in this workshop. Please use 'Create New Labs' mode.",
          "VALIDATION_ERROR",
          400
        );
      }
      targetLabs = existing;
    }

    // 3. True Random Shuffle using Fisher-Yates
    const shuffled = [...studentIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 4. Distribute evenly across target labs (round-robin)
    const allocationsByLab: Record<string, string[]> = {};
    for (const lab of targetLabs) {
      allocationsByLab[lab.id] = [];
    }

    shuffled.forEach((studentId, idx) => {
      const targetLab = targetLabs[idx % targetLabs.length];
      allocationsByLab[targetLab.id].push(studentId);
    });

    // 5. Clear existing lab assignments if requested
    if (clearExisting) {
      const allWorkshopLabs = await prisma.lab.findMany({
        where: { workshopId },
        select: { id: true },
      });
      const allLabIds = allWorkshopLabs.map((l) => l.id);
      if (allLabIds.length > 0) {
        await prisma.labStudent.deleteMany({
          where: { labId: { in: allLabIds } },
        });
      }
    }

    // 6. Create LabStudent entries
    const entriesToCreate: { labId: string; studentId: string }[] = [];
    for (const lab of targetLabs) {
      for (const sId of allocationsByLab[lab.id]) {
        entriesToCreate.push({ labId: lab.id, studentId: sId });
      }
    }

    if (entriesToCreate.length > 0) {
      await prisma.labStudent.createMany({
        data: entriesToCreate,
        skipDuplicates: true,
      });
    }

    // Ensure all allocated students have WorkshopEnrollment marked as SELECTED
    for (const sId of shuffled) {
      await prisma.workshopEnrollment.upsert({
        where: { workshopId_studentId: { workshopId, studentId: sId } },
        update: { status: "SELECTED" },
        create: { workshopId, studentId: sId, status: "SELECTED" },
      });
    }

    // 7. Notify students of their lab allocation
    for (const lab of targetLabs) {
      const labStudents = allocationsByLab[lab.id];
      if (labStudents.length > 0) {
        await notifyMany(
          labStudents,
          `🏛️ Welcome to ${lab.name}`,
          `You have been placed in ${lab.name} for the ${workshop.name} workshop cohort. Check your student dashboard for your lab track and syllabus!`,
          "INFO",
          "/student"
        );
      }
    }

    // 8. Record in audit log
    await prisma.auditLog.create({
      data: {
        action: "AUTO_ALLOCATE_LABS",
        performedBy: actor.sub,
        details: {
          workshopId,
          totalStudentsAllocated: shuffled.length,
          studentsPerLab,
          labsCount: targetLabs.length,
          labNames: targetLabs.map((l) => l.name),
          mode,
          targetGroup,
        },
      },
    });

    // 9. Fetch updated labs with student details to return
    const updatedLabs = await prisma.lab.findMany({
      where: { workshopId },
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
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                college: true,
                rollNumber: true,
                branch: true,
                semester: true,
              },
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

    return successResponse({
      message: `Successfully allocated ${shuffled.length} students randomly across ${targetLabs.length} laboratories (${studentsPerLab} max students per lab).`,
      totalAllocated: shuffled.length,
      labsCount: targetLabs.length,
      labs: updatedLabs,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
