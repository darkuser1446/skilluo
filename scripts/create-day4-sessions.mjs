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

  console.log(`Found active workshop: "${workshop.name}" (ID: ${workshop.id})`);
  console.log(`Creating/updating Day 4 sessions for ${workshop.labs.length} labs...`);

  const sessionDate = new Date('2026-10-15T10:30:00.000Z');
  const startOfDay = new Date('2026-10-15T00:00:00.000Z');
  const endOfDay = new Date('2026-10-15T23:59:59.999Z');

  const createdSessions = [];

  for (const lab of workshop.labs) {
    // Check if a session already exists for this lab today
    const existing = await prisma.session.findFirst({
      where: {
        workshopId: workshop.id,
        labId: lab.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      console.log(`Updating existing session for ${lab.name} (ID: ${existing.id})...`);
      const updated = await prisma.session.update({
        where: { id: existing.id },
        data: {
          title: 'Patterns & Basic CLI',
          topic: 'Patterns & Basic CLI',
          startTime: '16:00',
          endTime: '18:00',
          date: sessionDate,
        },
      });
      createdSessions.push(updated);
    } else {
      console.log(`Creating Day 4 session for ${lab.name}...`);
      const created = await prisma.session.create({
        data: {
          workshopId: workshop.id,
          labId: lab.id,
          title: 'Patterns & Basic CLI',
          topic: 'Patterns & Basic CLI',
          startTime: '16:00',
          endTime: '18:00',
          date: sessionDate,
        },
      });
      createdSessions.push(created);
    }
  }

  console.log('\n--- SUCCESS ---');
  console.log(`Created/Updated ${createdSessions.length} Day 4 sessions:`);
  for (const s of createdSessions) {
    console.log(`- Lab: ${s.labId} | Session ID: ${s.id} | Title: "${s.title}" | Topic: "${s.topic}" | Time: ${s.startTime}–${s.endTime}`);
  }
}

main()
  .catch((e) => {
    console.error('Error creating Day 4 sessions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
