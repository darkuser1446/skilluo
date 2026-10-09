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
  registrationNumber: z.string().optional(),
  semester: z.string().optional(),
  programmingExperience: z.string().optional(),
});

// In-memory cache for active workshop to avoid querying DB on every registration
let cachedWorkshopId: string | null = null;
let lastWorkshopFetch = 0;

async function getActiveWorkshopId(): Promise<string | null> {
  const now = Date.now();
  if (cachedWorkshopId !== null && now - lastWorkshopFetch < 60_000) {
    return cachedWorkshopId;
  }
  try {
    const ws = await prisma.workshop.findFirst({
      where: { status: { in: ["ACTIVE", "REGISTRATION_OPEN"] } },
      orderBy: { year: "desc" },
      select: { id: true },
    });
    cachedWorkshopId = ws ? ws.id : null;
    lastWorkshopFetch = now;
  } catch {
    // If lookup fails, use last known value
  }
  return cachedWorkshopId;
}

// Background non-blocking notification dispatcher
function dispatchAdminNotification(userName: string, userEmail: string) {
  prisma.user
    .findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    })
    .then((admins) => {
      if (admins.length > 0) {
        return notifyMany(
          admins.map((a) => a.id),
          "New registration to review",
          `${userName} (${userEmail}) registered and is awaiting approval.`,
          "INFO",
          "/admin"
        );
      }
    })
    .catch((err) => {
      console.error("[register notify] background error:", err?.message);
    });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      select: { id: true },
    });

    if (existing) {
      return errorResponse("User with this email already exists", "CONFLICT", 409);
    }

    // Cost factor 8 gives 10x higher CPU throughput in serverless under burst load
    const [passwordHash, activeWorkshopId] = await Promise.all([
      bcrypt.hash(data.password, 8),
      getActiveWorkshopId(),
    ]);

    // Single consolidated atomic write: User + WorkshopEnrollment in 1 SQL query
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: "STUDENT",
        college: data.college?.trim() || undefined,
        phone: data.phone?.trim(),
        branch: data.branch?.trim() || undefined,
        rollNumber: (data.registrationNumber || data.rollNumber)?.trim() || undefined,
        semester: data.semester?.trim() || undefined,
        programmingExperience: data.programmingExperience?.trim() || undefined,
        enrollments: activeWorkshopId
          ? {
              create: {
                workshopId: activeWorkshopId,
                status: "PENDING",
              },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        college: true,
      },
    });

    // Fire background notification without holding up the HTTP response
    dispatchAdminNotification(user.name, user.email);

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
