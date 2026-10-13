import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== SETTING UP DAY 1 & DAY 2 ATTENDANCE SYSTEM ===");

  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
    include: {
      labs: {
        include: {
          students: {
            include: { student: { select: { id: true, name: true, rollNumber: true } } },
          },
        },
      },
    },
  });

  if (!workshop) {
    console.error("No active workshop found!");
    return;
  }

  console.log(`Active Workshop: ${workshop.name} (${workshop.id})`);
  console.log(`Labs: ${workshop.labs.map((l) => `${l.name} (${l.students.length} students)`).join(", ")}`);

  const day1Date = new Date("2026-10-12T10:00:00.000Z");
  const day2Date = new Date("2026-10-13T10:00:00.000Z");

  const day1Start = new Date("2026-10-12T00:00:00.000Z");
  const day1End = new Date("2026-10-12T23:59:59.999Z");

  const day2Start = new Date("2026-10-13T00:00:00.000Z");
  const day2End = new Date("2026-10-13T23:59:59.999Z");

  // 1. Delete all sessions NOT on 2026-10-12 or 2026-10-13
  const extraneousSessions = await prisma.session.findMany({
    where: {
      workshopId: workshop.id,
      NOT: [
        { date: { gte: day1Start, lte: day1End } },
        { date: { gte: day2Start, lte: day2End } },
      ],
    },
  });

  console.log(`\nFound ${extraneousSessions.length} extraneous sessions outside Day 1 & Day 2.`);
  for (const s of extraneousSessions) {
    await prisma.attendanceRecord.deleteMany({ where: { sessionId: s.id } });
    await prisma.session.delete({ where: { id: s.id } });
    console.log(`  Deleted session ${s.id} (${s.title})`);
  }

  // 2. Setup Day 1 & Day 2 for each lab
  for (const lab of workshop.labs) {
    console.log(`\n--- Configuring Lab: ${lab.name} (${lab.students.length} students) ---`);
    const studentIds = lab.students.map((ls) => ls.studentId);

    // DAY 1 (2026-10-12)
    const day1Sessions = await prisma.session.findMany({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: day1Start, lte: day1End },
      },
      include: { attendanceRecords: true },
      orderBy: { createdAt: "asc" },
    });

    let day1Primary = day1Sessions[0];
    if (!day1Primary) {
      day1Primary = await prisma.session.create({
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
      console.log(`  Created Day 1 session: ${day1Primary.id}`);
    } else {
      await prisma.session.update({
        where: { id: day1Primary.id },
        data: {
          title: `${lab.name} — Day 1 Inaugural Lab`,
          date: day1Date,
        },
      });
      console.log(`  Using Day 1 session: ${day1Primary.id}`);

      // Delete any duplicate Day 1 sessions for this lab
      if (day1Sessions.length > 1) {
        for (let i = 1; i < day1Sessions.length; i++) {
          const dup = day1Sessions[i];
          console.log(`  Deleting duplicate Day 1 session: ${dup.id}`);
          await prisma.attendanceRecord.deleteMany({ where: { sessionId: dup.id } });
          await prisma.session.delete({ where: { id: dup.id } });
        }
      }
    }

    // Delete Day 1 records for students NOT in this lab
    await prisma.attendanceRecord.deleteMany({
      where: {
        sessionId: day1Primary.id,
        studentId: { notIn: studentIds },
      },
    });

    // Mark ALL currently enrolled students in this lab as PRESENT on Day 1
    for (const sid of studentIds) {
      await prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: day1Primary.id,
            studentId: sid,
          },
        },
        update: { status: "PRESENT" },
        create: {
          sessionId: day1Primary.id,
          studentId: sid,
          status: "PRESENT",
        },
      });
    }
    console.log(`  Day 1: All ${studentIds.length} students marked PRESENT`);

    // DAY 2 (2026-10-13)
    const day2Sessions = await prisma.session.findMany({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: day2Start, lte: day2End },
      },
      include: { attendanceRecords: true },
      orderBy: { createdAt: "asc" },
    });

    let day2Primary = day2Sessions[0];
    if (!day2Primary) {
      day2Primary = await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: `${lab.name} — Day 2`,
          topic: "Core C++ & Systems Programming Session",
          date: day2Date,
          startTime: "16:00",
          endTime: "18:00",
        },
        include: { attendanceRecords: true },
      });
      console.log(`  Created Day 2 session: ${day2Primary.id}`);
    } else {
      await prisma.session.update({
        where: { id: day2Primary.id },
        data: {
          title: `${lab.name} — Day 2`,
          date: day2Date,
          startTime: "16:00",
          endTime: "18:00",
        },
      });
      console.log(`  Using Day 2 session: ${day2Primary.id}`);

      // Delete any duplicate Day 2 sessions for this lab
      if (day2Sessions.length > 1) {
        for (let i = 1; i < day2Sessions.length; i++) {
          const dup = day2Sessions[i];
          console.log(`  Deleting duplicate Day 2 session: ${dup.id}`);
          await prisma.attendanceRecord.deleteMany({ where: { sessionId: dup.id } });
          await prisma.session.delete({ where: { id: dup.id } });
        }
      }
    }

    // REQUIREMENT 3 & 4: Clear all attendance records for Day 2 initially
    // Day 2 must be blank/pending until attendance call starts!
    const delCount = await prisma.attendanceRecord.deleteMany({
      where: { sessionId: day2Primary.id },
    });
    console.log(`  Day 2: Cleared ${delCount.count} records. Day 2 is BLANK/PENDING initially.`);
  }

  // 3. Purge any orphan records across the whole database
  const allLabStudents = await prisma.labStudent.findMany();
  const validMap = new Map<string, string>();
  for (const ls of allLabStudents) {
    validMap.set(ls.studentId, ls.labId);
  }

  const allRecords = await prisma.attendanceRecord.findMany({
    include: { session: true },
  });

  let orphans = 0;
  for (const r of allRecords) {
    const assignedLab = validMap.get(r.studentId);
    if (!assignedLab || (r.session.labId && r.session.labId !== assignedLab)) {
      await prisma.attendanceRecord.delete({ where: { id: r.id } });
      orphans++;
    }
  }
  console.log(`\nDeleted ${orphans} orphan records.`);

  // 4. Verification
  console.log("\n=== FINAL VERIFICATION ===");
  const finalSessions = await prisma.session.findMany({
    where: { workshopId: workshop.id },
    include: {
      lab: { select: { name: true } },
      _count: { select: { attendanceRecords: true } },
    },
    orderBy: [{ date: "asc" }, { lab: { name: "asc" } }],
  });

  console.log(`Total sessions in DB: ${finalSessions.length}`);
  for (const s of finalSessions) {
    console.log(
      `- [${s.date.toISOString().slice(0, 10)}] ${s.title} | Lab: ${s.lab?.name} | Attendance Records: ${s._count.attendanceRecords}`
    );
  }

  console.log("=== COMPLETED ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
