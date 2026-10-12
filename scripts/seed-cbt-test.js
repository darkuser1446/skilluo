const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const workshop = await prisma.workshop.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!workshop) {
    console.error("No active workshop found!");
    process.exit(1);
  }

  console.log(`Found active workshop: ${workshop.name} (${workshop.id})`);

  // Read the 100 newly parsed questions from SkillUp_3_0_CBT_Practice_Paper_100Q.pdf
  const raw = fs.readFileSync(
    path.join(__dirname, 'skillup-cbt-100q.json'),
    'utf-8'
  );
  const questions = JSON.parse(raw);
  console.log(`Loaded ${questions.length} new CBT questions from skillup-cbt-100q.json.`);

  // Find any existing screening test to replace
  const existingAssessments = await prisma.assessment.findMany({
    where: { workshopId: workshop.id },
    include: { _count: { select: { results: true, questions: true } } },
  });

  for (const existing of existingAssessments) {
    console.log(`Found existing assessment: "${existing.title}" (ID: ${existing.id}) with ${existing._count.questions} questions, ${existing._count.results} results.`);
    console.log(`Deleting old assessment questions and record...`);
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentId: existing.id },
    });
    await prisma.assessment.delete({
      where: { id: existing.id },
    });
    console.log(`Deleted old assessment "${existing.title}".`);
  }

  // Set startsAt to a FUTURE date so the test is NOT LIVE (upcoming draft mode).
  // The admin can easily make it live at any time by clicking "Set Today" or "Edit Test".
  const startsAt = new Date('2026-10-25T09:00:00.000Z');
  const endsAt = new Date('2026-10-26T23:59:59.000Z');

  const newAssessment = await prisma.assessment.create({
    data: {
      workshopId: workshop.id,
      title: "SkillUp 3.0 — Screening Test (CBT Practice Paper)",
      type: "TEST",
      totalMarks: 100,
      passingMarks: 50,
      durationMinutes: 90,
      allowedViolations: 3,
      instructions:
        "B.Tech First Semester | Class 12-Level Foundation | Computer-Based Test (CBT)\nDuration: 90 minutes | Total Questions: 100 | Maximum Marks: 100\nBlueprint: Logical Reasoning 25; Quantitative Aptitude 25; Verbal Ability 20; Problem Solving 5; Programming & Technology 25.\nInstructions:\n1. All questions are independent multiple-choice questions.\n2. Each question carries 1 mark. Select one correct option (A, B, C, or D).\n3. No negative marking is assumed for this practice paper.\n4. Suggested pacing: approximately 54 seconds per question.\n5. Strict proctoring: Clipboard operations (Ctrl+C, Ctrl+V), switching tabs, or exiting full-screen will trigger violation strikes and auto-lockout.",
      startsAt,
      endsAt,
      questions: {
        create: questions.map((q) => ({
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: 1,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  console.log("\n========================================================");
  console.log(`SUCCESS! Assessment created with new questions from SkillUp_3_0_CBT_Practice_Paper_100Q.pdf`);
  console.log(`ID: ${newAssessment.id}`);
  console.log(`Title: ${newAssessment.title}`);
  console.log(`Total Questions: ${newAssessment.questions.length}`);
  console.log(`Duration: ${newAssessment.durationMinutes} minutes`);
  console.log(`StartsAt: ${newAssessment.startsAt.toISOString()} (FUTURE DATE - NOT LIVE)`);
  console.log(`EndsAt: ${newAssessment.endsAt.toISOString()}`);
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
