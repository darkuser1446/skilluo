import { prisma } from "./prisma";

type NotificationType =
  | "ASSIGNMENT"
  | "REVIEW"
  | "DOUBT"
  | "ANNOUNCEMENT"
  | "ASSESSMENT"
  | "RESULT"
  | "ATTENDANCE"
  | "FEEDBACK"
  | "INFO";

/**
 * Create a single notification. Never throws — notification failures must
 * not break the main business operation.
 */
export async function notify(
  userId: string,
  title: string,
  body: string,
  type: NotificationType = "INFO",
  link?: string
): Promise<void> {
  try {
    if (!userId) return;
    await prisma.notification.create({
      data: { userId, title, body, type, link },
    });
  } catch (err) {
    console.error("[notify] failed:", err);
  }
}

/** Fan a notification out to many users (createMany skips duplicates safely). */
export async function notifyMany(
  userIds: string[],
  title: string,
  body: string,
  type: NotificationType = "INFO",
  link?: string
): Promise<void> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: unique.map((userId) => ({ userId, title, body, type, link })),
    });
  } catch (err) {
    console.error("[notifyMany] failed:", err);
  }
}

/** All student ids enrolled in a workshop (optionally restricted to one lab). */
export async function workshopStudentIds(
  workshopId: string,
  labId?: string | null
): Promise<string[]> {
  let userIds: string[] = [];

  if (labId) {
    const labStudents = await prisma.labStudent.findMany({
      where: { labId },
      select: { studentId: true },
    });
    userIds = labStudents.map((s) => s.studentId);
  } else {
    const enrollments = await prisma.workshopEnrollment.findMany({
      where: { workshopId },
      select: { studentId: true },
    });
    userIds = enrollments.map((e) => e.studentId);
  }

  // Only notify active students
  const active = await prisma.user.findMany({
    where: { id: { in: userIds }, isActive: true },
    select: { id: true },
  });
  return active.map((u) => u.id);
}

/** Mentors assigned to a lab (fall back to all mentors of the workshop). */
export async function labMentorIds(
  workshopId: string,
  labId?: string | null
): Promise<string[]> {
  if (labId) {
    const rows = await prisma.labMentor.findMany({
      where: { labId },
      select: { mentorId: true },
    });
    if (rows.length > 0) return rows.map((r) => r.mentorId);
  }
  const labs = await prisma.lab.findMany({
    where: { workshopId },
    select: { mentors: { select: { mentorId: true } } },
  });
  return labs.flatMap((l) => l.mentors.map((m) => m.mentorId));
}