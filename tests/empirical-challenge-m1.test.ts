import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Using vi.hoisted for variables accessed inside vi.mock factories
const { mockPrisma, sessionState } = vi.hoisted(() => {
  return {
    mockPrisma: {
      feedback: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      assignment: {
        findUnique: vi.fn(),
      },
      submission: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      exercise: {
        findUnique: vi.fn(),
      },
      exerciseSubmission: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      workshop: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      lab: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(),
      },
      doubt: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      session: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    },
    sessionState: {
      user: null as { sub: string; email: string; role: "STUDENT" | "MENTOR" | "ADMIN"; name: string } | null,
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(async () => sessionState.user),
  requireAuth: vi.fn(async () => {
    if (!sessionState.user) {
      const { ApiError } = await import("@/utils/errors");
      throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
    }
    return sessionState.user;
  }),
  requireRole: vi.fn(async (allowedRoles: string[]) => {
    if (!sessionState.user) {
      const { ApiError } = await import("@/utils/errors");
      throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
    }
    if (!allowedRoles.includes(sessionState.user.role)) {
      const { ApiError } = await import("@/utils/errors");
      throw new ApiError("Forbidden", 403, "FORBIDDEN");
    }
    return sessionState.user;
  }),
}));

vi.mock("@/lib/notify", () => ({
  notify: vi.fn(async () => {}),
}));

// Import actual route handlers
import { GET as getFeedback } from "@/app/api/feedback/route";
import { GET as getLabFeedback } from "@/app/api/feedback/lab/[labId]/route";
import { GET as getMentorFeedback } from "@/app/api/feedback/mentor/[mentorId]/route";
import { POST as submitAssignment } from "@/app/api/assignments/[id]/submissions/route";
import { POST as submitExercise } from "@/app/api/exercises/[id]/submit/route";
import { PUT as reviewSubmission } from "@/app/api/submissions/[id]/review/route";
import { GET as getWorkshopById } from "@/app/api/workshops/[id]/route";
import { GET as getLabById } from "@/app/api/labs/[id]/route";
import { GET as getLabs } from "@/app/api/labs/route";
import { GET as getDoubts, POST as createDoubt } from "@/app/api/doubts/route";
import { GET as getSessions, POST as createSession } from "@/app/api/attendance/sessions/route";

