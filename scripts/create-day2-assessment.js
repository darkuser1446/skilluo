const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const workshopId = 'cmuzpk2xy0008upskbu8ixgm5';
  
  // 1. Fetch all labs for this workshop
  const labs = await prisma.lab.findMany({
    where: { workshopId },
    select: { id: true, name: true }
  });
  const labIds = labs.map(l => l.id);
  console.log('Mapping to labs:', labs.map(l => l.name));

  // 2. Read parsed questions
  const rawData = fs.readFileSync('scripts/day2_parsed_questions.json', 'utf8');
  const questions = JSON.parse(rawData);
  console.log(`Loaded ${questions.length} questions from JSON.`);

  // Validate all questions have prompt, options, and correctAnswer
  questions.forEach((q, idx) => {
    if (!q.prompt || !q.options || q.options.length !== 4 || !q.correctAnswer) {
      throw new Error(`Question #${idx + 1} is invalid: ${JSON.stringify(q)}`);
    }
    const cleanOpts = q.options.map(o => o.trim().toLowerCase());
    if (!cleanOpts.includes(q.correctAnswer.trim().toLowerCase())) {
      throw new Error(`Question #${idx + 1} correctAnswer '${q.correctAnswer}' does not match options: ${q.options.join(', ')}`);
    }
  });
  console.log('✅ All 20 questions and answer keys validated successfully!');

  // 3. Create Assessment
  const startsAt = new Date(); // Active now
  const endsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days window

  const assessment = await prisma.assessment.create({
    data: {
      workshopId,
      title: 'Day 2: Conditional Statements & Their Applications',
      description: 'Super 60 C++ Assignment & Test — Day 2: Conditional Statements & Their Applications. 20 MCQs covering if/else, nested conditions, relational and logical operators, switch-case, break/default, and real-world logic problems.',
      type: 'ASSIGNMENT',
      totalMarks: 100,
      passingMarks: 50,
      durationMinutes: 20,
      allowedViolations: 3,
      instructions: 'Choose the one best answer for each question. 20 MCQs | Beginner to Intermediate | Suggested time: 20 minutes. Tab switching and anti-cheat mechanism are enabled.',
      startsAt,
      endsAt,
      targetAudience: 'ALL',
      targetLabIds: labIds,
      questions: {
        create: questions.map(q => ({
          prompt: q.prompt,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 5,
        }))
      }
    },
    include: {
      questions: true
    }
  });

  console.log(`\n🎉 Successfully created Assessment!`);
  console.log(`ID: ${assessment.id}`);
  console.log(`Title: ${assessment.title}`);
  console.log(`Type: ${assessment.type}`);
  console.log(`Questions: ${assessment.questions.length}`);
  console.log(`Total Marks: ${assessment.totalMarks}`);
  console.log(`Duration: ${assessment.durationMinutes} minutes`);
  console.log(`Active Period: ${assessment.startsAt.toISOString()} to ${assessment.endsAt.toISOString()}`);

  // 4. Also create Assignment model record so it appears in both tabs
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  const assignment = await prisma.assignment.create({
    data: {
      workshopId,
      title: 'Day 2: Conditional Statements & Their Applications',
      description: 'Super 60 C++ Day 2 Assignment: Complete the interactive MCQ assessment on Conditional Statements & Their Applications in the ASSESSMENTS & TESTS portal.',
      dueDate: endsAt,
      maxScore: 100,
      createdBy: adminUser?.id || 'admin',
    }
  });

  console.log(`\n🎉 Successfully created Assignment record!`);
  console.log(`Assignment ID: ${assignment.id}`);
  console.log(`Title: ${assignment.title}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error creating assessment:', e);
    process.exit(1);
  });
