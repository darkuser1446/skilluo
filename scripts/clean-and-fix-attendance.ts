import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CLEANING AND NORMALIZING ATTENDANCE DATABASE ===");

  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
    include: { labs: { include: { students: true } } },
  });

  if (!workshop) {
    console.error("No active workshop found!");
    return;
  }

  console.log(`Active workshop: ${workshop.name} (${workshop.id})`);

  // 1. Delete all sessions NOT on 2026-10-12
  const day1Start = new Date("2026-10-12T00:00:00.000Z");
  const day1End = new Date("2026-10-12T23:59:59.999Z");
  const nonDay1Sessions = await prisma.session.findMany({
    where: {
      workshopId: workshop.id,
      OR: [
        { date: { lt: day1Start } },
        { date: { gt: day1End } },
        { title: { contains: "13 Oct" } },
      ],
    },
  });

  console.log(`Found ${nonDay1Sessions.length} non-Day 1 sessions to delete:`, nonDay1Sessions.map((s) => `${s.title} (${s.date.toISOString()})`));

  for (const fs of nonDay1Sessions) {
    await prisma.attendanceRecord.deleteMany({ where: { sessionId: fs.id } });
    await prisma.session.delete({ where: { id: fs.id } });
    console.log(`  Deleted session ${fs.id} (${fs.title})`);
  }

  // 2. Normalize Day 1 sessions for each lab
  // Day 1 range: 2026-10-12 00:00:00 to 2026-10-12 23:59:59
  const day1Date = new Date("2026-10-12T10:00:00.000Z");

  for (const lab of workshop.labs) {
    console.log(`\nProcessing ${lab.name} (${lab.id}): ${lab.students.length} students enrolled`);

    // Find all Day 1 sessions for this lab
    const labDay1Sessions = await prisma.session.findMany({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: {
          gte: new Date("2026-10-12T00:00:00.000Z"),
          lte: new Date("2026-10-12T23:59:59.999Z"),
        },
      },
      include: { attendanceRecords: true },
      orderBy: { createdAt: "asc" },
    });

    let primarySession = labDay1Sessions[0];

    if (!primarySession) {
      primarySession = await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: `${lab.name} — Day 1 Inaugural Lab`,
          topic: "C++ Workshop Orientation & Development Environment",
          date: day1Date,
          startTime: "09:00",
          endTime: "18:00",
        },
        include: { attendanceRecords: true },
      });
      console.log(`  Created Day 1 session for ${lab.name}: ${primarySession.id}`);
    } else {
      // Ensure title is clear
      await prisma.session.update({
        where: { id: primarySession.id },
        data: {
          title: `${lab.name} — Day 1 Inaugural Lab`,
          topic: "C++ Workshop Orientation & Development Environment",
          date: day1Date,
        },
      });
      console.log(`  Using Day 1 session: ${primarySession.id} (${primarySession.title})`);

      // If duplicate Day 1 sessions exist for this lab, merge and delete extra
      if (labDay1Sessions.length > 1) {
        for (let i = 1; i < labDay1Sessions.length; i++) {
          const extra = labDay1Sessions[i];
          console.log(`  Removing duplicate Day 1 session: ${extra.id}`);
          await prisma.attendanceRecord.deleteMany({ where: { sessionId: extra.id } });
          await prisma.session.delete({ where: { id: extra.id } });
        }
      }
    }

    // 3. For all students currently in this lab:
    // Mark them PRESENT in this primarySession
    const enrolledStudentIds = lab.students.map((ls) => ls.studentId);

    // Delete any attendance records for this session for students NOT in this lab
    await prisma.attendanceRecord.deleteMany({
      where: {
        sessionId: primarySession.id,
        studentId: { notIn: enrolledStudentIds },
      },
    });

    // Upsert PRESENT record for every enrolled student in this lab
    let markedCount = 0;
    for (const studentId of enrolledStudentIds) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: primarySession.id,
            studentId,
          },
        },
        update: {
          status: "PRESENT",
        },
        create: {
          sessionId: primarySession.id,
          studentId,
          status: "PRESENT",
        },
      });
      markedCount++;
    }
    console.log(`  Marked all ${markedCount} enrolled students as PRESENT in ${lab.name}`);
  }

  // 4. Clean up any orphaned attendance records:
  // Ensure no student has attendance in a session of a lab they don't belong to
  const allLabStudents = await prisma.labStudent.findMany();
  const studentToLabMap = new Map<string, string>();
  for (const ls of allLabStudents) {
    studentToLabMap.set(ls.studentId, ls.labId);
  }

  const allRecords = await prisma.attendanceRecord.findMany({
    include: { session: true },
  });

  let deletedOrphans = 0;
  for (const rec of allRecords) {
    const studentLabId = studentToLabMap.get(rec.studentId);
    if (!studentLabId || (rec.session.labId && rec.session.labId !== studentLabId)) {
      await prisma.attendanceRecord.delete({ where: { id: rec.id } });
      deletedOrphans++;
    }
  }
  console.log(`\nDeleted ${deletedOrphans} orphaned attendance records for misassigned students.`);

  // 5. Verification
  console.log("\n=== FINAL VERIFICATION ===");
  const finalSessions = await prisma.session.findMany({
    where: { workshopId: workshop.id },
    include: {
      lab: { select: { name: true } },
      _count: { select: { attendanceRecords: true } },
    },
    orderBy: { date: "asc" },
  });

  console.log(`Total sessions in DB: ${finalSessions.length}`);
  for (const s of finalSessions) {
    console.log(`- ${s.title} | ${s.date.toISOString().slice(0, 10)} | Lab: ${s.lab?.name} | Records: ${s._count.attendanceRecords}`);
  }

  // Verify total records
  const totalRecords = await prisma.attendanceRecord.count();
  console.log(`Total attendance records across DB: ${totalRecords}`);
  console.log("=== COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
