import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { successResponse, errorResponse } from "../src/utils/api-response";
import { ApiError, handleApiError } from "../src/utils/errors";
import { z, ZodError } from "zod";

describe("API Security, Response Envelopes & Data Protection Suite", () => {
  describe("API Response Envelope Formatting", () => {
    it("should format standard success responses with proper HTTP status and data payload", async () => {
      const payload = { id: "ws_sys_01", title: "C++ Advanced Systems", maxCapacity: 60 };
      const res = successResponse(payload, undefined, 200);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({
        success: true,
        data: payload,
      });
      // Meta property should not be present when undefined
      expect("meta" in body).toBe(false);
    });

    it("should include pagination metadata in success responses when provided", async () => {
      const items = [{ id: "usr_1" }, { id: "usr_2" }];
      const meta = { page: 1, limit: 10, total: 25, totalPages: 3 };
      const res = successResponse(items, meta, 200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(items);
      expect(body.meta).toEqual(meta);
      expect(body.meta.totalPages).toBe(3);
    });

    it("should format custom status codes (201 Created) correctly", async () => {
      const newEntity = { id: "sub_999", status: "SUBMITTED" };
      const res = successResponse(newEntity, undefined, 201);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("sub_999");
    });

    it("should format standard error responses with code, message, and details", async () => {
      const res = errorResponse(
        "Resource not found",
        "NOT_FOUND",
        404,
        { entity: "Workshop", id: "ws_404" }
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
      expect(body.error.message).toBe("Resource not found");
      expect(body.error.details).toEqual({ entity: "Workshop", id: "ws_404" });
    });

    it("should fallback to 400 BAD_REQUEST when defaults are used in errorResponse", async () => {
      const res = errorResponse("Invalid parameter syntax");
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("BAD_REQUEST");
      expect(body.error.message).toBe("Invalid parameter syntax");
      expect(body.error.details).toBeUndefined();
    });
  });

  describe("Error Sanitization & Exception Handling", () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });
    it("should map ApiError to corresponding HTTP status code and structured error body", async () => {
      const authError = new ApiError("Authentication required", 401, "UNAUTHORIZED");
      const res = handleApiError(authError);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should map ApiError with custom details correctly", async () => {
      const forbiddenError = new ApiError(
        "Insufficient privileges",
        403,
        "FORBIDDEN",
        { requiredRoles: ["ADMIN"], userRole: "STUDENT" }
      );
      const res = handleApiError(forbiddenError);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
      expect(body.error.details.requiredRoles).toEqual(["ADMIN"]);
    });

    it("should map ZodError to 422 VALIDATION_ERROR with flattened details", async () => {
      const TestSchema = z.object({
        email: z.string().email(),
        rating: z.number().min(1).max(5),
      });

      let caughtZodError: ZodError | null = null;
      try {
        TestSchema.parse({ email: "invalid-email", rating: 10 });
      } catch (err) {
        if (err instanceof ZodError) caughtZodError = err;
      }

      expect(caughtZodError).not.toBeNull();
      const res = handleApiError(caughtZodError);

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Request validation failed");
      expect(body.error.details).toBeDefined();
    });

    it("should sanitize unhandled runtime exceptions with 500 INTERNAL_SERVER_ERROR", async () => {
      const genericError = new Error("Unexpected database connection failure");
      const res = handleApiError(genericError);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("Sensitive Credential & Hash Protection", () => {
    // Model of user sanitization to prevent passwordHash leak
    function sanitizeUserPayload<T extends Record<string, any>>(user: T) {
      const { passwordHash: _hash, ...safeUser } = user;
      return safeUser;
    }

    it("should never expose passwordHash in user response payloads", () => {
      const rawUserRecord = {
        id: "usr_alice_123",
        name: "Alice Johnson",
        email: "alice@super60.org",
        role: "STUDENT",
        college: "Tech University",
        passwordHash: "$2b$12$eX4mpL3SaLtH4shVaLuE.D0N0TLE4KP4SSW0RDH4SH3S",
        createdAt: new Date().toISOString(),
      };

      const safePayload = sanitizeUserPayload(rawUserRecord);

      expect(safePayload).not.toHaveProperty("passwordHash");
      expect((safePayload as any).passwordHash).toBeUndefined();
      expect(safePayload.id).toBe("usr_alice_123");
      expect(safePayload.email).toBe("alice@super60.org");
    });

    it("should verify that user lists strip sensitive security fields", () => {
      const rawUsers = [
        { id: "u1", name: "User 1", email: "u1@test.com", passwordHash: "$2b$10$hash1" },
        { id: "u2", name: "User 2", email: "u2@test.com", passwordHash: "$2b$10$hash2" },
      ];

      const safeUsers = rawUsers.map(sanitizeUserPayload);
      for (const u of safeUsers) {
        expect(u).not.toHaveProperty("passwordHash");
      }
    });

    it("should redact assessment question answer keys from students while preserving for mentors", () => {
      interface Question {
        id: string;
        text: string;
        options: string[];
        correctAnswer: string;
      }

      function sanitizeAssessmentForRole(
        questions: Question[],
        role: "STUDENT" | "MENTOR" | "ADMIN"
      ) {
        if (role === "STUDENT") {
          return questions.map((q) => {
            const { correctAnswer: _hidden, ...rest } = q;
            return rest;
          });
        }
        return questions;
      }

      const questions: Question[] = [
        {
          id: "q1",
          text: "What is the time complexity of std::unordered_map average lookup?",
          options: ["O(1)", "O(log N)", "O(N)", "O(N^2)"],
          correctAnswer: "O(1)",
        },
        {
          id: "q2",
          text: "Which C++ keyword is used to declare virtual destructors?",
          options: ["virtual", "override", "final", "explicit"],
          correctAnswer: "virtual",
        },
      ];

      // Student view: correctAnswer MUST be stripped
      const studentQuestions = sanitizeAssessmentForRole(questions, "STUDENT");
      for (const q of studentQuestions) {
        expect(q).not.toHaveProperty("correctAnswer");
        expect((q as any).correctAnswer).toBeUndefined();
      }

      // Mentor view: correctAnswer MUST be preserved
      const mentorQuestions = sanitizeAssessmentForRole(questions, "MENTOR");
      for (const q of mentorQuestions) {
        expect(q).toHaveProperty("correctAnswer");
        expect((q as Question).correctAnswer).toBeDefined();
      }

      // Admin view: correctAnswer MUST be preserved
      const adminQuestions = sanitizeAssessmentForRole(questions, "ADMIN");
      for (const q of adminQuestions) {
        expect(q).toHaveProperty("correctAnswer");
        expect((q as Question).correctAnswer).toBeDefined();
      }
    });
  });
});
