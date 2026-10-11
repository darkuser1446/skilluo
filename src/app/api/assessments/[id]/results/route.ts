import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notify } from "@/lib/notify";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: assessmentId } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        results:
          user.role === "STUDENT"
            ? {
                where: { studentId: user.sub },
                include: { student: { select: { id: true, name: true } } },
              }
            : {
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
                    },
                  },
                },
                orderBy: { score: "desc" },
              },
        _count: { select: { results: true } },
      },
    });

    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    if (user.role === "STUDENT") {
      const myResult = assessment.results[0];
      return successResponse({
        assessmentId,
        title: assessment.title,
        submitted: Boolean(myResult),
        results: myResult
          ? [
              {
                id: myResult.id,
                studentId: myResult.studentId,
                status: myResult.status,
                isLocked: myResult.isLocked,
                violationCount: myResult.violationCount,
                violationReason: myResult.violationReason,
                submittedAt: myResult.submittedAt,
                durationSec: myResult.durationSec,
              },
            ]
          : [],
      });
    }

    const scores = assessment.results.map((r) => r.score);
    const average = scores.length
      ? (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)
      : null;

    return successResponse({
      assessmentId,
      title: assessment.title,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      submittedCount: assessment._count.results,
      averageScore: average ? Number(average) : null,
      results: assessment.results,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

/* Mentor/Admin manually grades text/code answers (PENDING_REVIEW results) */
const GradeSchema = z.object({
  studentId: z.string(),
  score: z.number().min(0),
  feedback: z.string().optional(),
  status: z.enum(["COMPLETED", "PENDING_REVIEW"]).default("COMPLETED"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id: assessmentId } = await params;
    const body = await req.json();
    const data = GradeSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { title: true, totalMarks: true },
    });
    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);
    if (data.score > assessment.totalMarks) {
      return errorResponse(
        `Score cannot exceed total marks (${assessment.totalMarks})`,
        "VALIDATION_ERROR",
        400
      );
    }

    const existing = await prisma.assessmentResult.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: data.studentId } },
    });
    if (!existing) return errorResponse("Result not found", "NOT_FOUND", 404);

    const result = await prisma.assessmentResult.update({
      where: { id: existing.id },
      data: { score: data.score, status: data.status, feedback: data.feedback },
    });

    await notify(
      data.studentId,
      "Test result updated",
      `Your submission for "${assessment.title}" has been reviewed by your mentor.`,
      "RESULT",
      "/student"
    );

    return successResponse({ result });
  } catch (err) {
    return handleApiError(err);
  }
}

const CandidateActionSchema = z.object({
  studentId: z.string().optional(),
  action: z.enum([
    "UNLOCK",
    "RETEST",
    "SELECT_ROUND2",
    "WAITLIST",
    "REJECT",
    "CLEAR_SELECTION",
    "BATCH_SELECT_TOP",
  ]),
  topCount: z.number().int().positive().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["MENTOR", "ADMIN"]);
    const { id: assessmentId } = await params;
    const body = await req.json();
    const { studentId, action, topCount } = CandidateActionSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { id: true, title: true, workshopId: true },
    });
    if (!assessment) return errorResponse("Assessment not found", "NOT_FOUND", 404);

    // ── BATCH SELECT TOP N CANDIDATES (e.g. Top 60 for Super 60) ──
    if (action === "BATCH_SELECT_TOP") {
      const count = topCount || 60;
      const allResults = await prisma.assessmentResult.findMany({
        where: { assessmentId, isLocked: false, status: { not: "DISQUALIFIED" } },
        orderBy: [{ score: "desc" }, { durationSec: "asc" }],
      });

      const selected = allResults.slice(0, count);
      const studentIds = selected.map((r) => r.studentId);

      await prisma.assessmentResult.updateMany({
        where: {
          assessmentId,
          studentId: { in: studentIds },
        },
        data: { status: "SELECTED" },
      });

      // Also update WorkshopEnrollment to SELECTED
      if (assessment.workshopId) {
        await prisma.workshopEnrollment.updateMany({
          where: {
            workshopId: assessment.workshopId,
            studentId: { in: studentIds },
          },
          data: { status: "SELECTED" },
        });
      }

      for (const sid of studentIds) {
        await notify(
          sid,
          "🎉 Selected for Round 2!",
          `Congratulations! You have been officially selected by the Mentor & Admin Committee to advance to Round 2 for "${assessment.title}".`,
          "ASSESSMENT",
          "/student"
        );
      }

      return successResponse({
        message: `Successfully selected top ${selected.length} candidates for Round 2.`,
        selectedCount: selected.length,
      });
    }

    if (!studentId) {
      return errorResponse("studentId is required for this action", "VALIDATION_ERROR", 400);
    }

    const existing = await prisma.assessmentResult.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId } },
    });
    if (!existing) return errorResponse("Candidate test attempt not found", "NOT_FOUND", 404);

    if (action === "RETEST") {
      await prisma.assessmentResult.delete({
        where: { id: existing.id },
      });

      await notify(
        studentId,
        "Retest Approved",
        `A retest attempt has been granted for "${assessment.title}" by an instructor. You may now start your test again.`,
        "ASSESSMENT",
        "/student"
      );

      return successResponse({
        message: "Candidate test attempt cleared. Candidate may now retake the test.",
      });
    } else if (action === "UNLOCK") {
      const updated = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: {
          isLocked: false,
          status: "PENDING_REVIEW",
          unlockedAt: new Date(),
          unlockedBy: actor.sub,
          feedback: `Unlocked by ${actor.name} on ${new Date().toLocaleDateString()}. Original violations: ${existing.violationCount}.`,
        },
      });

      await notify(
        studentId,
        "Test Session Unlocked",
        `Your locked test session for "${assessment.title}" has been reviewed and unlocked by an instructor.`,
        "ASSESSMENT",
        "/student"
      );

      return successResponse({ result: updated, message: "Candidate unlocked successfully." });
    } else if (action === "SELECT_ROUND2") {
      const updated = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: { status: "SELECTED" },
      });

      if (assessment.workshopId) {
        await prisma.workshopEnrollment.upsert({
          where: { workshopId_studentId: { workshopId: assessment.workshopId, studentId } },
          update: { status: "SELECTED" },
          create: { workshopId: assessment.workshopId, studentId, status: "SELECTED" },
        });
      }

      await notify(
        studentId,
        "🎉 Selected for Round 2!",
        `Congratulations! You have been selected to advance to Round 2 of the Super 60 selection process for "${assessment.title}".`,
        "ASSESSMENT",
        "/student"
      );

      return successResponse({ result: updated, message: "Candidate selected for Round 2." });
    } else if (action === "WAITLIST") {
      const updated = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: { status: "WAITLIST" },
      });

      await notify(
        studentId,
        "Round 2 Waitlist Update",
        `Your application for "${assessment.title}" has been placed on the Round 2 Waitlist.`,
        "ASSESSMENT",
        "/student"
      );

      return successResponse({ result: updated, message: "Candidate waitlisted for Round 2." });
    } else if (action === "REJECT") {
      const updated = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: { status: "REJECTED" },
      });

      return successResponse({ result: updated, message: "Candidate marked as not selected." });
    } else if (action === "CLEAR_SELECTION") {
      const updated = await prisma.assessmentResult.update({
        where: { id: existing.id },
        data: { status: "COMPLETED" },
      });

      return successResponse({ result: updated, message: "Candidate selection status reset." });
    }

    return errorResponse("Invalid action", "VALIDATION_ERROR", 400);
  } catch (err: any) {
    return handleApiError(err);
  }
}
