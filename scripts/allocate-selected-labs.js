const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function allocate() {
  const workshopId = 'cmuzpk2xy0008upskbu8ixgm5';

  // 1. Fetch physical labs
  const physicalLabs = await prisma.lab.findMany({
    where: {
      workshopId,
      name: { in: ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'] }
    },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true } } }
  });

  console.log('--- CURRENT PHYSICAL LABS ---');
  physicalLabs.forEach(l => {
    console.log(`${l.name} (${l.id}): ${l._count.students}/${l.capacity}`);
  });

  // 2. Adjust capacities so they are clean and comfortably fit the new students
  await prisma.lab.update({ where: { id: physicalLabs.find(l => l.name === 'Lab 1').id }, data: { capacity: 55 } });
  await prisma.lab.update({ where: { id: physicalLabs.find(l => l.name === 'Lab 2').id }, data: { capacity: 50 } });
  await prisma.lab.update({ where: { id: physicalLabs.find(l => l.name === 'Lab 3').id }, data: { capacity: 65 } });
  await prisma.lab.update({ where: { id: physicalLabs.find(l => l.name === 'Lab 4').id }, data: { capacity: 50 } });
  console.log('✅ Lab capacities updated (Lab 1: 55, Lab 2: 50, Lab 3: 65, Lab 4: 50)');

  // 3. Find unassigned selected students
  // From the latest test:
  const testResults = await prisma.assessmentResult.findMany({
    where: { assessmentId: 'cmv6f53pi0001uppcm21bkis0', status: 'SELECTED' },
    include: {
      student: {
        include: {
          labStudents: { where: { lab: { workshopId } } }
        }
      }
    }
  });

  const unassignedFromTest = testResults
    .filter(r => r.student.labStudents.length === 0)
    .map(r => ({
      id: r.student.id,
      name: r.student.name,
      rollNumber: r.student.rollNumber || 'N/A',
      score: r.score,
      source: 'Latest Retest'
    }));

  // Also check if any other SELECTED workshop candidate has no lab
  const otherSelected = await prisma.workshopEnrollment.findMany({
    where: {
      workshopId,
      status: 'SELECTED',
      studentId: { notIn: unassignedFromTest.map(u => u.id) }
    },
    include: {
      student: {
        include: {
          labStudents: { where: { lab: { workshopId } } }
        }
      }
    }
  });

  const otherUnassigned = otherSelected
    .filter(e => e.student.labStudents.length === 0)
    .map(e => ({
      id: e.student.id,
      name: e.student.name,
      rollNumber: e.student.rollNumber || 'N/A',
      score: null,
      source: 'Workshop Cohort'
    }));

  const allToAllocate = [...unassignedFromTest, ...otherUnassigned];
  console.log(`\nFound ${allToAllocate.length} unassigned selected candidates to place (${unassignedFromTest.length} from latest retest, ${otherUnassigned.length} from cohort).`);

  // 4. Fisher-Yates Random Shuffle
  for (let i = allToAllocate.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allToAllocate[i], allToAllocate[j]] = [allToAllocate[j], allToAllocate[i]];
  }

  // 5. Target lab distribution:
  // Lab 1 (40), Lab 2 (40), Lab 4 (40) can take 5 each. Lab 3 (58) can take 4.
  // 5 + 5 + 4 + 5 = 19
  const labTargets = [
    { lab: physicalLabs.find(l => l.name === 'Lab 1'), quota: 5 },
    { lab: physicalLabs.find(l => l.name === 'Lab 2'), quota: 5 },
    { lab: physicalLabs.find(l => l.name === 'Lab 4'), quota: 5 },
    { lab: physicalLabs.find(l => l.name === 'Lab 3'), quota: 4 },
  ];

  const assignments = [];
  let studentIdx = 0;

  for (const target of labTargets) {
    for (let k = 0; k < target.quota && studentIdx < allToAllocate.length; k++) {
      assignments.push({
        student: allToAllocate[studentIdx],
        lab: target.lab
      });
      studentIdx++;
    }
  }

  // If any remaining, distribute round robin
  while (studentIdx < allToAllocate.length) {
    const target = labTargets[studentIdx % labTargets.length];
    assignments.push({
      student: allToAllocate[studentIdx],
      lab: target.lab
    });
    studentIdx++;
  }

  console.log(`\n--- ALLOCATING ${assignments.length} STUDENTS TO LABS ---`);

  for (const item of assignments) {
    const { student, lab } = item;

    // Ensure WorkshopEnrollment is SELECTED
    await prisma.workshopEnrollment.upsert({
      where: {
        workshopId_studentId: {
          workshopId,
          studentId: student.id,
        },
      },
      update: { status: 'SELECTED' },
      create: {
        workshopId,
        studentId: student.id,
        status: 'SELECTED',
      },
    });

    // Create LabStudent
    await prisma.labStudent.upsert({
      where: {
        labId_studentId: {
          labId: lab.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        labId: lab.id,
        studentId: student.id,
      },
    });

    // Send notification
    try {
      await prisma.notification.create({
        data: {
          userId: student.id,
          title: 'Lab Allocated',
          body: `You have been randomly allocated to ${lab.name} for Skill Up 2026.`,
          type: 'INFO',
          link: '/student'
        }
      });
    } catch (e) {
      // Ignore notification failures
    }

    console.log(`Placed: ${student.name.padEnd(24)} (${student.rollNumber.padEnd(14)}) [Score: ${String(student.score ?? 'N/A').padEnd(3)}] -> ${lab.name}`);
  }

  // 6. Verify Final State
  console.log('\n--- FINAL VERIFICATION ---');
  const updatedLabs = await prisma.lab.findMany({
    where: { workshopId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { students: true } } }
  });

  updatedLabs.forEach(l => {
    console.log(`• ${l.name.padEnd(14)}: ${l._count.students} students (Capacity: ${l.capacity})`);
  });

  // Verify all 29 selected students from retest have labs
  const retestStudentsFinal = await prisma.assessmentResult.findMany({
    where: { assessmentId: 'cmv6f53pi0001uppcm21bkis0', status: 'SELECTED' },
    include: {
      student: {
        include: {
          labStudents: {
            where: { lab: { workshopId } },
            include: { lab: true }
          }
        }
      }
    }
  });

  console.log(`\nAll 29 Retest Selected Students Lab Status:`);
  retestStudentsFinal.sort((a,b) => (b.score||0) - (a.score||0)).forEach((r, idx) => {
    const assignedLab = r.student.labStudents[0]?.lab.name || 'UNASSIGNED ❌';
    console.log(`${(idx + 1).toString().padStart(2)}. ${r.student.name.padEnd(24)} | Roll: ${(r.student.rollNumber || 'N/A').padEnd(14)} | Score: ${String(r.score).padStart(2)} | Lab: ${assignedLab}`);
  });

  const unassignedCount = retestStudentsFinal.filter(r => r.student.labStudents.length === 0).length;
  console.log(`\nUnassigned retest students count: ${unassignedCount} (Expected: 0)`);
}

allocate()
  .then(() => {
    console.log('\n✅ ALL SELECTED STUDENTS SUCCESSFULLY ALLOCATED TO LABS!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Allocation failed:', err);
    process.exit(1);
  });
