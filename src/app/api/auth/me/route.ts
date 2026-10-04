import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return errorResponse("Not authenticated", "UNAUTHORIZED", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        college: true,
        phone: true,
        branch: true,
        rollNumber: true,
        semester: true,
        programmingExperience: true,
        avatarUrl: true,
        mentorProfile: true,
        labMentors: {
          include: { lab: true },
        },
        labStudents: {
          include: { lab: true },
        },
        enrollments: {
          include: { workshop: true },
        },
      },
    });

    if (!user) {
      return errorResponse("User not found", "NOT_FOUND", 404);
    }

    return successResponse({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
