import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

const ForgotSchema = z.object({ email: z.string().email() });

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

/**
 * Email delivery stub.
 * The platform has no SMTP provider configured yet, so the reset link is
 * logged server-side. Plug in a real provider (Resend/SES/SendGrid) here:
 *   await resend.email.send({ to: email, subject, html })
 */
async function deliverResetEmail(email: string, _link: string) {
  console.info(`[Auth] Password reset email triggered for: ${email}`);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = ForgotSchema.parse(await req.json());
    const normalized = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalized } });

    // Always return success — never reveal whether an account exists
    if (user && user.isActive) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(rawToken),
          expiresAt,
        },
      });

      const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await deliverResetEmail(normalized, `${base}/reset-password?token=${rawToken}`);
    }

    return successResponse({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}