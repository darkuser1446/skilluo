import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/utils/api-response";
import { handleApiError, ApiError } from "@/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      throw new ApiError("Both currentPassword and newPassword are required", 400, "VALIDATION_ERROR");
    }
    if (newPassword.length < 6) {
      throw new ApiError("New password must be at least 6 characters", 400, "VALIDATION_ERROR");
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) throw new ApiError("User not found", 404, "NOT_FOUND");

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ApiError("Current password is incorrect", 401, "UNAUTHORIZED");

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

    return successResponse({ message: "Password updated successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
