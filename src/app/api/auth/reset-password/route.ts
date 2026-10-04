import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

const ResetSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = ResetSchema.parse(await req.json());

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: sha256(token) },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return errorResponse(
        "This reset link is invalid or has expired. Please request a new one.",
        "INVALID_TOKEN",
        400
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    // Invalidate this and any other outstanding reset tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    return successResponse({
      message: "Password updated. You can now log in with your new password.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}