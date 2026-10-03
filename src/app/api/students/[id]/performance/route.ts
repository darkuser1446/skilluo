import { NextRequest } from "next/server";
import { calculateOverallPerformance } from "@/lib/performance";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: studentId } = await params;
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    // Students can only view their own performance; Mentors and Admins can view any
    if (user.role === "STUDENT" && user.sub !== studentId) {
      return errorResponse("Forbidden", "FORBIDDEN", 403);
    }

    const performance = await calculateOverallPerformance(studentId, workshopId);
    return successResponse({ performance });
  } catch (err) {
    return handleApiError(err);
  }
}