describe("Empirical Challenge: Milestone 1 Security & Mutation Integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionState.user = null;
  });

  // --------------------------------------------------------------------------
  // Area 1: Feedback Sanitization when isAnonymous === true & requireAuth
  // --------------------------------------------------------------------------
  describe("Area 1: Feedback Student Identity Sanitization (isAnonymous === true) and Auth Enforcement", () => {
    const rawAnonymousFeedback = {
      id: "fb_anon_1",
      workshopId: "ws_cpp_2026",
      labId: "lab_sys_1",
      studentId: "usr_student_secret_alice",
      mentorId: "usr_mentor_bob",
      rating: 2,
      comment: "Mentor was unresponsive during lab session",
      category: "MENTORSHIP",
      isAnonymous: true,
      createdAt: new Date("2026-10-01T10:00:00Z"),
      student: {
        id: "usr_student_secret_alice",
        name: "Alice Smith",
      },
      mentor: {
        id: "usr_mentor_bob",
        name: "Bob Mentor",
      },
      lab: {
        id: "lab_sys_1",
        name: "Systems Lab A",
      },
    };

    const rawNonAnonymousFeedback = {
      id: "fb_public_1",
      workshopId: "ws_cpp_2026",
      labId: "lab_sys_1",
      studentId: "usr_student_secret_alice",
      mentorId: "usr_mentor_bob",
      rating: 5,
      comment: "Outstanding mentorship session",
      category: "MENTORSHIP",
      isAnonymous: false,
      createdAt: new Date("2026-10-01T11:00:00Z"),
      student: {
        id: "usr_student_secret_alice",
        name: "Alice Smith",
      },
      mentor: {
        id: "usr_mentor_bob",
        name: "Bob Mentor",
      },
      lab: {
        id: "lab_sys_1",
        name: "Systems Lab A",
      },
    };

    it("rejects unauthenticated callers on GET /api/feedback with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/feedback?workshopId=ws_cpp_2026");
      const res = await getFeedback(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("sanitizes both studentId AND student object in GET /api/feedback when isAnonymous is true", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.feedback.findMany.mockResolvedValue([rawAnonymousFeedback]);

      const req = new NextRequest("http://localhost:3000/api/feedback?workshopId=ws_cpp_2026");
      const res = await getFeedback(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      const fb = json.data.feedbacks[0];

      // Empirical verification: Both nested student AND root scalar studentId must be ANONYMOUS
      expect(fb.student.name).toBe("Anonymous Student");
      expect(fb.student.id).toBe("ANONYMOUS");
      expect(fb.studentId).toBe("ANONYMOUS");
      expect(fb.studentId).not.toBe("usr_student_secret_alice");
    });

    it("preserves studentId and student object in GET /api/feedback when isAnonymous is false", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.feedback.findMany.mockResolvedValue([rawNonAnonymousFeedback]);

      const req = new NextRequest("http://localhost:3000/api/feedback?workshopId=ws_cpp_2026");
      const res = await getFeedback(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      const fb = json.data.feedbacks[0];

      expect(fb.student.name).toBe("Alice Smith");
      expect(fb.student.id).toBe("usr_student_secret_alice");
      expect(fb.studentId).toBe("usr_student_secret_alice");
    });

    it("sanitizes both studentId AND student object in GET /api/feedback/lab/[labId] when isAnonymous is true", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.feedback.findMany.mockResolvedValue([rawAnonymousFeedback]);

      const req = new NextRequest("http://localhost:3000/api/feedback/lab/lab_sys_1");
      const res = await getLabFeedback(req, { params: Promise.resolve({ labId: "lab_sys_1" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      const fb = json.data.feedbacks[0];

      expect(fb.student.id).toBe("ANONYMOUS");
      expect(fb.student.name).toBe("Anonymous Student");
      expect(fb.studentId).toBe("ANONYMOUS");
      expect(fb.studentId).not.toBe("usr_student_secret_alice");
    });

    it("sanitizes both studentId AND student object in GET /api/feedback/mentor/[mentorId] when isAnonymous is true", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.feedback.findMany.mockResolvedValue([rawAnonymousFeedback]);

      const req = new NextRequest("http://localhost:3000/api/feedback/mentor/usr_mentor_bob");
      const res = await getMentorFeedback(req, { params: Promise.resolve({ mentorId: "usr_mentor_bob" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      const fb = json.data.feedbacks[0];

      expect(fb.student.id).toBe("ANONYMOUS");
      expect(fb.student.name).toBe("Anonymous Student");
      expect(fb.studentId).toBe("ANONYMOUS");
      expect(fb.studentId).not.toBe("usr_student_secret_alice");
    });

    it("preserves student identity for ADMIN callers across feedback endpoints for audit", async () => {
      sessionState.user = {
        sub: "usr_admin_1",
        email: "admin@super60.org",
        role: "ADMIN",
        name: "Admin User",
      };

      mockPrisma.feedback.findMany.mockResolvedValue([rawAnonymousFeedback]);

      const req = new NextRequest("http://localhost:3000/api/feedback?workshopId=ws_cpp_2026");
      const res = await getFeedback(req);
      const json = await res.json();
      const fb = json.data.feedbacks[0];

      // Admin can see real identity for moderation/audit
      expect(fb.student.name).toBe("Alice Smith");
      expect(fb.student.id).toBe("usr_student_secret_alice");
      expect(fb.studentId).toBe("usr_student_secret_alice");
    });
  });

  // --------------------------------------------------------------------------
  // Area 2: Exercise Resubmission Guard (COMPLETED, REVIEWED, score !== null)
  // --------------------------------------------------------------------------
  describe("Area 2: Exercise Resubmission Immutability Guards", () => {
    beforeEach(() => {
      sessionState.user = {
        sub: "usr_student_alice",
        email: "alice@super60.org",
        role: "STUDENT",
        name: "Alice Smith",
      };
    });

    it("blocks exercise resubmission with 400 when existing submission has status === 'COMPLETED'", async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: "ex_1" });
      mockPrisma.exerciseSubmission.findUnique.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "COMPLETED",
        score: null,
      });

      const req = new NextRequest("http://localhost:3000/api/exercises/ex_1/submit", {
        method: "POST",
        body: JSON.stringify({ code: "int main() { return 0; }", language: "cpp" }),
      });

      const res = await submitExercise(req, { params: Promise.resolve({ id: "ex_1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Cannot resubmit an exercise that has already been completed or evaluated");
      expect(mockPrisma.exerciseSubmission.upsert).not.toHaveBeenCalled();
    });

    it("blocks exercise resubmission with 400 when existing submission has status === 'REVIEWED'", async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: "ex_1" });
      mockPrisma.exerciseSubmission.findUnique.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "REVIEWED",
        score: null,
      });

      const req = new NextRequest("http://localhost:3000/api/exercises/ex_1/submit", {
        method: "POST",
        body: JSON.stringify({ code: "void evilOverwrite() {}", language: "cpp" }),
      });

      const res = await submitExercise(req, { params: Promise.resolve({ id: "ex_1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Cannot resubmit an exercise that has already been completed or evaluated");
      expect(mockPrisma.exerciseSubmission.upsert).not.toHaveBeenCalled();
    });

    it("blocks exercise resubmission with 400 when existing submission has score !== null (already evaluated)", async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: "ex_1" });
      mockPrisma.exerciseSubmission.findUnique.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "SUBMITTED",
        score: 95,
      });

      const req = new NextRequest("http://localhost:3000/api/exercises/ex_1/submit", {
        method: "POST",
        body: JSON.stringify({ code: "void gradedOverwrite() {}", language: "cpp" }),
      });

      const res = await submitExercise(req, { params: Promise.resolve({ id: "ex_1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Cannot resubmit an exercise that has already been completed or evaluated");
      expect(mockPrisma.exerciseSubmission.upsert).not.toHaveBeenCalled();
    });

    it("blocks exercise resubmission with 400 when existing submission has score === 0 (boundary check)", async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: "ex_1" });
      mockPrisma.exerciseSubmission.findUnique.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "SUBMITTED",
        score: 0,
      });

      const req = new NextRequest("http://localhost:3000/api/exercises/ex_1/submit", {
        method: "POST",
        body: JSON.stringify({ code: "void retryZeroScore() {}", language: "cpp" }),
      });

      const res = await submitExercise(req, { params: Promise.resolve({ id: "ex_1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Cannot resubmit an exercise that has already been completed or evaluated");
      expect(mockPrisma.exerciseSubmission.upsert).not.toHaveBeenCalled();
    });

    it("permits exercise resubmission when existing submission is SUBMITTED with score === null", async () => {
      mockPrisma.exercise.findUnique.mockResolvedValue({ id: "ex_1" });
      mockPrisma.exerciseSubmission.findUnique.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "SUBMITTED",
        score: null,
      });

      mockPrisma.exerciseSubmission.upsert.mockResolvedValue({
        id: "ex_sub_1",
        exerciseId: "ex_1",
        studentId: "usr_student_alice",
        status: "SUBMITTED",
        code: "int fixed() { return 1; }",
        language: "cpp",
      });

      const req = new NextRequest("http://localhost:3000/api/exercises/ex_1/submit", {
        method: "POST",
        body: JSON.stringify({ code: "int fixed() { return 1; }", language: "cpp" }),
      });

      const res = await submitExercise(req, { params: Promise.resolve({ id: "ex_1" }) });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockPrisma.exerciseSubmission.upsert).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // Area 3: Collection Endpoint /api/labs Authorization & PII Stripping
  // --------------------------------------------------------------------------
  describe("Area 3: Collection Endpoint /api/labs Authorization & PII Stripping", () => {
    const mockLabsCollectionData = [
      {
        id: "lab_sys_1",
        workshopId: "ws_sys_2026",
        name: "Operating Systems Lab",
        schedule: "Mon/Wed 10am",
        capacity: 30,
        mentors: [
          {
            mentor: { id: "men_1", name: "Prof. Linus", email: "linus@super60.org", mentorProfile: null },
          },
        ],
        students: [
          {
            id: "ls_1",
            labId: "lab_sys_1",
            studentId: "stu_1",
            student: {
              id: "stu_1",
              name: "Student One",
              email: "student1@private.edu",
              college: "IIT Bombay",
            },
          },
          {
            id: "ls_2",
            labId: "lab_sys_1",
            studentId: "stu_2",
            student: {
              id: "stu_2",
              name: "Student Two",
              email: "student2@private.edu",
              college: "IIT Delhi",
            },
          },
        ],
        _count: { students: 2, assignments: 1, notes: 0, sessions: 2 },
      },
    ];

    it("rejects unauthenticated callers on GET /api/labs with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/labs?workshopId=ws_sys_2026");
      const res = await getLabs(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("strips student email and college PII in GET /api/labs for STUDENT role", async () => {
      sessionState.user = {
        sub: "stu_1",
        email: "student1@private.edu",
        role: "STUDENT",
        name: "Student One",
      };

      mockPrisma.lab.findMany.mockResolvedValue(mockLabsCollectionData);

      const req = new NextRequest("http://localhost:3000/api/labs?workshopId=ws_sys_2026");
      const res = await getLabs(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      const lab = json.data.labs[0];
      const student1 = lab.students[0].student;
      const student2 = lab.students[1].student;

      // PII must be completely stripped
      expect(student1.id).toBe("stu_1");
      expect(student1.name).toBe("Student One");
      expect(student1.email).toBeUndefined();
      expect(student1.college).toBeUndefined();

      expect(student2.id).toBe("stu_2");
      expect(student2.name).toBe("Student Two");
      expect(student2.email).toBeUndefined();
      expect(student2.college).toBeUndefined();
    });

    it("preserves student email and college in GET /api/labs for privileged MENTOR / ADMIN", async () => {
      sessionState.user = {
        sub: "men_1",
        email: "linus@super60.org",
        role: "MENTOR",
        name: "Prof. Linus",
      };

      mockPrisma.lab.findMany.mockResolvedValue(mockLabsCollectionData);

      const req = new NextRequest("http://localhost:3000/api/labs?workshopId=ws_sys_2026");
      const res = await getLabs(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      const lab = json.data.labs[0];
      const student1 = lab.students[0].student;

      // Mentors retain contact information for instruction
      expect(student1.email).toBe("student1@private.edu");
      expect(student1.college).toBe("IIT Bombay");
    });
  });

  // --------------------------------------------------------------------------
  // Area 4: Doubts & Attendance Sessions Auth Enforcement
  // --------------------------------------------------------------------------
  describe("Area 4: Doubts and Attendance Sessions requireAuth Enforcement", () => {
    it("rejects unauthenticated callers on GET /api/doubts with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/doubts?workshopId=ws_sys_2026");
      const res = await getDoubts(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects unauthenticated callers on POST /api/doubts with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/doubts", {
        method: "POST",
        body: JSON.stringify({
          workshopId: "ws_sys_2026",
          labId: "lab_sys_1",
          title: "Pointer arithmetic question",
          description: "How does pointer increment work with void pointers?",
        }),
      });
      const res = await createDoubt(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects unauthenticated callers on GET /api/attendance/sessions with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/attendance/sessions?workshopId=ws_sys_2026");
      const res = await getSessions(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects unauthenticated callers on POST /api/attendance/sessions with 401 UNAUTHORIZED", async () => {
      sessionState.user = null;
      const req = new NextRequest("http://localhost:3000/api/attendance/sessions", {
        method: "POST",
        body: JSON.stringify({
          workshopId: "ws_sys_2026",
          title: "Session 1: Introduction",
          date: "2026-10-05T09:00:00Z",
        }),
      });
      const res = await createSession(req);
      expect(res.status).toBe(401);
    });

    it("rejects STUDENT role on POST /api/attendance/sessions with 403 FORBIDDEN", async () => {
      sessionState.user = {
        sub: "stu_1",
        email: "student1@private.edu",
        role: "STUDENT",
        name: "Student One",
      };
      const req = new NextRequest("http://localhost:3000/api/attendance/sessions", {
        method: "POST",
        body: JSON.stringify({
          workshopId: "ws_sys_2026",
          title: "Session 1: Introduction",
          date: "2026-10-05T09:00:00Z",
        }),
      });
      const res = await createSession(req);
      expect(res.status).toBe(403);
    });
  });

  // --------------------------------------------------------------------------
  // Area 5: Assignment Resubmission & Dynamic Score Ceiling
  // --------------------------------------------------------------------------
  describe("Area 5: Assignment Resubmission & Dynamic Review Score Validation", () => {
    beforeEach(() => {
      sessionState.user = {
        sub: "usr_student_alice",
        email: "alice@super60.org",
        role: "STUDENT",
        name: "Alice Smith",
      };
    });

    it("blocks assignment resubmission when existing submission has status === 'REVIEWED'", async () => {
      mockPrisma.assignment.findUnique.mockResolvedValue({
        id: "asg_1",
        dueDate: new Date(Date.now() + 86400000), // tomorrow
      });

      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_1",
        assignmentId: "asg_1",
        studentId: "usr_student_alice",
        status: "REVIEWED",
        score: 85,
      });

      const req = new NextRequest("http://localhost:3000/api/assignments/asg_1/submissions", {
        method: "POST",
        body: JSON.stringify({ content: "Updated C++ solution with bugfix" }),
      });

      const res = await submitAssignment(req, { params: Promise.resolve({ id: "asg_1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.message).toBe("Cannot resubmit an assignment that has already been reviewed");
      expect(mockPrisma.submission.upsert).not.toHaveBeenCalled();
    });

    it("permits assignment resubmission when existing submission has status === 'SUBMITTED'", async () => {
      mockPrisma.assignment.findUnique.mockResolvedValue({
        id: "asg_1",
        dueDate: new Date(Date.now() + 86400000),
      });

      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_1",
        assignmentId: "asg_1",
        studentId: "usr_student_alice",
        status: "SUBMITTED",
        score: null,
      });

      mockPrisma.submission.upsert.mockResolvedValue({
        id: "sub_1",
        assignmentId: "asg_1",
        studentId: "usr_student_alice",
        content: "New revision",
        status: "SUBMITTED",
      });

      const req = new NextRequest("http://localhost:3000/api/assignments/asg_1/submissions", {
        method: "POST",
        body: JSON.stringify({ content: "New revision" }),
      });

      const res = await submitAssignment(req, { params: Promise.resolve({ id: "asg_1" }) });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockPrisma.submission.upsert).toHaveBeenCalled();
    });

    it("rejects review score when score exceeds assignment.maxScore (e.g., 45 > 40)", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_100",
        assignmentId: "asg_40",
        studentId: "usr_student_alice",
        assignment: {
          id: "asg_40",
          title: "Pointers & Memory Allocation",
          maxScore: 40,
        },
      });

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_100/review", {
        method: "PUT",
        body: JSON.stringify({ score: 45, feedback: "Great work, extra credit!" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_100" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.message).toBe("Score cannot exceed assignment maximum score of 40");
      expect(mockPrisma.submission.update).not.toHaveBeenCalled();
    });

    it("accepts review score when score is exactly equal to assignment.maxScore (e.g., 40 == 40)", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_100",
        assignmentId: "asg_40",
        studentId: "usr_student_alice",
        assignment: {
          id: "asg_40",
          title: "Pointers & Memory Allocation",
          maxScore: 40,
        },
      });

      mockPrisma.submission.update.mockResolvedValue({
        id: "sub_100",
        score: 40,
        status: "REVIEWED",
        student: { id: "usr_student_alice", name: "Alice", email: "alice@super60.org" },
        assignment: { id: "asg_40", title: "Pointers & Memory Allocation", maxScore: 40 },
      });

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_100/review", {
        method: "PUT",
        body: JSON.stringify({ score: 40, feedback: "Perfect score" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_100" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.submission.score).toBe(40);
    });

    it("accepts review score greater than 100 when assignment.maxScore allows it (e.g. maxScore = 150, score = 125)", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_200",
        assignmentId: "asg_150",
        studentId: "usr_student_alice",
        assignment: {
          id: "asg_150",
          title: "Advanced Compiler Architecture",
          maxScore: 150,
        },
      });

      mockPrisma.submission.update.mockResolvedValue({
        id: "sub_200",
        score: 125,
        status: "REVIEWED",
        student: { id: "usr_student_alice", name: "Alice", email: "alice@super60.org" },
        assignment: { id: "asg_150", title: "Advanced Compiler Architecture", maxScore: 150 },
      });

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_200/review", {
        method: "PUT",
        body: JSON.stringify({ score: 125, feedback: "Excellent compiler pipeline design" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_200" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.submission.score).toBe(125);
    });

    it("rejects review attempts by non-privileged STUDENT role with 403", async () => {
      sessionState.user = {
        sub: "usr_student_alice",
        email: "alice@super60.org",
        role: "STUDENT",
        name: "Alice Student",
      };

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_100/review", {
        method: "PUT",
        body: JSON.stringify({ score: 40, feedback: "Self grading attempt" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_100" }) });
      expect(res.status).toBe(403);
    });

    it("rejects invalid negative score values via Zod schema with 422", async () => {
      sessionState.user = {
        sub: "usr_mentor_bob",
        email: "bob@super60.org",
        role: "MENTOR",
        name: "Bob Mentor",
      };

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_100/review", {
        method: "PUT",
        body: JSON.stringify({ score: -10, feedback: "Penalized" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_100" }) });
      expect(res.status).toBe(422);
    });
  });

  // --------------------------------------------------------------------------
  // Area 6: Detail Endpoints Student Contact PII Stripping (Workshops & Labs)
  // --------------------------------------------------------------------------
  describe("Area 6: Detail Endpoints Student Contact PII Stripping (Workshops & Labs)", () => {
    const mockWorkshopData = {
      id: "ws_sys_2026",
      name: "C++ Systems Engineering",
      year: 2026,
      slug: "cpp-systems-2026",
      labs: [
        {
          id: "lab_1",
          name: "Kernel Lab",
          mentors: [
            {
              mentor: { id: "men_1", name: "Prof. Linus", email: "linus@super60.org" },
            },
          ],
          students: [
            {
              student: {
                id: "stu_1",
                name: "Student One",
                email: "student1@private.edu",
                college: "Indian Institute of Technology",
              },
            },
            {
              student: {
                id: "stu_2",
                name: "Student Two",
                email: "student2@private.edu",
                college: "BITS Pilani",
              },
            },
          ],
          _count: { students: 2, assignments: 1, sessions: 2 },
        },
      ],
      enrollments: [
        {
          student: {
            id: "stu_1",
            name: "Student One",
            email: "student1@private.edu",
            college: "Indian Institute of Technology",
          },
        },
      ],
      _count: { labs: 1, enrollments: 1, assignments: 1, notes: 0 },
    };

    const mockLabData = {
      id: "lab_1",
      name: "Kernel Lab",
      mentors: [
        {
          mentor: {
            id: "men_1",
            name: "Prof. Linus",
            email: "linus@super60.org",
            mentorProfile: null,
          },
        },
      ],
      students: [
        {
          student: {
            id: "stu_1",
            name: "Student One",
            email: "student1@private.edu",
            college: "Indian Institute of Technology",
          },
        },
      ],
      assignments: [],
      notes: [],
      sessions: [],
      _count: { students: 1, assignments: 0, notes: 0, sessions: 0 },
    };

    it("strips email and college from GET /api/workshops/[id] for STUDENT role", async () => {
      sessionState.user = {
        sub: "stu_1",
        email: "student1@private.edu",
        role: "STUDENT",
        name: "Student One",
      };

      mockPrisma.workshop.findUnique.mockResolvedValue(mockWorkshopData);

      const req = new NextRequest("http://localhost:3000/api/workshops/ws_sys_2026");
      const res = await getWorkshopById(req, { params: Promise.resolve({ id: "ws_sys_2026" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);

      const labStudent = json.data.workshop.labs[0].students[0].student;
      expect(labStudent.id).toBe("stu_1");
      expect(labStudent.name).toBe("Student One");
      expect(labStudent.email).toBeUndefined();
      expect(labStudent.college).toBeUndefined();

      const enrollmentStudent = json.data.workshop.enrollments[0].student;
      expect(enrollmentStudent.id).toBe("stu_1");
      expect(enrollmentStudent.name).toBe("Student One");
      expect(enrollmentStudent.email).toBeUndefined();
      expect(enrollmentStudent.college).toBeUndefined();
    });

    it("preserves email and college in GET /api/workshops/[id] for privileged MENTOR / ADMIN", async () => {
      sessionState.user = {
        sub: "men_1",
        email: "linus@super60.org",
        role: "MENTOR",
        name: "Prof. Linus",
      };

      mockPrisma.workshop.findUnique.mockResolvedValue(mockWorkshopData);

      const req = new NextRequest("http://localhost:3000/api/workshops/ws_sys_2026");
      const res = await getWorkshopById(req, { params: Promise.resolve({ id: "ws_sys_2026" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      const labStudent = json.data.workshop.labs[0].students[0].student;
      expect(labStudent.email).toBe("student1@private.edu");
      expect(labStudent.college).toBe("Indian Institute of Technology");
    });

    it("strips email and college from GET /api/labs/[id] for STUDENT role", async () => {
      sessionState.user = {
        sub: "stu_1",
        email: "student1@private.edu",
        role: "STUDENT",
        name: "Student One",
      };

      mockPrisma.lab.findUnique.mockResolvedValue(mockLabData);

      const req = new NextRequest("http://localhost:3000/api/labs/lab_1");
      const res = await getLabById(req, { params: Promise.resolve({ id: "lab_1" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      const labStudent = json.data.lab.students[0].student;
      expect(labStudent.id).toBe("stu_1");
      expect(labStudent.name).toBe("Student One");
      expect(labStudent.email).toBeUndefined();
      expect(labStudent.college).toBeUndefined();
    });

    it("preserves email and college in GET /api/labs/[id] for privileged MENTOR / ADMIN", async () => {
      sessionState.user = {
        sub: "men_1",
        email: "linus@super60.org",
        role: "MENTOR",
        name: "Prof. Linus",
      };

      mockPrisma.lab.findUnique.mockResolvedValue(mockLabData);

      const req = new NextRequest("http://localhost:3000/api/labs/lab_1");
      const res = await getLabById(req, { params: Promise.resolve({ id: "lab_1" }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      const labStudent = json.data.lab.students[0].student;
      expect(labStudent.email).toBe("student1@private.edu");
      expect(labStudent.college).toBe("Indian Institute of Technology");
    });
  });
});
