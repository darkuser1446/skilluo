import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workshop = await prisma.workshop.findFirst({
    where: { status: 'ACTIVE' },
    include: { labs: true },
  });

  if (!workshop) {
    throw new Error('No active workshop found');
  }

  console.log(`Active workshop: "${workshop.name}" (ID: ${workshop.id})`);

  // 1. Uniformly format Day 1 to 4 session titles
  const updates = [
    { dateStr: '2026-10-12', title: 'Day 1 : C++ Fundamentals', topic: 'C++ Fundamentals' },
    { dateStr: '2026-10-13', title: 'Day 2 : Conditional Statements', topic: 'Conditional Statements' },
    { dateStr: '2026-10-14', title: 'Day 3 : Loops', topic: 'Loops' },
    { dateStr: '2026-10-15', title: 'Day 4 : Patterns & Basic CLI', topic: 'Patterns & Basic CLI' },
  ];

  for (const u of updates) {
    const startOfDay = new Date(`${u.dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${u.dateStr}T23:59:59.999Z`);

    const sessions = await prisma.session.findMany({
      where: {
        workshopId: workshop.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { lab: true },
    });

    console.log(`Updating ${sessions.length} sessions for ${u.dateStr}...`);
    for (const s of sessions) {
      await prisma.session.update({
        where: { id: s.id },
        data: { title: u.title, topic: u.topic },
      });
    }
  }

  // 2. Create Day 5 sessions for 2026-10-16
  const sessionDate = new Date('2026-10-16T10:30:00.000Z');
  const startOfDay = new Date('2026-10-16T00:00:00.000Z');
  const endOfDay = new Date('2026-10-16T23:59:59.999Z');

  for (const lab of workshop.labs) {
    const existing = await prisma.session.findFirst({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      console.log(`Updating existing session for ${lab.name} (ID: ${existing.id})...`);
      await prisma.session.update({
        where: { id: existing.id },
        data: {
          title: 'Day 5 : Advanced CLI & Project',
          topic: 'Advanced CLI & Project',
          startTime: '16:00',
          endTime: '18:00',
          date: sessionDate,
        },
      });
    } else {
      console.log(`Creating Day 5 session for ${lab.name}...`);
      await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: 'Day 5 : Advanced CLI & Project',
          topic: 'Advanced CLI & Project',
          startTime: '16:00',
          endTime: '18:00',
          date: sessionDate,
        },
      });
    }
  }

  console.log('Day 5 sessions created/updated successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
