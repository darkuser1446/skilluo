import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getWorkshopLeaderboard } from "@/lib/performance";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN", "MENTOR"]);
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    // 1. Leaderboard & performance
    const leaderboard = await getWorkshopLeaderboard(workshopId);

    // 2. Workshop enrollment statuses & lab assignments
    const enrollments = await prisma.workshopEnrollment.findMany({
      where: { workshopId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            phone: true,
            rollNumber: true,
            branch: true,
            semester: true,
            labStudents: {
              where: { lab: { workshopId } },
              include: { lab: { select: { id: true, name: true } } },
            },
          },
        },
      },
    });

    const candidateSelectionList = leaderboard.map((item) => {
      const enrollment = enrollments.find((e) => e.studentId === item.studentId);
      const student = enrollment?.student;
      const labAssignment = student?.labStudents?.[0];
      return {
        ...item,
        email: student?.email || "",
        phone: student?.phone || item.phone || "",
        rollNumber: student?.rollNumber || item.rollNumber || "",
        branch: student?.branch || item.branch || "",
        semester: student?.semester || item.semester || "",
        college: student?.college || item.college || "",
        labId: labAssignment?.labId || null,
        labName: labAssignment?.lab?.name || "Unassigned",
        status: enrollment?.status || "ENROLLED",
      };
    });

    // 3. Counts
    const counts = {
      totalStudents: candidateSelectionList.length,
      selected: candidateSelectionList.filter((c) => c.status === "SELECTED").length,
      rejected: candidateSelectionList.filter((c) => c.status === "REJECTED").length,
      pending: candidateSelectionList.filter((c) => c.status === "ENROLLED" || c.status === "PENDING").length,
      averageScore: candidateSelectionList.length
        ? Number(
            (
              candidateSelectionList.reduce((acc, curr) => acc + curr.overallScore, 0) /
              candidateSelectionList.length
            ).toFixed(1)
          )
        : 0,
    };

    return successResponse({
      candidates: candidateSelectionList,
      counts,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
