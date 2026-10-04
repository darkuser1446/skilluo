import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

/**
 * GET /mentor/profile/api
 * Fetch the authenticated mentor's complete profile and assigned labs.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "MENTOR" && session.role !== "ADMIN") {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        college: true,
        avatarUrl: true,
        createdAt: true,
        mentorProfile: true,
        labMentors: {
          include: {
            lab: {
              include: {
                workshop: {
                  select: { id: true, name: true, year: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return errorResponse("User not found", "NOT_FOUND", 404);
    return successResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

const UpdateMentorProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  avatarUrl: z
    .string()
    .refine(
      (v) => v === "" || v.startsWith("data:image/") || /^https?:\/\//.test(v),
      "Must be an http(s) URL or an uploaded image"
    )
    .optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
});

/**
 * PUT /mentor/profile/api
 * Update mentor user details (name, phone, avatarUrl) and mentorProfile (title, company, specialty, bio).
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "MENTOR" && session.role !== "ADMIN") {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const data = UpdateMentorProfileSchema.parse(body);

    if (data.avatarUrl?.startsWith("data:") && data.avatarUrl.length > 700_000) {
      return errorResponse(
        "Image too large — maximum avatar size is 512 KB",
        "FILE_TOO_LARGE",
        413
      );
    }

    // Update User table fields
    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.avatarUrl !== undefined
          ? { avatarUrl: data.avatarUrl || null }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        college: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Upsert MentorProfile table fields
    const updatedProfile = await prisma.mentorProfile.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
        title: data.title !== undefined ? data.title.trim() || null : null,
        company: data.company !== undefined ? data.company.trim() || null : null,
        specialty:
          data.specialty !== undefined ? data.specialty.trim() || null : null,
        bio: data.bio !== undefined ? data.bio.trim() || null : null,
      },
      update: {
        ...(data.title !== undefined
          ? { title: data.title.trim() || null }
          : {}),
        ...(data.company !== undefined
          ? { company: data.company.trim() || null }
          : {}),
        ...(data.specialty !== undefined
          ? { specialty: data.specialty.trim() || null }
          : {}),
        ...(data.bio !== undefined
          ? { bio: data.bio.trim() || null }
          : {}),
      },
    });

    return successResponse({
      user: {
        ...updatedUser,
        mentorProfile: updatedProfile,
      },
      message: "Mentor profile updated successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
