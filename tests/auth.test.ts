import { describe, it, expect } from "vitest";
import { signToken, verifyToken, JWTPayload } from "../src/lib/jwt";

describe("JWT Authentication & Verification Suite", () => {
  const samplePayload: JWTPayload = {
    sub: "usr_student_123",
    email: "student@super60.edu",
    role: "STUDENT",
    name: "Aarav Sharma",
  };

  it("should successfully sign and verify a valid JWT token", () => {
    const token = signToken(samplePayload, "1h");
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(samplePayload.sub);
    expect(decoded?.email).toBe(samplePayload.email);
    expect(decoded?.role).toBe("STUDENT");
    expect(decoded?.name).toBe("Aarav Sharma");
  });

  it("should preserve ADMIN and MENTOR role permissions in claims", () => {
    const adminPayload: JWTPayload = {
      sub: "usr_admin_999",
      email: "admin@super60.edu",
      role: "ADMIN",
      name: "Super Admin",
    };
    const token = signToken(adminPayload, "2h");
    const decoded = verifyToken(token);
    expect(decoded?.role).toBe("ADMIN");
  });

  it("should return null for malformed or tampered tokens", () => {
    const invalidToken = "eyJh...tampered...token";
    const result = verifyToken(invalidToken);
    expect(result).toBeNull();
  });

  it("should return null for expired tokens", async () => {
    // 10 milliseconds expiration timespan string
    const expiredToken = signToken(samplePayload, "10ms");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });
});
