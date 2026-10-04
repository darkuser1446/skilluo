import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}

const JWT_SECRET = process.env.JWT_SECRET || "super60_skillup_secret_key_jwt_2026_systems_platform_token";

export interface JWTPayload {
  sub: string; // userId
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  name: string;
}

export function signToken(payload: JWTPayload, expiresIn: string | number = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}
