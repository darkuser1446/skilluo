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

    const isDisqualified = Boolean(violationReason);
    const status = isDisqualified
      ? "DISQUALIFIED"
      : hasManualQuestions
      ? "PENDING_REVIEW"
      : "COMPLETED";

    const feedback = isDisqualified
      ? `Auto-submitted due to proctoring violation: ${violationReason}. (Total violations recorded: ${warningCount ?? 0})`
      : null;

    const finalScore = isDisqualified ? 0 : totalScore;

    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId,
        studentId: user.sub,
        score: finalScore,
        status,
        answers: {
          ...answers,
          _proctoring: isDisqualified
            ? {
                violationReason,
                warningCount: warningCount ?? 0,
                flaggedAt: new Date().toISOString(),
                disqualified: true,
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
      result,
      score: finalScore,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks ?? assessment.totalMarks * 0.6,
      correctCount,
      incorrectCount,
      unansweredCount,
      durationSec: durationSec ?? null,
      status,
      disqualified: isDisqualified,
      violationReason: violationReason || null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
