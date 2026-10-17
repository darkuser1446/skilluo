import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== STARTING DAY 3 ASSIGNMENT IN LOOPS FOR EVERY LAB ===");

  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
    include: { labs: true },
  });

  if (!workshop) throw new Error("Active workshop not found!");

  const labIds = workshop.labs.map((l) => l.id);
  console.log("Active labs in workshop:", workshop.labs.map((l) => `${l.name} (${l.id})`));

  const startsAt = new Date("2026-10-14T00:00:00.000Z");
  const endsAt = new Date("2026-11-05T23:59:59.999Z");

  // 1. Update Day 3 Assessment (Interactive Quiz)
  const assessment = await prisma.assessment.findFirst({
    where: {
      workshopId: workshop.id,
      title: { contains: "Day 3" },
    },
    include: { questions: true, results: true },
  });

  if (!assessment) {
    throw new Error("Day 3 Assessment not found!");
  }

  console.log(`Found Assessment: "${assessment.title}" (ID: ${assessment.id})`);
  console.log(`Current: startsAt=${assessment.startsAt.toISOString()} | endsAt=${assessment.endsAt.toISOString()}`);
  console.log(`Current Questions: ${assessment.questions.length} | Existing Results: ${assessment.results.length}`);

  const updatedAssessment = await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      title: "Day 3 : Loops",
      type: "ASSIGNMENT",
      targetAudience: "ALL", // Accessible to every student in every lab
      targetLabIds: [],      // Truly global: all labs + any unassigned
      labId: null,           // Not restricted to any single lab
      totalMarks: 100,
      passingMarks: 50,
      durationMinutes: 45,
      allowedViolations: 0,  // Open practice, self-paced, no lockouts
      instructions: "Day 3 Lab Assignment: Loops & Iterations. 20 MCQs for all laboratory students across all labs. Open-book practice: Self-paced, no camera proctoring, no tab-switch lockouts.",
      description: "Super 60 C++ Day 3 Lab Assignment — Loops & Iterations. 20 MCQs covering for loops, while loops, do-while loops, nested loops, break, continue, and pattern iteration for all lab tracks.",
      startsAt,
      endsAt,
    },
  });

  console.log(`Updated Assessment successfully!`);
  console.log(`  New Title: "${updatedAssessment.title}"`);
  console.log(`  Target Audience: ${updatedAssessment.targetAudience} (covers all labs: ${labIds.length} labs)`);
  console.log(`  Live Window: ${updatedAssessment.startsAt.toISOString()} -> ${updatedAssessment.endsAt.toISOString()}`);

  // 2. Update Day 3 Assignment in prisma.assignment
  const assignment = await prisma.assignment.findFirst({
    where: {
      workshopId: workshop.id,
      title: { contains: "Day 3" },
    },
  });

  if (assignment) {
    console.log(`Found Assignment: "${assignment.title}" (ID: ${assignment.id})`);
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        title: "Day 3 : Loops",
        labId: null, // Visible in all labs
        dueDate: endsAt,
        attachmentUrl: "/assignments/Loops_and_Iterations_20_MCQ_Assignment_CPP.pdf",
        description: `Super 60 C++ Day 3 Assignment: Loops & Iterations.\n\nThis assignment is officially active for ALL laboratory tracks (Lab 1, Lab 2, Lab 3, Lab 4, and Online Batch).\n\n- **Interactive MCQs**: Take the 20-question interactive test under the "Assessments & Tests" tab for instant scoring.\n- **Download PDF**: [Download Loops & Iterations 20 MCQ Assignment PDF](/assignments/Loops_and_Iterations_20_MCQ_Assignment_CPP.pdf)\n- **Due Date**: 05 November 2026\n- **Total Marks**: 100 Marks`,
      },
    });
    console.log(`Updated Assignment successfully!`);
    console.log(`  New Title: "${updatedAssignment.title}"`);
    console.log(`  Due Date: ${updatedAssignment.dueDate.toISOString()}`);
    console.log(`  Attachment: ${updatedAssignment.attachmentUrl}`);
  }

  // 3. Post Announcement
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const adminId = admin ? admin.id : "cmuzylrwo0002jx069q35qvyt";

  const announcement = await prisma.announcement.create({
    data: {
      workshopId: workshop.id,
      title: "Day 3 Assignment (Loops) Active For All Labs",
      body: "The Day 3 Assignment on Loops & Iterations has been started and is now active for all laboratory tracks (Lab 1, Lab 2, Lab 3, Lab 4, and Online Batch). Students can take the 20 MCQs directly in the Assessments & Tests portal.",
      isPublic: true,
      pinned: true,
      createdBy: adminId,
    },
  });
  console.log(`Created Announcement: "${announcement.title}" (ID: ${announcement.id})`);

  console.log("\n=== COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
