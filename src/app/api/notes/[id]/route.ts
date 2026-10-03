import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await prisma.note.findUnique({
      where: { id },
      include: { lab: true },
    });
    if (!note) return errorResponse("Note not found", "NOT_FOUND", 404);
    return successResponse({ note });
  } catch (err) {
    return handleApiError(err);
  }
}

const NoteUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  category: z.enum(["NOTES", "PDF", "CODE", "RESOURCE"]).optional(),
  tags: z.array(z.string()).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = NoteUpdateSchema.parse(body);
    const note = await prisma.note.update({ where: { id }, data });
    return successResponse({ note });
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
    await prisma.note.delete({ where: { id } });
    return successResponse({ message: "Note deleted" });
  } catch (err) {
    return handleApiError(err);
  }
}
