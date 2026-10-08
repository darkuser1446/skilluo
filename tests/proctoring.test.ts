import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { signToken, JWTPayload } from "../src/lib/jwt";

const { mockPrisma, state } = vi.hoisted(() => {
  return {
    mockPrisma: {
      assessment: {
        findUnique: vi.fn(),
      },
      assessmentResult: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
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
        return { value: state.mockCookieToken };
      }
      return undefined;
    },
  })),
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

vi.mock("@/lib/notify", () => ({
  notifyMany: vi.fn(async () => {}),
  labMentorIds: vi.fn(async () => ["mentor_1"]),
}));

import { POST as submitAssessment } from "../src/app/api/assessments/[id]/submit/route";

describe("Assessment Proctoring & Anti-Cheating Suite", () => {
  const studentUser: JWTPayload = {
    sub: "usr_student_01",
    email: "student@example.com",
    role: "STUDENT",
    name: "Aarav Sharma",
  };

  const sampleAssessment = {
    id: "asmt_test_01",
    workshopId: "ws_01",
    labId: "lab_01",
    title: "C++ Concurrency Assessment",
    totalMarks: 20,
    passingMarks: 12,
    questions: [
      {
        id: "q1",
        type: "MCQ",
        options: ["std::mutex", "std::atomic"],
        correctAnswer: "std::mutex",
        marks: 10,
      },
      {
        id: "q2",
        type: "MCQ",
        options: ["std::mutex", "std::atomic"],
        correctAnswer: "std::atomic",
        marks: 10,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    state.mockCookieToken = signToken(studentUser);
    mockPrisma.assessment.findUnique.mockResolvedValue(sampleAssessment);
    mockPrisma.assessmentResult.findUnique.mockResolvedValue(null);
    mockPrisma.user.findMany.mockResolvedValue([{ id: "admin_1" }]);
  });

  it("should calculate correct score on standard compliant submission", async () => {
    mockPrisma.assessmentResult.create.mockImplementation(({ data }: any) => ({
      id: "res_01",
      ...data,
    }));

    const req = new NextRequest("http://localhost:3000/api/assessments/asmt_test_01/submit", {
      method: "POST",
      body: JSON.stringify({
        answers: {
          q1: "std::mutex",
          q2: "std::atomic",
        },
        durationSec: 120,
      }),
    });

    const res = await submitAssessment(req, { params: Promise.resolve({ id: "asmt_test_01" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.score).toBe(20);
    expect(json.data.status).toBe("COMPLETED");
    expect(json.data.disqualified).toBe(false);

    expect(mockPrisma.assessmentResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 20,
          status: "COMPLETED",
          feedback: null,
        }),
      })
    );
  });

  it("should disqualify student and assign 0 score when proctoring violation is reported", async () => {
    mockPrisma.assessmentResult.create.mockImplementation(({ data }: any) => ({
      id: "res_disqualified_01",
      ...data,
    }));

    const req = new NextRequest("http://localhost:3000/api/assessments/asmt_test_01/submit", {
      method: "POST",
      body: JSON.stringify({
        answers: {
          q1: "std::mutex",
          q2: "std::atomic",
        },
        violationReason: "Exceeded 3 proctoring warnings: Tab switched or browser minimized",
        warningCount: 3,
      }),
    });

    const res = await submitAssessment(req, { params: Promise.resolve({ id: "asmt_test_01" }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.score).toBe(0);
    expect(json.data.status).toBe("DISQUALIFIED");
    expect(json.data.disqualified).toBe(true);
    expect(json.data.violationReason).toContain("Exceeded 3 proctoring warnings");

    expect(mockPrisma.assessmentResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 0,
          status: "DISQUALIFIED",
          answers: expect.objectContaining({
            _proctoring: expect.objectContaining({
              disqualified: true,
              warningCount: 3,
            }),
          }),
        }),
      })
    );
  });
});
