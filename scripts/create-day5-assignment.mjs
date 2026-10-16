import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const DAY5_MCQS = [
  {
    num: 1,
    prompt: "In C++, which statement about a `switch` statement is correct?",
    options: [
      "A `switch` statement can directly use any data type, including `float` and `string`.",
      "If `break` is missing, execution can continue into the next case.",
      "The `default` case must always be written first.",
      "A `switch` statement can contain only two cases.",
    ],
    correctAnswer: "If `break` is missing, execution can continue into the next case.",
  },
  {
    num: 2,
    prompt: "What is the main difference between a `while` loop and a `do-while` loop in C++?",
    options: [
      "A `while` loop always runs at least once.",
      "A `do-while` loop checks its condition before running.",
      "A `do-while` loop runs at least once before checking its condition.",
      "Both loops always run the same number of times.",
    ],
    correctAnswer: "A `do-while` loop runs at least once before checking its condition.",
  },
  {
    num: 3,
    prompt: "A voting program allows a person to vote only if their age is at least 18 and their voter ID is valid. Which condition is correct?",
    options: [
      "if (age >= 18 || validID)",
      "if (age > 18 && !validID)",
      "if (age >= 18 && validID)",
      "if (age < 18 && validID)",
    ],
    correctAnswer: "if (age >= 18 && validID)",
  },
  {
    num: 4,
    prompt: "In a supermarket billing program, what is the correct way to calculate the total bill when each item has a different price and quantity?",
    options: [
      "Add each item's quantity to the total bill.",
      "Add each item's price to the total bill only once.",
      "Multiply each item's price by its quantity and add the result to the total bill.",
      "Multiply the total bill by the number of items after every purchase.",
    ],
    correctAnswer: "Multiply each item's price by its quantity and add the result to the total bill.",
  },
  {
    num: 5,
    prompt: "Which statement about `break` and `continue` is correct in a loop?",
    options: [
      "`break` skips only the current iteration, while `continue` ends the loop.",
      "`break` ends the loop, while `continue` skips the remaining statements in the current iteration.",
      "Both statements always end the loop.",
      "Both statements restart the program.",
    ],
    correctAnswer: "`break` ends the loop, while `continue` skips the remaining statements in the current iteration.",
  },
  {
    num: 6,
    prompt: "A toll plaza accepts vehicle types 1, 2 and 3. If the user enters another number, the program must show an error and must not change the total toll. Which approach is correct?",
    options: [
      "Add the toll first and check the vehicle type afterward.",
      "Count every input as a valid vehicle.",
      "Use a `default` case to report invalid input without changing the toll or vehicle count.",
      "Ignore the vehicle type and add a fixed toll for every input.",
    ],
    correctAnswer: "Use a `default` case to report invalid input without changing the toll or vehicle count.",
  },
  {
    num: 7,
    prompt: `Consider the following code:

\`\`\`cpp
int i = 1, sum = 0;

while (i <= 6) {
    if (i % 2 == 0) {
        i++;
        continue;
    }

    sum += i;
    i++;
}

cout << sum;
\`\`\`

What is the output?`,
    options: ["12", "9", "16", "21"],
    correctAnswer: "9",
  },
  {
    num: 8,
    prompt: `What will be the output of the following C++ code?

\`\`\`cpp
int x = 3, total = 0;

for (int i = 1; i <= 4; i++) {
    switch (i) {
        case 1:
            total += x;
            break;
        case 2:
            total *= 2;
            break;
        case 3:
            total += i * x;
        case 4:
            total -= 2;
            break;
    }
}

cout << total;
\`\`\``,
    options: ["10", "13", "16", "19"],
    correctAnswer: "13",
  },
  {
    num: 9,
    prompt: `A cricket scoring program stores the runs scored on each ball. What will the following code print?

\`\`\`cpp
int runs[] = {1, 4, 0, 2, 6, 0, 3};
int total = 0, scoringBalls = 0, dotBalls = 0;

for (int i = 0; i < 7; i++) {
    total += runs[i];

    if (runs[i] == 0)
        dotBalls++;
    else
        scoringBalls++;
}

cout << total << " " << scoringBalls << " " << dotBalls;
\`\`\``,
    options: ["16 5 2", "16 7 2", "13 5 2", "16 2 5"],
    correctAnswer: "16 5 2",
  },
  {
    num: 10,
    prompt: `A shop has 25 items in stock. It receives requests to sell 8, 12, 9 and 5 items. A request is accepted only when enough stock is available. What will be the final stock and total number of items sold?

\`\`\`cpp
int stock = 25, sold = 0;
int request[] = {8, 12, 9, 5};

for (int i = 0; i < 4; i++) {
    if (request[i] <= stock) {
        stock -= request[i];
        sold += request[i];
    }
}

cout << stock << " " << sold;
\`\`\``,
    options: ["0 25", "5 20", "5 25", "0 30"],
    correctAnswer: "0 25",
  },
  {
    num: 11,
    prompt: `What is the output of this toll plaza program?

\`\`\`cpp
int toll = 0, count = 0;
int vehicle[] = {1, 3, 2, 4, 1, 2};

for (int i = 0; i < 6; i++) {
    switch (vehicle[i]) {
        case 1:
            toll += 50;
            count++;
            break;
        case 2:
            toll += 100;
            count++;
            break;
        case 3:
            toll += 200;
            count++;
            break;
        default:
            continue;
    }
}

cout << toll << " " << count;
\`\`\``,
    options: ["500 5", "550 6", "450 5", "500 6"],
    correctAnswer: "500 5",
  },
  {
    num: 12,
    prompt: `A supermarket gives a 12% discount when the subtotal is at least ₹8,000. After the discount, it charges 5% tax if the remaining amount is at least ₹5,000; otherwise, it charges 2% tax. What is the final bill for a subtotal of ₹10,000?

\`\`\`cpp
double subtotal = 10000;
double discount = 0;

if (subtotal >= 8000)
    discount = subtotal * 0.12;

double amount = subtotal - discount;
double tax;

if (amount >= 5000)
    tax = amount * 0.05;
else
    tax = amount * 0.02;

cout << amount + tax;
\`\`\``,
    options: ["₹10,000", "₹9,240", "₹9,240 exactly after discount and tax", "₹9,240 is the discounted amount before tax"],
    correctAnswer: "₹9,240",
  },
  {
    num: 13,
    prompt: `What will this nested-loop program print?

\`\`\`cpp
int total = 0;

for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= 5; j++) {
        if (i + j > 6)
            break;

        total += i * j;
    }
}

cout << total;
\`\`\``,
    options: ["70", "85", "95", "105"],
    correctAnswer: "70",
  },
  {
    num: 14,
    prompt: `An inventory system processes sales and restocking operations. What are the final values of \`stock\` and \`sold\`?

\`\`\`cpp
int stock = 12, sold = 0;

int action[] = {1, 2, 1, 1, 2, 1};
int qty[] = {5, 7, 10, 4, 6, 3};

for (int i = 0; i < 6; i++) {
    switch (action[i]) {
        case 1:
            if (qty[i] <= stock) {
                stock -= qty[i];
                sold += qty[i];
            }
            break;

        case 2:
            stock += qty[i];
            break;
    }
}

cout << stock << " " << sold;
\`\`\``,
    options: ["3 12", "7 12", "3 15", "9 12"],
    correctAnswer: "3 12",
  },
  {
    num: 15,
    prompt: `A voting machine has three candidates. Option 1 adds a vote to Candidate A, option 2 adds a vote to Candidate B, option 3 resets both candidates' votes, and every other input increases the invalid vote count. What is the final output?

\`\`\`cpp
int A = 0, B = 0, invalid = 0;
int choice[] = {1, 2, 1, 4, 2, 3, 1, 5, 2, 4};

for (int i = 0; i < 10; i++) {
    switch (choice[i]) {
        case 1:
            A++;
            break;
        case 2:
            B++;
            break;
        case 3:
            A = 0;
            B = 0;
            break;
        default:
            invalid++;
    }
}

cout << A << " " << B << " " << invalid;
\`\`\``,
    options: ["1 2 3", "2 2 2", "1 2 2", "3 2 3"],
    correctAnswer: "1 2 3",
  },
  {
    num: 16,
    prompt: `A cricket program uses the following rules: a wide adds one extra run but does not count as a legal ball, a wicket counts as a legal ball but adds no runs, and every other value is the number of runs scored from the bat. What is the output?

\`\`\`cpp
int total = 0, legalBalls = 0, wickets = 0;
int event[] = {4, -1, 2, -2, 6, 1, -1, 3};

for (int i = 0; i < 8; i++) {
    if (event[i] == -1) {
        total++;
    }
    else if (event[i] == -2) {
        wickets++;
        legalBalls++;
    }
    else {
        total += event[i];
        legalBalls++;
    }
}

cout << total << " " << legalBalls << " " << wickets;
\`\`\``,
    options: ["18 6 1", "18 7 1", "17 7 1", "18 8 2"],
    correctAnswer: "18 6 1",
  },
  {
    num: 17,
    prompt: `An inventory program starts with 20 items. A sale is accepted only if enough stock is available. Restocking adds items but does not count as a sale. Each item sold earns ₹35. What are the final stock and revenue?

\`\`\`cpp
int stock = 20, revenue = 0;
int price = 35;

int action[] = {1, 2, 1, 1, 2, 1, 1};
int qty[] = {8, 6, 10, 5, 12, 7, 4};

for (int i = 0; i < 7; i++) {
    if (action[i] == 1) {
        if (qty[i] <= stock) {
            stock -= qty[i];
            revenue += qty[i] * price;
        }
    }
    else if (action[i] == 2) {
        stock += qty[i];
    }
}

cout << stock << " " << revenue;
\`\`\``,
    options: ["4 840", "4 805", "7 840", "8 840"],
    correctAnswer: "4 840",
  },
  {
    num: 18,
    prompt: `A toll plaza has a collection limit of ₹500. A vehicle is accepted only if adding its toll does not exceed this limit. Vehicle types 1, 2 and 3 pay ₹50, ₹100 and ₹200. What is the final collection and number of accepted vehicles?

\`\`\`cpp
int toll = 0, count = 0;
int vehicles[] = {3, 2, 1, 3, 2, 1};

for (int i = 0; i < 6; i++) {
    int fee = 0;

    switch (vehicles[i]) {
        case 1: fee = 50; break;
        case 2: fee = 100; break;
        case 3: fee = 200; break;
    }

    if (fee > 0 && toll + fee <= 500) {
        toll += fee;
        count++;
    }
}

cout << toll << " " << count;
\`\`\``,
    options: ["500 4", "450 4", "500 5", "550 5"],
    correctAnswer: "500 5",
  },
  {
    num: 19,
    prompt: `A supermarket applies a 15% discount for bills of ₹10,000 or more. Members receive an extra ₹500 discount after the percentage discount. Tax is 5% of the amount after all discounts. What is the final bill?

\`\`\`cpp
double subtotal = 15000;
bool member = true;

double discount = 0;

if (subtotal >= 10000)
    discount = subtotal * 0.15;
else if (subtotal >= 5000)
    discount = subtotal * 0.10;

if (member)
    discount += 500;

double amount = subtotal - discount;

if (amount < 0)
    amount = 0;

double tax = amount * 0.05;

cout << amount + tax;
\`\`\``,
    options: ["₹12,075", "₹12,600", "₹12,337.50", "₹13,125"],
    correctAnswer: "₹12,337.50",
  },
  {
    num: 20,
    prompt: `A menu-driven inventory program uses option 1 to sell items, option 2 to restock items, option 3 to display stock and total items sold, and option 0 to stop. A sale is accepted only when enough stock is available. What is the complete output?

\`\`\`cpp
int stock = 15, sold = 0;

int choice[] = {1, 2, 1, 3, 1, 2, 3, 0};
int qty[] = {7, 5, 8, 0, 4, 3, 0, 0};

int i = 0;

while (i < 8) {
    switch (choice[i]) {
        case 1:
            if (qty[i] <= stock) {
                stock -= qty[i];
                sold += qty[i];
            }
            break;

        case 2:
            stock += qty[i];
            break;

        case 3:
            cout << stock << ":" << sold << " ";
            break;

        case 0:
            i = 8;
            break;
    }

    i++;
}

cout << stock << " " << sold;
\`\`\``,
    options: ["13:7 16:7 16 7", "13:7 16:7 16 10", "8:7 11:7 11 7", "13:7 16:10 16 10"],
    correctAnswer: "13:7 16:7 16 7",
  },
];

