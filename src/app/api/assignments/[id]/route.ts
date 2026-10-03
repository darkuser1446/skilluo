import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getSessionUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        lab: true,
        submissions:
          session?.role === "STUDENT"
            ? { where: { studentId: session.sub } }
            : {
                include: {
                  student: { select: { id: true, name: true, email: true } },
                },
              },
        _count: { select: { submissions: true } },
      },
    });

    if (!assignment) return errorResponse("Assignment not found", "NOT_FOUND", 404);
    return successResponse({ assignment });
  } catch (err) {
    return handleApiError(err);
  }
}

const AssignmentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  dueDate: z.string().optional(),
  maxScore: z.number().optional(),
  attachmentUrl: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = AssignmentUpdateSchema.parse(body);

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
        ...(data.attachmentUrl && { attachmentUrl: data.attachmentUrl }),
      },
    });

    return successResponse({ assignment });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    await prisma.assignment.delete({ where: { id } });
    return successResponse({ message: "Assignment deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
