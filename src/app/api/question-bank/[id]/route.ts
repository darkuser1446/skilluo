import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/utils/api-response";
import { handleApiError } from "@/utils/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["MENTOR", "ADMIN"]);
    const { id } = await params;
    await prisma.questionBankItem.delete({ where: { id } });
    return successResponse({ message: "Question removed from bank" });
  } catch (err) {
    return handleApiError(err);
  }
}