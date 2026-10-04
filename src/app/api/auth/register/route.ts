import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { notifyMany } from "@/lib/notify";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().optional(),
  phone: z.string().optional(),
  // Extended profile fields — stored in dedicated columns
  branch: z.string().optional(),
  rollNumber: z.string().optional(),
  semester: z.string().optional(),
  programmingExperience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return errorResponse("User with this email already exists", "CONFLICT", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        college: data.college?.trim() || undefined,
        phone: data.phone?.trim(),
        branch: data.branch?.trim() || undefined,
        rollNumber: data.rollNumber?.trim() || undefined,
        semester: data.semester?.trim() || undefined,
        programmingExperience: data.programmingExperience?.trim() || undefined,
      },
    });

    // Apply to the current active/open workshop — status PENDING until admin review
    // (spec: Registration → Application → Admin Review → Approved → Enrolled)
    const activeWorkshop = await prisma.workshop.findFirst({
      where: { status: { in: ["ACTIVE", "REGISTRATION_OPEN"] } },
      orderBy: { year: "desc" },
    });

    if (activeWorkshop) {
      await prisma.workshopEnrollment.create({
        data: {
          workshopId: activeWorkshop.id,
          studentId: user.id,
          status: "PENDING",
        },
      });
    }

    // Let admins know there is a new application to review
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    });
    await notifyMany(
      admins.map((a) => a.id),
      "New registration to review",
      `${user.name} (${user.email}) registered and is awaiting approval.`,
      "INFO",
      "/admin"
    );

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          college: user.college,
        },
      },
      undefined,
      201
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}
