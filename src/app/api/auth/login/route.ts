import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

const LoginSchema = z.object({
  email: z.string().min(1, "Email or Roll Number is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: identifierInput, password } = LoginSchema.parse(body);
    const identifier = identifierInput.trim();
    const isEmail = identifier.includes("@");

    // Allow login by email OR roll number (case-insensitive)
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: identifier.toLowerCase(), mode: "insensitive" } }
        : { rollNumber: { equals: identifier, mode: "insensitive" } },
      include: {
        mentorProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return errorResponse("Invalid credentials or account inactive", "UNAUTHORIZED", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Invalid credentials", "UNAUTHORIZED", 401);
    }

    // Sign JWT (sub = userId, role, name, email)
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        college: user.college,
        avatarUrl: user.avatarUrl,
        mentorProfile: user.mentorProfile,
      },
    });

    // Set httpOnly cookie: both maxAge AND expires so all browsers persist it across restarts
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // explicit Date also
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
