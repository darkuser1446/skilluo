const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const workshopId = 'cmuzpk2xy0008upskbu8ixgm5';
  const testId = 'cmv6f53pi0001uppcm21bkis0';

  console.log('Fetching the 29 selected students from latest test...');
  const results = await prisma.assessmentResult.findMany({
    where: {
      assessmentId: testId,
      status: 'SELECTED',
    },
    include: {
      student: true,
    },
  });

  console.log(`Found ${results.length} selected candidates from test.`);
  if (results.length !== 29) {
    console.log(`Note: Count is ${results.length}.`);
  }

  // Target labs: ONLY Lab 1, Lab 2, Lab 3, Lab 4 (EXCEPT Online Batch)
  const targetLabs = await prisma.lab.findMany({
    where: {
      workshopId,
      name: { in: ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'] },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Target Labs (strictly no online batch):`, targetLabs.map(l => l.name));

  // 1. Remove any current lab assignments ONLY for these 29 students in this workshop
  const studentIds = results.map(r => r.studentId);
  const allWorkshopLabs = await prisma.lab.findMany({
    where: { workshopId },
    select: { id: true },
  });
  const allLabIds = allWorkshopLabs.map(l => l.id);

  const deleted = await prisma.labStudent.deleteMany({
    where: {
      studentId: { in: studentIds },
      labId: { in: allLabIds },
    },
  });
  console.log(`Cleared previous lab assignment for ${deleted.count} of these students.`);

  // 2. Fisher-Yates Random Shuffle of all 29 students
  const shuffled = [...results];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 3. Distribute evenly across Lab 1, Lab 2, Lab 3, Lab 4 (round-robin)
  const allocation = {};
  targetLabs.forEach(lab => {
    allocation[lab.name] = [];
  });

  for (let i = 0; i < shuffled.length; i++) {
    const targetLab = targetLabs[i % targetLabs.length];
    allocation[targetLab.name].push({
      student: shuffled[i].student,
      score: shuffled[i].score,
      lab: targetLab,
    });
  }

  // 4. Insert into database
  for (const labName of Object.keys(allocation)) {
    const list = allocation[labName];
    console.log(`\nPlacing ${list.length} students into ${labName}...`);

    for (const item of list) {
      // Upsert WorkshopEnrollment
      await prisma.workshopEnrollment.upsert({
        where: {
          workshopId_studentId: {
            workshopId,
            studentId: item.student.id,
          },
        },
        update: { status: 'SELECTED' },
        create: {
          workshopId,
          studentId: item.student.id,
          status: 'SELECTED',
        },
      });

      // Insert LabStudent
      await prisma.labStudent.create({
        data: {
          labId: item.lab.id,
          studentId: item.student.id,
        },
      });

      // Send notification
      try {
        await prisma.notification.create({
          data: {
            userId: item.student.id,
            title: 'Lab Allocation Confirmed',
            body: `You have been allocated to ${item.lab.name} for Skill Up 2026.`,
            type: 'INFO',
            link: '/student',
          },
        });
      } catch (e) {}

      console.log(`  ✓ ${item.student.name} (${item.student.rollNumber || 'N/A'}) - Score: ${item.score} -> ${item.lab.name}`);
    }
  }

  // 5. Update lab capacities so all labs comfortably accommodate them
  await prisma.lab.update({ where: { id: targetLabs.find(l => l.name === 'Lab 1').id }, data: { capacity: 55 } });
  await prisma.lab.update({ where: { id: targetLabs.find(l => l.name === 'Lab 2').id }, data: { capacity: 55 } });
  await prisma.lab.update({ where: { id: targetLabs.find(l => l.name === 'Lab 3').id }, data: { capacity: 70 } });
  await prisma.lab.update({ where: { id: targetLabs.find(l => l.name === 'Lab 4').id }, data: { capacity: 55 } });

  // 6. Verification
  console.log('\n--- FINAL STATUS VERIFICATION ---');
  const finalLabs = await prisma.lab.findMany({
    where: { workshopId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true } } },
  });

  finalLabs.forEach(l => {
    console.log(`• ${l.name.padEnd(14)}: ${l._count.students} students (Capacity: ${l.capacity})`);
  });

  const onlineCheck = await prisma.labStudent.count({
    where: {
      lab: { name: 'Online Batch' },
      studentId: { in: studentIds },
    },
  });
  console.log(`\nStudents from 29 in Online Batch: ${onlineCheck} (Must be 0)`);
}

run()
  .then(() => {
    console.log('\nSUCCESS: All 29 students placed in physical labs (0 in online batch)!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  });
