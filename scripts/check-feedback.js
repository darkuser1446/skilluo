const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.feedback.count();
  console.log(`\n========================================`);
  console.log(`TOTAL STUDENT REVIEWS/FEEDBACK: ${count}`);
  console.log(`========================================`);

  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { name: true, rollNumber: true } },
      mentor: { select: { name: true } },
      lab: { select: { name: true } }
    }
  });

  console.log(`\nAll Feedback List:`);
  feedbacks.forEach((f, i) => {
    console.log(
      `${(i + 1).toString().padStart(2)}. [${f.createdAt.toISOString().slice(0, 16)}] ` +
      `Lab: ${(f.lab?.name || 'N/A').padEnd(6)} | ` +
      `Student: ${(f.student?.name || 'Anon').padEnd(22)} (${f.student?.rollNumber || ''}) | ` +
      `Mentor: ${(f.mentor?.name || 'N/A').padEnd(24)} | ` +
      `Rating: ${f.rating}★ | ` +
      `Comment: ${f.comment || '(no comment)'}`
    );
  });
}

main().catch(console.error).finally(() => process.exit(0));
