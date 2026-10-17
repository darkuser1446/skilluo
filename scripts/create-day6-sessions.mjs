import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CREATING DAY 6 SESSIONS (Doubt Solving & Real-World Practice) ===");

  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
    include: { labs: true },
  });

  if (!workshop) throw new Error("Active workshop not found!");

  console.log(`Active Workshop: ${workshop.name} (${workshop.id})`);
  console.log(`Labs count: ${workshop.labs.length}`);

  const day6Date = new Date("2026-10-17T10:30:00.000Z"); // 16:00 IST
  const day6Title = "Day 6 : Doubt Solving & Real-World Practice";
  const day6Topic = "Doubt Solving & Real-World Practice";
  const day6StartTime = "16:00";
  const day6EndTime = "18:00";

  const startOfToday = new Date("2026-10-17T00:00:00.000Z");
  const endOfToday = new Date("2026-10-17T23:59:59.999Z");

  for (const lab of workshop.labs) {
    const existing = await prisma.session.findFirst({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: startOfToday, lte: endOfToday },
      },
    });

    if (existing) {
      console.log(`Updating existing session for ${lab.name} (id: ${existing.id})...`);
      const updated = await prisma.session.update({
        where: { id: existing.id },
        data: {
          title: day6Title,
          topic: day6Topic,
          startTime: day6StartTime,
          endTime: day6EndTime,
          date: day6Date,
        },
      });
      console.log(`  Updated Day 6 session for ${lab.name}: id: ${updated.id}`);
    } else {
      console.log(`Creating Day 6 session for ${lab.name}...`);
      const created = await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: day6Title,
          topic: day6Topic,
          date: day6Date,
          startTime: day6StartTime,
          endTime: day6EndTime,
        },
      });
      console.log(`  Created Day 6 session for ${lab.name}: id: ${created.id}`);
    }
  }

  // Verification
  console.log("\n=== VERIFYING ALL SESSIONS IN WORKSHOP ===");
  const allSessions = await prisma.session.findMany({
    where: { workshopId: workshop.id },
    include: { lab: true },
    orderBy: [{ date: "asc" }, { lab: { name: "asc" } }],
  });

  for (const s of allSessions) {
    const dStr = s.date.toISOString().slice(0, 10);
    console.log(`[${dStr}] ${s.lab?.name || "ALL"}: "${s.title}" (${s.startTime || ""}-${s.endTime || ""})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
