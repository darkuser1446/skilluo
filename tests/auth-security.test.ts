import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { signToken, verifyToken, JWTPayload } from "../src/lib/jwt";
import { ApiError } from "../src/utils/errors";

let mockCookieToken: string | undefined = undefined;

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      if (name === "token" && mockCookieToken) {
        return { name: "token", value: mockCookieToken };
      }
      return undefined;
    },
  })),
}));

// Import after mocking next/headers
import { getSessionUser, requireAuth, requireRole } from "../src/lib/auth";

describe("Auth & Role Security Enforcement Suite", () => {
  beforeEach(() => {
    mockCookieToken = undefined;
    vi.clearAllMocks();
  });

  describe("JWT Signature and Lifecycle Integrity", () => {
    const studentPayload: JWTPayload = {
      sub: "usr_student_001",
      email: "student1@super60.org",
      role: "STUDENT",
      name: "Rohit Verma",
    };

    const mentorPayload: JWTPayload = {
      sub: "usr_mentor_002",
      email: "mentor@super60.org",
      role: "MENTOR",
      name: "Dr. Ananya Sen",
    };

    const adminPayload: JWTPayload = {
      sub: "usr_admin_003",
      email: "admin@super60.org",
      role: "ADMIN",
      name: "System Admin",
    };

    it("should sign and verify valid payloads for all core roles", () => {
      for (const payload of [studentPayload, mentorPayload, adminPayload]) {
        const token = signToken(payload, "1h");
        expect(typeof token).toBe("string");
        const decoded = verifyToken(token);
        expect(decoded).not.toBeNull();
        expect(decoded?.sub).toBe(payload.sub);
        expect(decoded?.email).toBe(payload.email);
        expect(decoded?.role).toBe(payload.role);
        expect(decoded?.name).toBe(payload.name);
      }
    });

    it("should reject tampered token signatures", () => {
      const token = signToken(studentPayload, "1h");
      const parts = token.split(".");
      expect(parts.length).toBe(3);

      // Alter signature portion
      const tamperedSignature = parts[0] + "." + parts[1] + ".invalidSignature123456";
      expect(verifyToken(tamperedSignature)).toBeNull();

      // Alter payload claims while keeping original signature
      const tamperedPayload =
        parts[0] + "." + Buffer.from(JSON.stringify({ ...studentPayload, role: "ADMIN" })).toString("base64url") + "." + parts[2];
      expect(verifyToken(tamperedPayload)).toBeNull();
    });

    it("should return null on expired tokens", async () => {
      const fastExpiryToken = signToken(studentPayload, "15ms");
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(verifyToken(fastExpiryToken)).toBeNull();
    });

    it("should reject malformed and empty token strings", () => {
      expect(verifyToken("")).toBeNull();
      expect(verifyToken("random-string-not-jwt")).toBeNull();
      expect(verifyToken("header.payload")).toBeNull();
      expect(verifyToken("...")).toBeNull();
      expect(verifyToken("null")).toBeNull();
    });
  });

  describe("Session & requireAuth() Guard Contract", () => {
    it("should return null from getSessionUser when cookie is absent", async () => {
      mockCookieToken = undefined;
      const user = await getSessionUser();
      expect(user).toBeNull();
    });

    it("should throw ApiError with 401 UNAUTHORIZED when unauthenticated in requireAuth()", async () => {
      mockCookieToken = undefined;
      await expect(requireAuth()).rejects.toThrow(ApiError);

      try {
        await requireAuth();
      } catch (err: any) {
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe("UNAUTHORIZED");
        expect(err.message).toBe("Authentication required");
      }
    });

    it("should throw 401 UNAUTHORIZED when cookie contains an expired or invalid token", async () => {
      mockCookieToken = "bad.expired.token";
      await expect(requireAuth()).rejects.toMatchObject({
        statusCode: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("should successfully return JWTPayload when cookie contains valid token", async () => {
      const studentPayload: JWTPayload = {
        sub: "usr_student_777",
        email: "aarav@super60.org",
        role: "STUDENT",
        name: "Aarav Gupta",
      };
      mockCookieToken = signToken(studentPayload, "1h");

      const user = await requireAuth();
      expect(user.sub).toBe("usr_student_777");
      expect(user.role).toBe("STUDENT");
      expect(user.name).toBe("Aarav Gupta");
    });
  });

  describe("requireRole() Role Gating and Unauthorized Elevation Defense", () => {
    it("should allow ADMIN access when ADMIN role is required", async () => {
      mockCookieToken = signToken(
        { sub: "usr_adm_1", email: "admin@s60.org", role: "ADMIN", name: "Admin" },
        "1h"
      );
      const user = await requireRole(["ADMIN"]);
      expect(user.role).toBe("ADMIN");
    });

    it("should reject STUDENT attempting to access ADMIN endpoint with 403 FORBIDDEN", async () => {
      mockCookieToken = signToken(
        { sub: "usr_stu_1", email: "student@s60.org", role: "STUDENT", name: "Student" },
        "1h"
      );
      await expect(requireRole(["ADMIN"])).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "Forbidden: Insufficient privileges",
      });
    });

    it("should reject MENTOR attempting to access ADMIN endpoint with 403 FORBIDDEN", async () => {
      mockCookieToken = signToken(
        { sub: "usr_men_1", email: "mentor@s60.org", role: "MENTOR", name: "Mentor" },
        "1h"
      );
      await expect(requireRole(["ADMIN"])).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "Forbidden: Insufficient privileges",
      });
    });

    it("should permit both MENTOR and ADMIN when allowedRoles includes both", async () => {
      // Test MENTOR
      mockCookieToken = signToken(
        { sub: "usr_men_2", email: "mentor2@s60.org", role: "MENTOR", name: "Mentor 2" },
        "1h"
      );
      const mentorUser = await requireRole(["MENTOR", "ADMIN"]);
      expect(mentorUser.role).toBe("MENTOR");

      // Test ADMIN
      mockCookieToken = signToken(
        { sub: "usr_adm_2", email: "admin2@s60.org", role: "ADMIN", name: "Admin 2" },
        "1h"
      );
      const adminUser = await requireRole(["MENTOR", "ADMIN"]);
      expect(adminUser.role).toBe("ADMIN");

      // Test STUDENT still blocked
      mockCookieToken = signToken(
        { sub: "usr_stu_2", email: "student2@s60.org", role: "STUDENT", name: "Student 2" },
        "1h"
      );
      await expect(requireRole(["MENTOR", "ADMIN"])).rejects.toMatchObject({
        statusCode: 403,
        code: "FORBIDDEN",
      });
    });

    it("should throw 401 UNAUTHORIZED before checking role if request has no token", async () => {
      mockCookieToken = undefined;
      await expect(requireRole(["ADMIN"])).rejects.toMatchObject({
        statusCode: 401,
        code: "UNAUTHORIZED",
      });
    });
  });

  describe("Bcrypt Password Hashing & Security Safeguards", () => {
    it("should produce valid salted bcrypt hashes with cost factor 10 and 12", async () => {
      const rawPassword = "SecurePassword@2026!";
      const hash10 = await bcrypt.hash(rawPassword, 10);
      const hash12 = await bcrypt.hash(rawPassword, 12);

      expect(hash10).toMatch(/^\$2[aby]\$10\$/);
      expect(hash12).toMatch(/^\$2[aby]\$12\$/);
      expect(hash10).not.toBe(hash12);
    });

    it("should correctly verify valid credentials and reject invalid ones", async () => {
      const password = "CorrectHorseBatteryStaple!";
      const wrongPassword = "WrongPassword123";
      const hash = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare(wrongPassword, hash);
      expect(isInvalid).toBe(false);
    });

    it("should generate distinct hashes for identical passwords due to unique salts", async () => {
      const password = "StandardPassword#123";
      const hashA = await bcrypt.hash(password, 10);
      const hashB = await bcrypt.hash(password, 10);

      expect(hashA).not.toBe(hashB);
      expect(await bcrypt.compare(password, hashA)).toBe(true);
      expect(await bcrypt.compare(password, hashB)).toBe(true);
    });

    it("should safely handle complex characters and UTF-8 strings in passwords", async () => {
      const complexPass = "C++Systems#_₹987&@#🔥_Super60!";
      const hash = await bcrypt.hash(complexPass, 10);

      expect(await bcrypt.compare(complexPass, hash)).toBe(true);
      expect(await bcrypt.compare("C++Systems#_₹987&@#_Super60!", hash)).toBe(false);
    });
  });
});
