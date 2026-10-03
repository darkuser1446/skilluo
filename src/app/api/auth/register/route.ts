import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().optional(),
  phone: z.string().optional(),
  // Extended profile fields — stored in college composite or logged.
  // TODO: Add dedicated schema columns (branch, rollNumber, semester, programmingExperience) for a clean implementation.
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

    // Encode extra profile fields into the college string until schema gains dedicated columns.
    // Format: "College Name - Branch (Sem N) | Roll: ROLLNO"
    let collegeComposite = data.college?.trim() ?? "";
    if (data.branch) collegeComposite += ` - ${data.branch.trim()}`;
    if (data.semester) collegeComposite += ` (Sem ${data.semester.trim()})`;
    if (data.rollNumber) collegeComposite += ` | Roll: ${data.rollNumber.trim()}`;

    // Log extended fields that don't yet have schema columns
    if (data.programmingExperience) {
      console.info(
        `[register] programmingExperience for ${data.email}: ${data.programmingExperience}. ` +
          "Add a dedicated column to User model for proper storage."
      );
    }

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        college: collegeComposite || undefined,
        phone: data.phone?.trim(),
      },
    });

    // Auto-enroll in the current active workshop (e.g. 2026)
    const activeWorkshop = await prisma.workshop.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { year: "desc" },
    });

    if (activeWorkshop) {
      await prisma.workshopEnrollment.create({
        data: {
          workshopId: activeWorkshop.id,
          studentId: user.id,
          status: "ENROLLED",
        },
      });
    }

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
