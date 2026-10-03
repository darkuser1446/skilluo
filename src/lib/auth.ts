import { cookies } from "next/headers";
import { verifyToken, JWTPayload } from "./jwt";
import { ApiError } from "@/utils/errors";

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: ("STUDENT" | "MENTOR" | "ADMIN")[]): Promise<JWTPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError("Forbidden: Insufficient privileges", 403, "FORBIDDEN");
  }
  return user;
}
