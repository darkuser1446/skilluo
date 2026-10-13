const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const selectedResults = await prisma.assessmentResult.findMany({
    where: {
      assessmentId: 'cmv6f53pi0001uppcm21bkis0',
      status: 'SELECTED'
    },
    include: {
      student: {
        include: {
          labStudents: {
            include: { lab: true }
          }
        }
      }
    }
  });

  console.log(`Of the ${selectedResults.length} selected students:`);
  let allocated = 0;
  let unallocated = 0;
  selectedResults.forEach(r => {
    const lab = r.student.labStudents[0]?.lab?.name;
    if (lab) {
      allocated++;
      console.log(`- ${r.student.name}: Assigned to ${lab}`);
    } else {
      unallocated++;
      console.log(`- ${r.student.name}: Not yet assigned to a lab`);
    }
  });
  console.log(`Allocated: ${allocated}, Unallocated: ${unallocated}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