async function main() {
  const workshop = await prisma.workshop.findFirst({
    where: { status: 'ACTIVE' },
    include: { labs: true },
  });

  if (!workshop) throw new Error('No active workshop found');

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminId = admin ? admin.id : 'cmuzylrwo0002jx069q35qvyt';
  const labIds = workshop.labs.map((l) => l.id);

  const title = 'Day 5 : Advanced CLI & Project';
  const dueDate = new Date('2026-10-30T18:30:00.000Z');

  let description = `# Day 5 : Advanced CLI & Project\n\n## 20 Advanced C++ Multiple-Choice Questions (MCQs)\n\n**Instructions:** Choose the correct answer from the four options given for each question.\n\n---\n\n`;

  for (const q of DAY5_MCQS) {
    description += `### Question ${q.num}\n\n${q.prompt}\n\n`;
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, idx) => {
      description += `**${letters[idx]}.** ${opt}\n\n`;
    });
    description += `---\n\n`;
  }

  // 1. Assignment record
  const existingAssignment = await prisma.assignment.findFirst({
    where: { workshopId: workshop.id, title },
  });

  if (existingAssignment) {
    console.log(`Updating Assignment (ID: ${existingAssignment.id})...`);
    await prisma.assignment.update({
      where: { id: existingAssignment.id },
      data: {
        description,
        dueDate,
        maxScore: 100,
        attachmentUrl: '/assignments/Day_5_Advanced_CLI_and_Project_20_MCQ_Assignment.pdf',
      },
    });
  } else {
    console.log('Creating Assignment...');
    await prisma.assignment.create({
      data: {
        workshopId: workshop.id,
        labId: null,
        title,
        description,
        dueDate,
        maxScore: 100,
        attachmentUrl: '/assignments/Day_5_Advanced_CLI_and_Project_20_MCQ_Assignment.pdf',
        createdBy: adminId,
      },
    });
  }

  // 2. Assessment record
  const existingAssessment = await prisma.assessment.findFirst({
    where: { workshopId: workshop.id, title },
  });

  if (existingAssessment) {
    console.log(`Updating Assessment (ID: ${existingAssessment.id})...`);
    await prisma.assessmentQuestion.deleteMany({
      where: { assessmentId: existingAssessment.id },
    });

    await prisma.assessment.update({
      where: { id: existingAssessment.id },
      data: {
        targetAudience: 'LABS',
        targetLabIds: labIds,
        type: 'ASSIGNMENT',
        totalMarks: 100,
        passingMarks: 50,
        durationMinutes: 60,
        allowedViolations: 0,
        description: 'Super 60 C++ Assignment: 20 Advanced C++ Multiple-Choice Questions (MCQs) covering loops, switch-case, real-world CLI simulation logic (voting, supermarket billing, inventory, toll plaza, cricket scoring).',
        instructions: 'Advanced CLI & Project Assignment: 20 MCQs on C++ CLI architecture and decision logic. Open-practice assignment: Self-paced, no proctoring, no tab-switch lockouts.',
        startsAt: new Date('2026-10-16T10:00:00.000Z'),
        endsAt: dueDate,
        questions: {
          create: DAY5_MCQS.map((q) => ({
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: 5,
          })),
        },
      },
    });
  } else {
    console.log('Creating Assessment...');
    await prisma.assessment.create({
      data: {
        workshopId: workshop.id,
        labId: null,
        targetAudience: 'LABS',
        targetLabIds: labIds,
        title,
        description: 'Super 60 C++ Assignment: 20 Advanced C++ Multiple-Choice Questions (MCQs) covering loops, switch-case, real-world CLI simulation logic (voting, supermarket billing, inventory, toll plaza, cricket scoring).',
        type: 'ASSIGNMENT',
        totalMarks: 100,
        passingMarks: 50,
        durationMinutes: 60,
        allowedViolations: 0,
        instructions: 'Advanced CLI & Project Assignment: 20 MCQs on C++ CLI architecture and decision logic. Open-practice assignment: Self-paced, no proctoring, no tab-switch lockouts.',
        startsAt: new Date('2026-10-16T10:00:00.000Z'),
        endsAt: dueDate,
        questions: {
          create: DAY5_MCQS.map((q) => ({
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: 5,
          })),
        },
      },
    });
  }

  console.log('Day 5 assignment & assessment created/updated successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
