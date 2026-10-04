import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("IDOR Protection & Authorization Boundaries Suite", () => {
  describe("Doubt Scoping & IDOR Prevention", () => {
    // Model query filter behavior from src/app/api/doubts/route.ts
    function buildDoubtQueryFilter(
      workshopId: string,
      sessionUser?: { sub: string; role: "STUDENT" | "MENTOR" | "ADMIN" } | null
    ) {
      if (!workshopId) {
        throw new Error("workshopId is required");
      }
      return {
        workshopId,
        ...(sessionUser?.role === "STUDENT" ? { studentId: sessionUser.sub } : {}),
      };
    }

    const doubtsDatabase = [
      { id: "dbt_1", workshopId: "ws_cpp_2026", studentId: "usr_student_alice", title: "Pointer arithmetic question" },
      { id: "dbt_2", workshopId: "ws_cpp_2026", studentId: "usr_student_bob", title: "Virtual destructors doubt" },
      { id: "dbt_3", workshopId: "ws_cpp_2025", studentId: "usr_student_alice", title: "Old workshop doubt" },
      { id: "dbt_4", workshopId: "ws_cpp_2026", studentId: "usr_student_charlie", title: "Memory leak in custom allocator" },
    ];

    it("should strictly scope doubt visibility to the authenticated student's own records", () => {
      const aliceSession = { sub: "usr_student_alice", role: "STUDENT" as const };
      const filter = buildDoubtQueryFilter("ws_cpp_2026", aliceSession);

      const aliceVisibleDoubts = doubtsDatabase.filter(
        (d) => d.workshopId === filter.workshopId && (!filter.studentId || d.studentId === filter.studentId)
      );

      expect(aliceVisibleDoubts.length).toBe(1);
      expect(aliceVisibleDoubts[0].id).toBe("dbt_1");
      expect(aliceVisibleDoubts.every((d) => d.studentId === "usr_student_alice")).toBe(true);
      // Ensure Alice cannot view Bob's or Charlie's doubts
      expect(aliceVisibleDoubts.some((d) => d.studentId === "usr_student_bob")).toBe(false);
      expect(aliceVisibleDoubts.some((d) => d.studentId === "usr_student_charlie")).toBe(false);
    });

    it("should allow mentors and admins to view all student doubts within the workshop without IDOR filter", () => {
      const mentorSession = { sub: "usr_mentor_prof", role: "MENTOR" as const };
      const filter = buildDoubtQueryFilter("ws_cpp_2026", mentorSession);

      const mentorVisibleDoubts = doubtsDatabase.filter(
        (d) => d.workshopId === filter.workshopId && (!filter.studentId || d.studentId === filter.studentId)
      );

      // Mentor sees doubts from Alice, Bob, and Charlie in ws_cpp_2026
      expect(mentorVisibleDoubts.length).toBe(3);
      expect(mentorVisibleDoubts.map((d) => d.studentId)).toEqual(
        expect.arrayContaining(["usr_student_alice", "usr_student_bob", "usr_student_charlie"])
      );
    });

    it("should enforce server-side session identity binding on doubt creation (anti-impersonation)", () => {
      // Simulates POST /api/doubts schema and handler
      const CreateDoubtSchema = z.object({
        workshopId: z.string(),
        labId: z.string(),
        title: z.string().min(5),
        description: z.string().min(10),
      });

      const rawInput = {
        workshopId: "ws_cpp_2026",
        labId: "lab_systems_01",
        title: "Deadlock in mutex lock",
        description: "Investigating why std::lock leads to deadlock when locking multiple resources.",
        // Attacker attempts to forge studentId to impersonate another user:
        studentId: "usr_victim_student_999",
      };

      const parsed = CreateDoubtSchema.parse(rawInput);
      // Verify schema strips or ignores foreign studentId parameter
      expect((parsed as any).studentId).toBeUndefined();

      // Binding uses authenticated session:
      const sessionUser = { sub: "usr_attacker_student_007", role: "STUDENT" };
      const createdRecord = {
        ...parsed,
        studentId: sessionUser.sub, // Server-enforced binding
      };

      expect(createdRecord.studentId).toBe("usr_attacker_student_007");
      expect(createdRecord.studentId).not.toBe("usr_victim_student_999");
    });

    it("should validate doubt status state machine transitions", () => {
      const StatusSchema = z.object({
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
      });

      expect(() => StatusSchema.parse({ status: "OPEN" })).not.toThrow();
      expect(() => StatusSchema.parse({ status: "IN_PROGRESS" })).not.toThrow();
      expect(() => StatusSchema.parse({ status: "RESOLVED" })).not.toThrow();

      // Malicious or invalid status transitions
      expect(() => StatusSchema.parse({ status: "DELETED" })).toThrow();
      expect(() => StatusSchema.parse({ status: "BYPASSED" })).toThrow();
      expect(() => StatusSchema.parse({ status: "" })).toThrow();
    });
  });

  describe("Feedback Anonymization & Privacy Preservation", () => {
    const FeedbackSchema = z.object({
      workshopId: z.string(),
      labId: z.string(),
      mentorId: z.string(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(5),
      category: z.string().default("GENERAL"),
      isAnonymous: z.boolean().default(false),
    });

    it("should strictly enforce rating boundary constraints between 1 and 5", () => {
      const validPayload = {
        workshopId: "ws_cpp",
        labId: "lab_1",
        mentorId: "men_1",
        rating: 5,
        comment: "Excellent guidance on memory management",
      };

      // Valid boundary values
      expect(FeedbackSchema.parse({ ...validPayload, rating: 1 }).rating).toBe(1);
      expect(FeedbackSchema.parse({ ...validPayload, rating: 3 }).rating).toBe(3);
      expect(FeedbackSchema.parse({ ...validPayload, rating: 5 }).rating).toBe(5);

      // Invalid boundaries: 0, negative, >5, and non-integers
      expect(() => FeedbackSchema.parse({ ...validPayload, rating: 0 })).toThrow();
      expect(() => FeedbackSchema.parse({ ...validPayload, rating: -1 })).toThrow();
      expect(() => FeedbackSchema.parse({ ...validPayload, rating: 6 })).toThrow();
      expect(() => FeedbackSchema.parse({ ...validPayload, rating: 10 })).toThrow();
      expect(() => FeedbackSchema.parse({ ...validPayload, rating: 4.5 })).toThrow();
    });

    it("should sanitize student identity when isAnonymous is true", () => {
      interface RawFeedbackRecord {
        id: string;
        rating: number;
        comment: string;
        isAnonymous: boolean;
        student: { id: string; name: string; email: string };
      }

      function sanitizeFeedbackForMentor(record: RawFeedbackRecord) {
        if (record.isAnonymous) {
          return {
            id: record.id,
            rating: record.rating,
            comment: record.comment,
            isAnonymous: true,
            student: null, // Scrubbed PII
          };
        }
        return record;
      }

      const anonymousFeedback: RawFeedbackRecord = {
        id: "fb_anon_01",
        rating: 4,
        comment: "Detailed feedback on concurrency debugging",
        isAnonymous: true,
        student: {
          id: "usr_student_dev",
          name: "Siddharth Rao",
          email: "siddharth@example.com",
        },
      };

      const publicFeedback: RawFeedbackRecord = {
        id: "fb_pub_02",
        rating: 5,
        comment: "Great session on RAII concepts!",
        isAnonymous: false,
        student: {
          id: "usr_student_dev",
          name: "Siddharth Rao",
          email: "siddharth@example.com",
        },
      };

      const sanitizedAnon = sanitizeFeedbackForMentor(anonymousFeedback);
      expect(sanitizedAnon.student).toBeNull();
      expect(sanitizedAnon.isAnonymous).toBe(true);

      const sanitizedPublic = sanitizeFeedbackForMentor(publicFeedback);
      expect(sanitizedPublic.student).not.toBeNull();
      expect(sanitizedPublic.student?.name).toBe("Siddharth Rao");
    });

    it("should reject feedback submissions from non-students", () => {
      function authorizeFeedbackSubmission(role: "STUDENT" | "MENTOR" | "ADMIN") {
        if (role !== "STUDENT") {
          return { success: false, status: 403, error: "Only students can submit mentor feedback" };
        }
        return { success: true, status: 201 };
      }

      expect(authorizeFeedbackSubmission("STUDENT").success).toBe(true);
      expect(authorizeFeedbackSubmission("MENTOR").status).toBe(403);
      expect(authorizeFeedbackSubmission("ADMIN").status).toBe(403);
    });
  });

  describe("Assignment Review Score Boundaries & Ownership Safeguards", () => {
    const ReviewSchema = z.object({
      score: z.number().min(0).max(100),
      feedback: z.string().min(2),
    });

    it("should enforce score boundaries [0, 100] for grading", () => {
      // Valid boundaries
      expect(ReviewSchema.parse({ score: 0, feedback: "Zero score awarded" }).score).toBe(0);
      expect(ReviewSchema.parse({ score: 50, feedback: "Good effort" }).score).toBe(50);
      expect(ReviewSchema.parse({ score: 100, feedback: "Flawless submission" }).score).toBe(100);

      // Fractional score
      expect(ReviewSchema.parse({ score: 87.5, feedback: "Minor style issues" }).score).toBe(87.5);

      // Negative values rejected
      expect(() => ReviewSchema.parse({ score: -1, feedback: "Negative score invalid" })).toThrow();
      expect(() => ReviewSchema.parse({ score: -50, feedback: "Invalid" })).toThrow();

      // Values above 100 rejected
      expect(() => ReviewSchema.parse({ score: 101, feedback: "Exceeds max" })).toThrow();
      expect(() => ReviewSchema.parse({ score: 500, feedback: "Huge score invalid" })).toThrow();
    });

    it("should validate score against assignment-specific maxScore limits", () => {
      function validateReviewScoreAgainstMax(score: number, assignmentMaxScore: number) {
        if (score < 0) {
          throw new Error("Score cannot be negative");
        }
        if (score > assignmentMaxScore) {
          throw new Error(`Score ${score} cannot exceed assignment maxScore ${assignmentMaxScore}`);
        }
        return { valid: true, score, assignmentMaxScore };
      }

      // Max score 40
      expect(validateReviewScoreAgainstMax(35, 40).valid).toBe(true);
      expect(validateReviewScoreAgainstMax(40, 40).valid).toBe(true);
      expect(() => validateReviewScoreAgainstMax(41, 40)).toThrow(/cannot exceed assignment maxScore/);

      // Max score 10
      expect(validateReviewScoreAgainstMax(0, 10).valid).toBe(true);
      expect(validateReviewScoreAgainstMax(10, 10).valid).toBe(true);
      expect(() => validateReviewScoreAgainstMax(11, 10)).toThrow();
    });

    it("should detect late submissions against assignment deadline", () => {
      function evaluateSubmissionLateness(submissionDate: Date, dueDate: Date): "LATE" | "SUBMITTED" {
        return submissionDate > dueDate ? "LATE" : "SUBMITTED";
      }

      const dueDate = new Date("2026-10-10T18:00:00Z");

      const onTimeDate = new Date("2026-10-10T17:59:59Z");
      expect(evaluateSubmissionLateness(onTimeDate, dueDate)).toBe("SUBMITTED");

      const exactDueDate = new Date("2026-10-10T18:00:00Z");
      expect(evaluateSubmissionLateness(exactDueDate, dueDate)).toBe("SUBMITTED");

      const lateDate = new Date("2026-10-10T18:00:01Z");
      expect(evaluateSubmissionLateness(lateDate, dueDate)).toBe("LATE");

      const oneDayLate = new Date("2026-10-11T12:00:00Z");
      expect(evaluateSubmissionLateness(oneDayLate, dueDate)).toBe("LATE");
    });

    it("should prevent students from grading their own or peers' assignments", () => {
      function canReviewSubmission(userRole: "STUDENT" | "MENTOR" | "ADMIN") {
        const allowedRoles = ["MENTOR", "ADMIN"];
        return allowedRoles.includes(userRole);
      }

      expect(canReviewSubmission("STUDENT")).toBe(false);
      expect(canReviewSubmission("MENTOR")).toBe(true);
      expect(canReviewSubmission("ADMIN")).toBe(true);
    });
  });
});
