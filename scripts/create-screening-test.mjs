import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!workshop) {
    console.error("No active workshop found!");
    process.exit(1);
  }

  console.log(`Active workshop: ${workshop.name} (${workshop.id})`);

  // Load questions
  const raw = fs.readFileSync(path.join(__dirname, "skillup-cbt-100q.json"), "utf-8");
  const questions = JSON.parse(raw);
  console.log(`Loaded ${questions.length} questions from skillup-cbt-100q.json`);

  // Check if test already exists
  const existing = await prisma.assessment.findFirst({
    where: {
      workshopId: workshop.id,
      title: "SkillUp 3.0 — Screening Test (CBT Practice Paper)",
    },
    include: { _count: { select: { results: true } } },
  });

  if (existing) {
    console.log(`Test already exists (ID: ${existing.id}), submissions: ${existing._count.results}`);
    // Update to be LIVE and target NON_SELECTED
    const updated = await prisma.assessment.update({
      where: { id: existing.id },
      data: {
        startsAt: new Date("2026-10-12T00:00:00.000Z"),
        endsAt: new Date("2026-10-25T23:59:59.000Z"),
        targetAudience: "NON_SELECTED",
        targetLabIds: [],
        labId: null,
      },
    });
    console.log(`Updated test to LIVE mode (targetAudience: NON_SELECTED): ${updated.id}`);
    return;
  }

  // Create new assessment
  const startsAt = new Date("2026-10-12T00:00:00.000Z");
  const endsAt = new Date("2026-10-25T23:59:59.000Z");

  const newAssessment = await prisma.assessment.create({
    data: {
      workshopId: workshop.id,
      title: "SkillUp 3.0 — Screening Test (CBT Practice Paper)",
      description: "Official computer-based screening assessment for non-selected candidates. 100 questions covering Logical Reasoning, Quantitative Aptitude, Verbal Ability, and Programming.",
      type: "TEST",
      totalMarks: 100,
      passingMarks: 50,
      durationMinutes: 90,
      allowedViolations: 3,
      targetAudience: "NON_SELECTED",
      targetLabIds: [],
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

  console.log(`\nCreated live screening assessment: "${newAssessment.title}" (ID: ${newAssessment.id}) with ${newAssessment.questions.length} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
