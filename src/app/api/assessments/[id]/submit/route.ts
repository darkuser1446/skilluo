import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import { notifyMany, labMentorIds } from "@/lib/notify";

const AssessmentSubmitSchema = z.object({
  answers: z.record(z.string(), z.string()), // questionId -> selected answer / code / text
  durationSec: z.number().int().nonnegative().optional(), // time taken by the student
  violationReason: z.string().optional(),
  warningCount: z.number().int().nonnegative().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (user.role !== "STUDENT") {
      return errorResponse("Only students can submit test answers", "FORBIDDEN", 403);
    }
    const { id: assessmentId } = await params;
    const body = await req.json();
    const { answers, durationSec, violationReason, warningCount } = AssessmentSubmitSchema.parse(body);

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });

    if (!assessment) {
      return errorResponse("Assessment not found", "NOT_FOUND", 404);
    }

    // ── Target Lab Validation ──
    if (prisma.labStudent?.findFirst && ((assessment.targetLabIds && assessment.targetLabIds.length > 0) || assessment.labId)) {
      try {
        const studentEnrollment = await prisma.labStudent.findFirst({
          where: { studentId: user.sub },
          select: { labId: true },
        });
        const sLabId = studentEnrollment?.labId;
        if (sLabId) {
          const isTargeted =
            (assessment.labId && assessment.labId === sLabId) ||
            (assessment.targetLabIds && assessment.targetLabIds.includes(sLabId));
          if (!isTargeted) {
            return errorResponse("This test is not assigned to your lab", "FORBIDDEN", 403);
          }
        }
      } catch {
        // Safe fallback in test environments
      }
    }

    // ── Target Audience Validation ──
    if (assessment.targetAudience === "NON_SELECTED") {
      try {
        if (prisma.workshopEnrollment?.findFirst) {
          const enr = await prisma.workshopEnrollment.findFirst({
            where: { workshopId: assessment.workshopId, studentId: user.sub },
            select: { status: true },
          });
          if (enr?.status === "SELECTED") {
            return errorResponse(
              "This screening test is for non-selected candidates. You have already been selected for laboratory tracks.",
              "FORBIDDEN",
              403
            );
          }
        }
        if (prisma.labStudent?.findFirst) {
          const ls = await prisma.labStudent.findFirst({
            where: { studentId: user.sub },
            select: { id: true },
          });
          if (ls) {
            return errorResponse(
              "This screening test is for non-selected candidates. You have already been allocated to a laboratory track.",
              "FORBIDDEN",
              403
            );
          }
        }
      } catch {}
    }

    // ── Availability window (server-side; client timer is not trusted) ──
    const now = Date.now();
    const startsAt = new Date(assessment.startsAt).getTime();
    const endsAt = new Date(assessment.endsAt).getTime();
    if (now < startsAt) {
      return errorResponse("This test has not started yet", "TEST_NOT_STARTED", 403);
    }
    if (now > endsAt + 60_000) {
      // 60s grace for network latency on auto-submit
      return errorResponse("The time window for this test has closed", "TEST_EXPIRED", 403);
    }

    // ── Attempt restriction: one attempt per student (upsert would allow score farming) ──
    const existing = await prisma.assessmentResult.findUnique({
      where: {
        assessmentId_studentId: { assessmentId, studentId: user.sub },
      },
    });
    if (existing) {
      return errorResponse(
        "You have already submitted this test. Only one attempt is allowed.",
        "ALREADY_SUBMITTED",
        409
      );
    }

    // ── Score answers automatically ──
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    let hasManualQuestions = false;

    for (const q of assessment.questions) {
      const selected = answers[q.id];
      const isChoice = Array.isArray(q.options) && (q.options as string[]).length > 0;

      if (!selected || !selected.trim()) {
        unansweredCount += 1;
        continue;
      }

      if (!isChoice) {
        // Text / code answer — requires manual mentor review
        hasManualQuestions = true;
        continue;
      }

      if (q.correctAnswer && selected.trim() === String(q.correctAnswer).trim()) {
        totalScore += q.marks;
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    }

    const defaultViolations = assessment.type === "ASSIGNMENT" ? 0 : 3;
    const isAntiCheat = (assessment.allowedViolations ?? defaultViolations) > 0;
    const isDisqualified = isAntiCheat && Boolean(violationReason);
    const status = isDisqualified
      ? "DISQUALIFIED"
      : hasManualQuestions
      ? "PENDING_REVIEW"
      : "COMPLETED";

    const feedback = isDisqualified
      ? `Test locked out due to proctoring violation: ${violationReason}. (Total violations recorded: ${warningCount ?? 0})`
      : null;

    const finalScore = isDisqualified ? 0 : totalScore;

    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId,
        studentId: user.sub,
        score: finalScore,
        status,
        isLocked: isDisqualified,
        violationCount: warningCount ?? (isDisqualified ? 1 : 0),
        violationReason: violationReason || null,
        answers: {
          ...answers,
          _proctoring: isDisqualified
            ? {
                violationReason,
                warningCount: warningCount ?? 0,
                flaggedAt: new Date().toISOString(),
                disqualified: true,
                locked: true,
              }
            : null,
        } as object,
        correctCount,
        incorrectCount,
        unansweredCount,
        durationSec: durationSec ?? null,
        feedback,
      },
    });

    // Notify mentors AND admins immediately when a student is disqualified for proctoring violations
    if (isDisqualified) {
      const [mentorIds, admins] = await Promise.all([
        labMentorIds(assessment.workshopId, assessment.labId),
        prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } }),
      ]);
      const notifyIds = Array.from(new Set([...mentorIds, ...admins.map((a) => a.id)]));
      await notifyMany(
        notifyIds,
        `🚨 Proctoring Violation: ${user.name}`,
        `Student ${user.name} was disqualified during assessment "${assessment.title}". Reason: ${violationReason}`,
        "ASSESSMENT",
        "/admin"
      );
    } else if (hasManualQuestions) {
      // Normal review notification for mentors
      const mentorIds = await labMentorIds(assessment.workshopId, assessment.labId);
      await notifyMany(
        mentorIds,
        "Test answers await review",
        `${user.name} submitted "${assessment.title}" — manual review required.`,
        "RESULT",
        "/mentor"
      );
    }

    return successResponse({
      submitted: true,
      assessmentId,
      assessmentTitle: assessment.title,
      score: result.score,
      totalMarks: assessment.totalMarks,
      correctCount: result.correctCount ?? 0,
      incorrectCount: result.incorrectCount ?? 0,
      unansweredCount: result.unansweredCount ?? 0,
      durationSec: durationSec ?? null,
      answeredCount: assessment.questions.length - unansweredCount,
      totalQuestions: assessment.questions.length,
      submittedAt: result.submittedAt,
      status: result.status,
      isLocked: isDisqualified,
      disqualified: isDisqualified,
      violationReason: violationReason || null,
      message:
        "Assessment submitted successfully. Your score has been calculated.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
