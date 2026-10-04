import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workshopId = searchParams.get("workshopId");

    if (!workshopId) {
      return errorResponse("workshopId query parameter is required", "BAD_REQUEST", 400);
    }

    const notes = await prisma.note.findMany({
      where: { workshopId },
      include: { lab: true },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ notes });
  } catch (err) {
    return handleApiError(err);
  }
}

const NoteSchema = z.object({
  workshopId: z.string(),
  labId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  category: z.enum(["NOTES", "PDF", "CODE", "RESOURCE"]).default("NOTES"),
  tags: z.array(z.string()).default([]),
});

// Max inline file size (~1 MB when base64-encoded)
const MAX_INLINE_FILE_CHARS = 1_400_000;

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["MENTOR", "ADMIN"]);
    const body = await req.json();
    const data = NoteSchema.parse(body);

    // FILE UPLOAD: attachments are stored as data-URLs; enforce size limit
    if (data.fileUrl?.startsWith("data:") && data.fileUrl.length > MAX_INLINE_FILE_CHARS) {
      return errorResponse(
        "Attachment too large — maximum file size is 1 MB",
        "FILE_TOO_LARGE",
        413
      );
    }

    const note = await prisma.note.create({
      data: {
        workshopId: data.workshopId,
        labId: data.labId || null,
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        category: data.category,
        tags: data.tags,
        uploadedBy: user.sub,
      },
    });

    return successResponse({ note }, undefined, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
