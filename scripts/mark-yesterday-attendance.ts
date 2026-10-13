import { prisma } from "../src/lib/prisma";

async function main() {
  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!workshop) {
    console.error("No active workshop found!");
    process.exit(1);
  }

  console.log(`Active Workshop: ${workshop.name} (${workshop.id})`);

  const labs = await prisma.lab.findMany({
    where: { workshopId: workshop.id },
    include: {
      students: {
        include: {
          student: {
            select: { id: true, name: true, rollNumber: true, email: true },
          },
        },
      },
    },
  });

  console.log(`Found ${labs.length} laboratories.`);

  // Yesterday date: 2026-10-12
  const yesterday = new Date("2026-10-12T00:00:00.000Z");
  const startOfYesterday = new Date("2026-10-12T00:00:00.000Z");
  const endOfYesterday = new Date("2026-10-12T23:59:59.999Z");

  let totalMarked = 0;

  for (const lab of labs) {
    // 1. Ensure ONE session for yesterday for this lab
    let session = await prisma.session.findFirst({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: startOfYesterday, lte: endOfYesterday },
      },
      include: { attendanceRecords: true },
      orderBy: { createdAt: "asc" },
    });

    if (!session) {
      session = await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: `Day 1 — ${lab.name} Inaugural Lab & Orientation`,
          topic: "Super 60 Systems Programming & C++ Architecture Kickoff",
          date: yesterday,
          startTime: "09:00",
          endTime: "18:00",
        },
        include: { attendanceRecords: true },
      });
      console.log(`Created Day 1 session for ${lab.name}: ${session.id}`);
    } else {
      console.log(`Found existing Day 1 session for ${lab.name}: ${session.id}`);
    }

    // Clean up any duplicate Day 1 sessions for this lab if any existed
    const duplicateSessions = await prisma.session.findMany({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: startOfYesterday, lte: endOfYesterday },
        id: { not: session.id },
      },
    });

    if (duplicateSessions.length > 0) {
      console.log(`Cleaning up ${duplicateSessions.length} duplicate Day 1 sessions for ${lab.name}...`);
      for (const dup of duplicateSessions) {
        await prisma.attendanceRecord.deleteMany({ where: { sessionId: dup.id } });
        await prisma.session.delete({ where: { id: dup.id } });
      }
    }

    // 2. Mark every student in this lab as PRESENT
    let labMarked = 0;
    for (const ls of lab.students) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: ls.studentId,
          },
        },
        update: {
          status: "PRESENT",
          markedBy: "ADMIN_SYSTEM",
        },
        create: {
          sessionId: session.id,
          studentId: ls.studentId,
          status: "PRESENT",
          markedBy: "ADMIN_SYSTEM",
        },
      });
      labMarked++;
      totalMarked++;
    }

    console.log(`✓ ${lab.name}: ${labMarked} students marked PRESENT for 2026-10-12 (Day 1).`);
  }

  // Verify total attendance records for 2026-10-12
  const day1Records = await prisma.attendanceRecord.count({
    where: {
      session: {
        workshopId: workshop.id,
        date: { gte: startOfYesterday, lte: endOfYesterday },
      },
      status: "PRESENT",
    },
  });

  console.log(`\n========================================`);
  console.log(`TOTAL CANDIDATES MARKED PRESENT FOR DAY 1 (2026-10-12): ${day1Records}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
