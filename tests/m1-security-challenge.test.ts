import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { signToken, JWTPayload } from "../src/lib/jwt";

// Use vi.hoisted so variables are available inside vi.mock hoisted factories
const { mockPrisma, state } = vi.hoisted(() => {
  return {
    mockPrisma: {
      assessment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      questionBankItem: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      doubt: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      doubtMessage: {
        create: vi.fn(),
      },
      announcement: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      note: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      assignment: {
        findUnique: vi.fn(),
      },
      submission: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        update: vi.fn(),
      },
      feedback: {
        findMany: vi.fn(),
        upsert: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
    },
    state: {
      mockCookieToken: undefined as string | undefined,
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      if (name === "token" && state.mockCookieToken) {
        return { name: "token", value: state.mockCookieToken };
      }
      return undefined;
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/notify", () => ({
  notify: vi.fn(async () => {}),
  notifyMany: vi.fn(async () => {}),
  workshopStudentIds: vi.fn(async () => ["usr_stu_1", "usr_stu_2"]),
  labMentorIds: vi.fn(async (_workshopId, labId) => {
    if (labId === "lab_assigned") {
      return ["usr_mentor_assigned"];
    }
    return ["usr_mentor_other_lab"];
  }),
}));

// Direct imports of the actual Next.js route handlers under test
import { GET as getAssessments, POST as postAssessment } from "../src/app/api/assessments/route";
import {
  GET as getAssessmentById,
  PUT as putAssessmentById,
  DELETE as deleteAssessmentById,
} from "../src/app/api/assessments/[id]/route";
import {
  GET as getQuestionBank,
  POST as postQuestionBank,
} from "../src/app/api/question-bank/route";
import { PATCH as patchDoubtStatus } from "../src/app/api/doubts/[id]/status/route";
import { POST as postDoubtMessage } from "../src/app/api/doubts/[id]/messages/route";
import { PUT as putAnnouncement } from "../src/app/api/announcements/[id]/route";
import { PUT as putNote, DELETE as deleteNote } from "../src/app/api/notes/[id]/route";
import { POST as submitAssignment } from "../src/app/api/assignments/[id]/submissions/route";
import { PUT as reviewSubmission } from "../src/app/api/submissions/[id]/review/route";
import { GET as getFeedback } from "../src/app/api/feedback/route";

describe("Milestone 1 Empirical Security & Access Boundary Challenge Suite", () => {
  const studentPayload: JWTPayload = {
    sub: "usr_student_alice",
    email: "alice@super60.org",
    role: "STUDENT",
    name: "Alice Johnson",
  };

  const otherStudentPayload: JWTPayload = {
    sub: "usr_student_bob",
    email: "bob@super60.org",
    role: "STUDENT",
    name: "Bob Smith",
  };

  const mentorPayload: JWTPayload = {
    sub: "usr_mentor_assigned",
    email: "mentor.assigned@super60.org",
    role: "MENTOR",
    name: "Mentor Assigned",
  };

  const unassignedMentorPayload: JWTPayload = {
    sub: "usr_mentor_unassigned",
    email: "mentor.unassigned@super60.org",
    role: "MENTOR",
    name: "Mentor Unassigned",
  };

  const adminPayload: JWTPayload = {
    sub: "usr_admin_root",
    email: "admin@super60.org",
    role: "ADMIN",
    name: "Root Admin",
  };

  beforeEach(() => {
    state.mockCookieToken = undefined;
    vi.clearAllMocks();
  });

  describe("1. Assessment Security Boundaries (/api/assessments & /api/assessments/[id])", () => {
    const mockAssessmentRecord = {
      id: "asmt_cpp_01",
      workshopId: "ws_sys_2026",
      title: "C++ Memory Model & Concurrency",
      type: "QUIZ",
      totalMarks: 50,
      questions: [
        {
          id: "q1",
          prompt: "What memory order is the default for atomic operations?",
          options: ["memory_order_relaxed", "memory_order_seq_cst", "memory_order_acquire"],
          correctAnswer: "memory_order_seq_cst",
          marks: 10,
        },
        {
          id: "q2",
          prompt: "Which smart pointer permits multiple owners?",
          options: ["unique_ptr", "shared_ptr", "weak_ptr"],
          correctAnswer: "shared_ptr",
          marks: 10,
        },
      ],
      results: [],
    };

    it("should reject unauthenticated requests to GET /api/assessments with 401 UNAUTHORIZED", async () => {
      state.mockCookieToken = undefined;
      const req = new NextRequest("http://localhost:3000/api/assessments?workshopId=ws_sys_2026");

      const res = await getAssessments(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
      expect(mockPrisma.assessment.findMany).not.toHaveBeenCalled();
    });

    it("should strip correctAnswer from all questions when called by a STUDENT", async () => {
      state.mockCookieToken = signToken(studentPayload);
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessmentRecord]);

      const req = new NextRequest("http://localhost:3000/api/assessments?workshopId=ws_sys_2026");
      const res = await getAssessments(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const returnedQuestions = json.data.assessments[0].questions;
      expect(returnedQuestions.length).toBe(2);

      // Verify that correctAnswer is completely stripped from every question
      for (const q of returnedQuestions) {
        expect(q).not.toHaveProperty("correctAnswer");
        expect(q.correctAnswer).toBeUndefined();
      }

      // Verify Prisma query was properly scoped for STUDENT results
      expect(mockPrisma.assessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            results: { where: { studentId: "usr_student_alice" } },
          }),
        })
      );
    });

    it("should preserve correctAnswer for MENTOR and ADMIN callers", async () => {
      // Test for MENTOR
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.assessment.findMany.mockResolvedValue([mockAssessmentRecord]);

      const mentorReq = new NextRequest("http://localhost:3000/api/assessments?workshopId=ws_sys_2026");
      const mentorRes = await getAssessments(mentorReq);
      expect(mentorRes.status).toBe(200);
      const mentorJson = await mentorRes.json();

      expect(mentorJson.data.assessments[0].questions[0].correctAnswer).toBe("memory_order_seq_cst");
      expect(mentorJson.data.assessments[0].questions[1].correctAnswer).toBe("shared_ptr");

      // Test for ADMIN
      state.mockCookieToken = signToken(adminPayload);
      const adminReq = new NextRequest("http://localhost:3000/api/assessments?workshopId=ws_sys_2026");
      const adminRes = await getAssessments(adminReq);
      expect(adminRes.status).toBe(200);
      const adminJson = await adminRes.json();

      expect(adminJson.data.assessments[0].questions[0].correctAnswer).toBe("memory_order_seq_cst");
    });

    it("should reject unauthenticated requests to GET /api/assessments/[id] with 401 UNAUTHORIZED", async () => {
      state.mockCookieToken = undefined;
      const req = new NextRequest("http://localhost:3000/api/assessments/asmt_cpp_01");

      const res = await getAssessmentById(req, { params: Promise.resolve({ id: "asmt_cpp_01" }) });
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should strip correctAnswer in single assessment GET /api/assessments/[id] for students", async () => {
      state.mockCookieToken = signToken(studentPayload);
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessmentRecord);

      const req = new NextRequest("http://localhost:3000/api/assessments/asmt_cpp_01");
      const res = await getAssessmentById(req, { params: Promise.resolve({ id: "asmt_cpp_01" }) });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      const questions = json.data.assessment.questions;

      for (const q of questions) {
        expect(q).not.toHaveProperty("correctAnswer");
        expect(q.correctAnswer).toBeUndefined();
      }
    });

    it("should reject students from creating assessments (POST /api/assessments) with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(studentPayload);

      const req = new NextRequest("http://localhost:3000/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: "ws_sys_2026",
          title: "Forged Test",
          type: "QUIZ",
          totalMarks: 50,
          startsAt: "2026-10-10T10:00:00Z",
          endsAt: "2026-10-10T12:00:00Z",
          questions: [{ prompt: "Test question", marks: 10 }],
        }),
      });

      const res = await postAssessment(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
      expect(mockPrisma.assessment.create).not.toHaveBeenCalled();
    });

    it("should reject students from modifying or deleting assessments with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(studentPayload);

      // PUT attempt
      const putReq = new NextRequest("http://localhost:3000/api/assessments/asmt_cpp_01", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Tampered Title" }),
      });
      const putRes = await putAssessmentById(putReq, { params: Promise.resolve({ id: "asmt_cpp_01" }) });
      expect(putRes.status).toBe(403);

      // DELETE attempt
      const delReq = new NextRequest("http://localhost:3000/api/assessments/asmt_cpp_01", {
        method: "DELETE",
      });
      const delRes = await deleteAssessmentById(delReq, { params: Promise.resolve({ id: "asmt_cpp_01" }) });
      expect(delRes.status).toBe(403);
      expect(mockPrisma.assessment.delete).not.toHaveBeenCalled();
    });
  });

  describe("2. Question Bank Boundary (/api/question-bank)", () => {
    it("should reject unauthenticated requests to GET /api/question-bank with 401 UNAUTHORIZED", async () => {
      state.mockCookieToken = undefined;
      const req = new NextRequest("http://localhost:3000/api/question-bank?workshopId=ws_sys_2026");

      const res = await getQuestionBank(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject STUDENT callers from GET /api/question-bank with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(studentPayload);
      const req = new NextRequest("http://localhost:3000/api/question-bank?workshopId=ws_sys_2026");

      const res = await getQuestionBank(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
      expect(mockPrisma.questionBankItem.findMany).not.toHaveBeenCalled();
    });

    it("should allow MENTOR and ADMIN to read question bank items", async () => {
      const mockItems = [
        { id: "qb_1", prompt: "What is RAII?", difficulty: "EASY", marks: 10, correctAnswer: "Resource Acquisition Is Init" },
      ];
      mockPrisma.questionBankItem.findMany.mockResolvedValue(mockItems);

      // Mentor access
      state.mockCookieToken = signToken(mentorPayload);
      const mentorReq = new NextRequest("http://localhost:3000/api/question-bank?workshopId=ws_sys_2026");
      const mentorRes = await getQuestionBank(mentorReq);
      expect(mentorRes.status).toBe(200);
      const mentorJson = await mentorRes.json();
      expect(mentorJson.data.questions).toEqual(mockItems);

      // Admin access
      state.mockCookieToken = signToken(adminPayload);
      const adminReq = new NextRequest("http://localhost:3000/api/question-bank?workshopId=ws_sys_2026");
      const adminRes = await getQuestionBank(adminReq);
      expect(adminRes.status).toBe(200);
    });

    it("should reject STUDENT from adding items to question bank (POST /api/question-bank) with 403", async () => {
      state.mockCookieToken = signToken(studentPayload);
      const req = new NextRequest("http://localhost:3000/api/question-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: "ws_sys_2026",
          prompt: "Unauthorized student injected question",
          marks: 10,
        }),
      });

      const res = await postQuestionBank(req);
      expect(res.status).toBe(403);
      expect(mockPrisma.questionBankItem.create).not.toHaveBeenCalled();
    });
  });

  describe("3. Doubt Status Tampering Boundary (/api/doubts/[id]/status)", () => {
    const mockDoubt = {
      id: "dbt_101",
      workshopId: "ws_sys_2026",
      labId: "lab_assigned",
      studentId: "usr_student_alice",
      status: "OPEN",
    };

    it("should reject unauthenticated status update requests with 401 UNAUTHORIZED", async () => {
      state.mockCookieToken = undefined;
      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(401);
    });

    it("should reject student attempting to modify another student's doubt with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(otherStudentPayload); // Bob trying to touch Alice's doubt
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Forbidden: You cannot modify this doubt");
      expect(mockPrisma.doubt.update).not.toHaveBeenCalled();
    });

    it("should reject student attempting to self-resolve their own doubt (point farming) with 403", async () => {
      state.mockCookieToken = signToken(studentPayload); // Alice trying to mark her own doubt RESOLVED
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Students cannot self-resolve doubts");
      expect(mockPrisma.doubt.update).not.toHaveBeenCalled();
    });

    it("should allow student to mark their own doubt IN_PROGRESS", async () => {
      state.mockCookieToken = signToken(studentPayload);
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);
      mockPrisma.doubt.update.mockResolvedValue({ ...mockDoubt, status: "IN_PROGRESS" });

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(200);
      expect(mockPrisma.doubt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dbt_101" },
          data: expect.objectContaining({ status: "IN_PROGRESS" }),
        })
      );
    });

    it("should allow MENTOR and ADMIN to mark student doubts as RESOLVED", async () => {
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);
      mockPrisma.doubt.update.mockResolvedValue({ ...mockDoubt, status: "RESOLVED" });

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(200);
      expect(mockPrisma.doubt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dbt_101" },
          data: expect.objectContaining({ status: "RESOLVED" }),
        })
      );
    });

    it("should reject invalid/malformed status values with 422 VALIDATION_ERROR", async () => {
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INVALID_STATE_EXPLOIT" }),
      });

      const res = await patchDoubtStatus(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(422);
      expect(mockPrisma.doubt.update).not.toHaveBeenCalled();
    });
  });

  describe("4. Doubt Message IDOR Injection Boundary (/api/doubts/[id]/messages)", () => {
    const mockDoubt = {
      id: "dbt_101",
      title: "Segmentation fault in custom allocator",
      studentId: "usr_student_alice",
      workshopId: "ws_sys_2026",
      labId: "lab_assigned",
    };

    it("should reject unauthenticated callers from posting messages with 401 UNAUTHORIZED", async () => {
      state.mockCookieToken = undefined;
      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Injected message" }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(401);
      expect(mockPrisma.doubtMessage.create).not.toHaveBeenCalled();
    });

    it("should block a student from posting in another student's doubt thread (IDOR) with 403", async () => {
      state.mockCookieToken = signToken(otherStudentPayload); // Bob attempting to post in Alice's thread
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Malicious cross-student comment" }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Forbidden: You cannot post in another student's doubt thread");
      expect(mockPrisma.doubtMessage.create).not.toHaveBeenCalled();
    });

    it("should allow student to reply in their own doubt thread", async () => {
      state.mockCookieToken = signToken(studentPayload); // Alice posting in Alice's thread
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);
      mockPrisma.doubtMessage.create.mockResolvedValue({
        id: "msg_1",
        body: "I found the issue, checking alignment now.",
        sender: { id: studentPayload.sub, name: studentPayload.name, role: studentPayload.role },
      });

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "I found the issue, checking alignment now." }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(201);
      expect(mockPrisma.doubtMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            doubtId: "dbt_101",
            senderId: "usr_student_alice",
          }),
        })
      );
    });

    it("should block unassigned mentors from injecting messages into other labs' doubts with 403", async () => {
      state.mockCookieToken = signToken(unassignedMentorPayload); // Mentor not assigned to lab_assigned
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Unassigned mentor comment" }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Forbidden: You are not assigned to this lab");
      expect(mockPrisma.doubtMessage.create).not.toHaveBeenCalled();
    });

    it("should allow assigned lab mentor to post and automatically update doubt status to IN_PROGRESS", async () => {
      state.mockCookieToken = signToken(mentorPayload); // Assigned mentor
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);
      mockPrisma.doubtMessage.create.mockResolvedValue({
        id: "msg_2",
        body: "Check your alignment offset calculation in allocate()",
        sender: { id: mentorPayload.sub, name: mentorPayload.name, role: mentorPayload.role },
      });

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Check your alignment offset calculation in allocate()" }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(201);
      expect(mockPrisma.doubt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "dbt_101" },
          data: expect.objectContaining({ status: "IN_PROGRESS" }),
        })
      );
    });

    it("should allow ADMIN to post in any student doubt", async () => {
      state.mockCookieToken = signToken(adminPayload);
      mockPrisma.doubt.findUnique.mockResolvedValue(mockDoubt);
      mockPrisma.doubtMessage.create.mockResolvedValue({
        id: "msg_admin",
        body: "Administrative notice regarding this thread",
        sender: { id: adminPayload.sub, name: adminPayload.name, role: adminPayload.role },
      });

      const req = new NextRequest("http://localhost:3000/api/doubts/dbt_101/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: "Administrative notice regarding this thread" }),
      });

      const res = await postDoubtMessage(req, { params: Promise.resolve({ id: "dbt_101" }) });
      expect(res.status).toBe(201);
      expect(mockPrisma.doubtMessage.create).toHaveBeenCalled();
    });
  });

  describe("5. Additional Critical Milestone 1 Defenses", () => {
    it("should block cross-mentor announcement modification (SEC-09) with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(mentorPayload); // Mentor trying to edit another creator's announcement
      mockPrisma.announcement.findUnique.mockResolvedValue({
        id: "anc_1",
        title: "Important Lab Announcement",
        createdBy: "usr_mentor_other_author",
      });

      const req = new NextRequest("http://localhost:3000/api/announcements/anc_1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Tampered by competitor mentor" }),
      });

      const res = await putAnnouncement(req, { params: Promise.resolve({ id: "anc_1" }) });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.message).toContain("Forbidden: You can only edit your own announcements");
      expect(mockPrisma.announcement.update).not.toHaveBeenCalled();
    });

    it("should block cross-mentor note modification and deletion (SEC-10) with 403 FORBIDDEN", async () => {
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.note.findUnique.mockResolvedValue({
        id: "note_1",
        title: "Low-level Systems Notes",
        uploadedBy: "usr_mentor_other_author",
      });

      // PUT attempt
      const putReq = new NextRequest("http://localhost:3000/api/notes/note_1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Defaced Title" }),
      });
      const putRes = await putNote(putReq, { params: Promise.resolve({ id: "note_1" }) });
      expect(putRes.status).toBe(403);

      // DELETE attempt
      const delReq = new NextRequest("http://localhost:3000/api/notes/note_1", {
        method: "DELETE",
      });
      const delRes = await deleteNote(delReq, { params: Promise.resolve({ id: "note_1" }) });
      expect(delRes.status).toBe(403);
      expect(mockPrisma.note.delete).not.toHaveBeenCalled();
    });

    it("should prevent students from overwriting evaluated submissions (SEC-11) with 400 BAD_REQUEST", async () => {
      state.mockCookieToken = signToken(studentPayload);
      mockPrisma.assignment.findUnique.mockResolvedValue({
        id: "asg_1",
        dueDate: new Date(Date.now() + 100000).toISOString(),
      });
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_1",
        status: "REVIEWED", // Already graded
      });

      const req = new NextRequest("http://localhost:3000/api/assignments/asg_1/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Replaced submission after grading" }),
      });

      const res = await submitAssignment(req, { params: Promise.resolve({ id: "asg_1" }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Cannot resubmit an assignment that has already been reviewed");
      expect(mockPrisma.submission.upsert).not.toHaveBeenCalled();
    });

    it("should reject mentor grading scores exceeding assignment maxScore (SEC-16) with 400", async () => {
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: "sub_1",
        assignment: { id: "asg_1", maxScore: 40 }, // Max score is 40
      });

      const req = new NextRequest("http://localhost:3000/api/submissions/sub_1/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: 50, feedback: "Inflated score above max" }),
      });

      const res = await reviewSubmission(req, { params: Promise.resolve({ id: "sub_1" }) });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error.message).toContain("Score cannot exceed assignment maximum score of 40");
      expect(mockPrisma.submission.update).not.toHaveBeenCalled();
    });

    it("should anonymize student PII in feedback queries when isAnonymous is true (SEC-03)", async () => {
      state.mockCookieToken = signToken(mentorPayload);
      mockPrisma.feedback.findMany.mockResolvedValue([
        {
          id: "fb_anon",
          isAnonymous: true,
          rating: 4,
          comment: "Constructive feedback",
          student: { id: "usr_student_alice", name: "Alice Johnson" },
        },
        {
          id: "fb_public",
          isAnonymous: false,
          rating: 5,
          comment: "Public praise",
          student: { id: "usr_student_bob", name: "Bob Smith" },
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/feedback?workshopId=ws_sys_2026");
      const res = await getFeedback(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      const feedbacks = json.data.feedbacks;

      // Anonymous feedback student must be scrubbed
      expect(feedbacks[0].student).toEqual({ id: "ANONYMOUS", name: "Anonymous Student" });

      // Public feedback student remains intact
      expect(feedbacks[1].student).toEqual({ id: "usr_student_bob", name: "Bob Smith" });
    });
  });
});
