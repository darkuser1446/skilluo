import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();
    const { id } = await params;

    // Students can only view their own profile
    if (actor.role === "STUDENT" && actor.sub !== id) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        phone: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        mentorProfile: true,
        labStudents: {
          include: { lab: { select: { id: true, name: true, workshopId: true } } },
        },
        labMentors: {
          include: { lab: { select: { id: true, name: true, workshopId: true } } },
        },
        enrollments: true,
      },
    });

    if (!user) return errorResponse("User not found", "NOT_FOUND", 404);
    return successResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

const avatarUrlSchema = z
  .string()
  .refine(
    (v) => v === "" || v.startsWith("data:image/") || /^https?:\/\//.test(v),
    "Must be an http(s) URL or an uploaded image"
  )
  .optional();

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  college: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: avatarUrlSchema,
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();
    const { id } = await params;

    // Only admin can update others; users can update their own profile
    if (actor.role !== "ADMIN" && actor.sub !== id) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }
    // Only admin can set isActive
    const body = await req.json();
    if (body.isActive !== undefined && actor.role !== "ADMIN") {
      return errorResponse("Only admins can change account active status", "FORBIDDEN", 403);
    }

    const data = UpdateUserSchema.parse(body);
    if (data.avatarUrl?.startsWith("data:") && data.avatarUrl.length > 700_000) {
      return errorResponse("Image too large — maximum avatar size is 512 KB", "FILE_TOO_LARGE", 413);
    }
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        phone: true,
        isActive: true,
      },
    });

    return successResponse({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SECURITY: deactivating accounts is an admin-only operation
    const actor = await requireRole(["ADMIN"]);
    const { id } = await params;

    // Soft delete — mark inactive instead of hard delete
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "USER_DEACTIVATED",
        performedBy: actor.sub,
        targetId: id,
        details: { name: user.name },
      },
    });

    return successResponse({ user, message: "User deactivated" });
  } catch (err) {
    return handleApiError(err);
  }
}

// PATCH — profile update (subset of PUT; alias for self-service profile editing)
const PatchUserSchema = z.object({
  name: z.string().min(2).optional(),
  college: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z
    .string()
    .refine(
      (v) => v === "" || v.startsWith("data:image/") || /^https?:\/\//.test(v),
      "Must be an http(s) URL or an uploaded image"
    )
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAuth();
    const { id } = await params;

    // Users can only patch their own profile; admins can patch anyone
    if (actor.role !== "ADMIN" && actor.sub !== id) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const data = PatchUserSchema.parse(body);
    if (data.avatarUrl?.startsWith("data:") && data.avatarUrl.length > 700_000) {
      return errorResponse("Image too large — maximum avatar size is 512 KB", "FILE_TOO_LARGE", 413);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.college !== undefined && { college: data.college }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    return successResponse({ user: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
