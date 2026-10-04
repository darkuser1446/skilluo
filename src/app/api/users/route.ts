import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          college: true,
          phone: true,
          isActive: true,
          createdAt: true,
          mentorProfile: { select: { title: true, company: true, specialty: true } },
          labStudents: { include: { lab: { select: { id: true, name: true } } } },
          labMentors: { include: { lab: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({ users }, { page, limit, total });
  } catch (err) {
    return handleApiError(err);
  }
}

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "MENTOR", "ADMIN"]),
  college: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);
    const body = await req.json();
    const data = CreateUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return errorResponse("Email already registered", "CONFLICT", 409);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        college: data.college,
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        createdAt: true,
      },
    });

    const actor = await requireAuth();
    await prisma.auditLog.create({
      data: {
        action: `USER_CREATED_${data.role}`,
        performedBy: actor.sub,
        targetId: user.id,
        details: { email: user.email, name: user.name },
      },
    });

    return successResponse({ user }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
