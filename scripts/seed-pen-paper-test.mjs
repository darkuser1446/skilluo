import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { jsPDF } from "jspdf";

// Load .env manually
if (fs.existsSync(".env")) {
  for (const line of fs.readFileSync(".env", "utf-8").split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#")) {
      const idx = t.indexOf("=");
      if (idx !== -1) {
        const k = t.slice(0, idx).trim();
        let v = t.slice(idx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

export const QUESTIONS_DATA = [
  // SECTION A: MCQs (Q1 to Q20, 1 Mark each = 20 Marks)
  {
    num: 1,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output of the following code?\nint a = 7, b = 2;\ncout << a / b << " " << a % b << " " << (float)a / b;`,
    options: ["3 1 3", "3 0 3.5", "3 1 3.5", "3.5 1 3.5"],
    correctAnswer: "3 1 3.5",
    marks: 1,
  },
  {
    num: 2,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint x = 5;\nint y = x++ * 2;\ncout << x << y;`,
    options: ["510", "612", "512", "610"],
    correctAnswer: "610",
    marks: 1,
  },
  {
    num: 3,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint a = 5;\ncout << (a > 3 && a < 10 || a == 0);`,
    options: ["1", "true", "0", "Compile-time error"],
    correctAnswer: "1",
    marks: 1,
  },
  {
    num: 4,
    section: "Section A: Multiple Choice Questions",
    prompt: `What happens when this code is compiled and run?\nfor (int i = 0; i < 3; i++);\ncout << i;`,
    options: ["Prints 3", "Prints 2", "Prints 0", "Compile-time error"],
    correctAnswer: "Compile-time error",
    marks: 1,
  },
  {
    num: 5,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint i = 1;\nwhile (i <= 5) {\n    if (i == 3) continue;\n    cout << i;\n    i++;\n}`,
    options: ["12345", "1245", "12 and then an infinite loop", "123"],
    correctAnswer: "12 and then an infinite loop",
    marks: 1,
  },
  {
    num: 6,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint count = 0;\nfor (int i = 1; i <= 10; i++) {\n    if (i % 3 == 0) continue;\n    if (i == 8) break;\n    count++;\n}\ncout << count;`,
    options: ["4", "5", "6", "7"],
    correctAnswer: "5",
    marks: 1,
  },
  {
    num: 7,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nchar c = 'A';\nc += 2;\ncout << c << (int)c;\n(ASCII value of 'A' is 65)`,
    options: ["C67", "C66", "67C", "E67"],
    correctAnswer: "C67",
    marks: 1,
  },
  {
    num: 8,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output of cout << 5 / 2 * 2.0;?`,
    options: ["5", "2.5", "4", "5.0"],
    correctAnswer: "4",
    marks: 1,
  },
  {
    num: 9,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint x = 0;\nif (x = 5) cout << "A";\nelse cout << "B";`,
    options: ["B", "A", "Compile-time error", "AB"],
    correctAnswer: "A",
    marks: 1,
  },
  {
    num: 10,
    section: "Section A: Multiple Choice Questions",
    prompt: `How many times does the inner loop body execute in total?\nfor (int i = 1; i <= 4; i++)\n    for (int j = i; j <= 4; j++)\n        cout << "*";`,
    options: ["6", "8", "16", "10"],
    correctAnswer: "10",
    marks: 1,
  },
  {
    num: 11,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint x = 2;\nswitch (x) {\n    case 1: cout << "A";\n    case 2: cout << "B";\n    case 3: cout << "C"; break;\n    default: cout << "D";\n}`,
    options: ["B", "BCD", "BC", "C"],
    correctAnswer: "BC",
    marks: 1,
  },
  {
    num: 12,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint i = 10;\ndo {\n    cout << i;\n    i++;\n} while (i < 10);`,
    options: ["Nothing is printed", "10", "Infinite loop", "Compile-time error"],
    correctAnswer: "10",
    marks: 1,
  },
  {
    num: 13,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint x = 7.9;\ncout << x;`,
    options: ["8", "7", "7.9", "Compile-time error"],
    correctAnswer: "7",
    marks: 1,
  },
  {
    num: 14,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint a = 5;\ncout << !a + 1;`,
    options: ["0", "2", "1", "6"],
    correctAnswer: "1",
    marks: 1,
  },
  {
    num: 15,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the value of x?\nint x = 2 + 3 * 4 % 5 - 1;`,
    options: ["3", "1", "4", "14"],
    correctAnswer: "3",
    marks: 1,
  },
  {
    num: 16,
    section: "Section A: Multiple Choice Questions",
    prompt: `Which of the following code fragments results in an infinite loop?`,
    options: [
      "for (int i = 10; i > 0; i--) { }",
      "int i = 0; while (i < 5); i++;",
      "int i = 0; while (i < 5) i++;",
      "do { } while (0);",
    ],
    correctAnswer: "int i = 0; while (i < 5); i++;",
    marks: 1,
  },
  {
    num: 17,
    section: "Section A: Multiple Choice Questions",
    prompt: `What pattern does this code print?\nfor (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 3 - i; j++) cout << " ";\n    for (int j = 1; j <= i; j++) cout << "* ";\n    cout << endl;\n}`,
    options: ["A centred pyramid", "A left-aligned right triangle", "An inverted triangle", "A rectangle"],
    correctAnswer: "A centred pyramid",
    marks: 1,
  },
  {
    num: 18,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint n = 1234, r = 0;\nwhile (n) {\n    r = r * 10 + n % 10;\n    n /= 10;\n}\ncout << r;`,
    options: ["1234", "10", "4321", "0"],
    correctAnswer: "4321",
    marks: 1,
  },
  {
    num: 19,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nfor (int i = 0; i < 3; i++) {\n    for (int j = 0; j < 3; j++) {\n        if (j == 1) break;\n        cout << i << j << " ";\n    }\n}`,
    options: ["00 01", "00 10 20", "00 01 02", "00"],
    correctAnswer: "00 10 20",
    marks: 1,
  },
  {
    num: 20,
    section: "Section A: Multiple Choice Questions",
    prompt: `What is the output?\nint x = 5;\ncout << (x > 3 ? x < 10 ? "A" : "B" : "C");`,
    options: ["B", "C", "1", "A"],
    correctAnswer: "A",
    marks: 1,
  },

  // SECTION B: Error Finding (2 × 5 = 10 Marks)
  {
    num: 21,
    section: "Section B: Error Finding",
    prompt: `(5 Marks) The program should read n and print the sum of the first n natural numbers. Identify each of the 5 errors by line number, explain what is wrong, and write the correction.\n\n1   #include <iostream>\n2   using namespace std\n3   int Main()\n4   {\n5       int n, sum = 0;\n6       cout >> "Enter a number: ";\n7       cin >> n;\n8       for (int i = 1, i <= n, i++)\n9           sum += i;\n10      cout << "Sum = " << Sum << endl;\n11      return 0;\n12  }`,
    options: null,
    correctAnswer: `1. Line 2: Missing semicolon -> using namespace std;
2. Line 3: Main() capitalized -> int main()
3. Line 6: Wrong operator >> -> cout << "Enter a number: ";
4. Line 8: Commas instead of semicolons in for loop -> for (int i = 1; i <= n; i++)
5. Line 10: Sum capitalized -> cout << "Sum = " << sum << endl;`,
    marks: 5,
  },
  {
    num: 22,
    section: "Section B: Error Finding",
    prompt: `(5 Marks) The program should read n, print its factorial, print the digits 0 to 4, and report if n is zero. Identify 5 errors by line number, explain what is wrong, and write the correction.\n\n1   #include <iostream>\n2   using namespace std;\n3\n4   int main() {\n5       int n;\n6       cout << "Enter n: ";\n7       cin >> n;\n8       int fact;\n9       for (int i = 1; i <= n; i++) {\n10          fact = fact * i;\n11      }\n12      cout << "Factorial = " << fact << endl;\n13      int i = 0;\n14      while (i < 5);\n15      {\n16          cout << i;\n17          i++;\n18      }\n19      if (n = 0)\n20          cout << "Zero";\n21      char ch = "A";\n22      cout << ch\n23      return 0;\n24  }`,
    options: null,
    correctAnswer: `1. Line 8: fact is uninitialized (contains garbage) -> int fact = 1;
2. Line 14: Semicolon after while loop creates infinite loop -> while (i < 5)
3. Line 19: Assignment = instead of comparison == -> if (n == 0)
4. Line 21: Double quotes "A" used for char instead of single quotes -> char ch = 'A';
5. Line 22: Missing semicolon at end of statement -> cout << ch;`,
    marks: 5,
  },

  // SECTION C: Debugging (10 Marks)
  {
    num: 23,
    section: "Section C: Debugging",
    prompt: `(10 Marks) The program below is meant to read number of rows n and print a centred star pyramid followed by total stars printed (for n = 4, expected 16 stars).\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    int stars;\n    cout << "Enter number of rows: ";\n    cin >> n;\n\n    for (int i = 0; i <= n; i++) {\n        for (int s = 1; s <= i; s++) {\n            cout << " ";\n        }\n        for (int j = 1; j <= i; j++) {\n            cout << "*";\n            stars++;\n            cout << endl;\n        }\n    }\n    cout << "Total stars printed: " << stars;\n    return 0;\n}\n\n(a) Identify the 5 bugs and explain why each is wrong. (5 marks)\n(b) Write the complete corrected program. (3 marks)\n(c) Dry run for n = 3 and write the exact output. (2 marks)`,
    options: null,
    correctAnswer: `(a) 5 Bugs:
1. stars uninitialized -> int stars = 0;
2. Outer loop runs 0 to n (n+1 rows) -> for (int i = 1; i <= n; i++)
3. Space loop prints i spaces instead of n - i spaces -> for (int s = 1; s <= n - i; s++)
4. Star loop prints i stars instead of 2*i - 1 stars -> for (int j = 1; j <= 2*i - 1; j++)
5. cout << endl; is inside the star loop, breaking every star into new line -> move cout << endl; outside star loop.

(b) Corrected Program:
#include <iostream>
using namespace std;
int main() {
    int n, stars = 0;
    cout << "Enter number of rows: ";
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) cout << " ";
        for (int j = 1; j <= 2 * i - 1; j++) {
            cout << "*";
            stars++;
        }
        cout << endl;
    }
    cout << "Total stars printed: " << stars << endl;
    return 0;
}

(c) Dry Run for n = 3 Output:
  *
 ***
*****
Total stars printed: 9`,
    marks: 10,
  },

  // SECTION D: Output Prediction and Dry Run (2 × 5 = 10 Marks)
  {
    num: 24,
    section: "Section D: Output Prediction and Dry Run",
    prompt: `(5 Marks) What is the exact output of the program?\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 4;\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (j <= n - i) cout << " ";\n            else cout << j - (n - i);\n        }\n        cout << endl;\n    }\n    return 0;\n}\n\n(a) Write the exact output, keeping the alignment. (4 marks)\n(b) How many times is cout << " " executed in total? (1 mark)`,
    options: null,
    correctAnswer: `(a) Exact Output:
   1
  12
 123
1234

(b) Total space executions: 3 + 2 + 1 + 0 = 6 times.`,
    marks: 5,
  },
  {
    num: 25,
    section: "Section D: Output Prediction and Dry Run",
    prompt: `(5 Marks) Write the exact output of the program.\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int total = 0;\n    for (int i = 1; i <= 10; i++) {\n        if (i % 2 == 0) continue;\n        if (i > 7) break;\n        for (int j = 1; j <= i; j++) {\n            if (j % 3 == 0) total += j;\n            else total -= 1;\n        }\n        cout << i << ":" << total << " ";\n    }\n    cout << endl << "Final: " << total;\n    return 0;\n}`,
    options: null,
    correctAnswer: `1:-1 3:0 5:-1 7:3 
Final: 3`,
    marks: 5,
  },

  // SECTION E: Programming (2 × 5 = 10 Marks)
  {
    num: 26,
    section: "Section E: Programming",
    prompt: `(5 Marks) Write a complete C++ program that reads n and prints the following number pyramid (sample for n = 5). Use only loops and conditions (no arrays or strings).\n    1\n   121\n  12321\n 1234321\n123454321`,
    options: null,
    correctAnswer: `#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Enter n: ";
    cin >> n;

    for (int i = 1; i <= n; i++) {
        for (int s = 1; s <= n - i; s++) cout << " ";
        for (int j = 1; j <= i; j++) cout << j;
        for (int j = i - 1; j >= 1; j--) cout << j;
        cout << endl;
    }
    return 0;
}`,
    marks: 5,
  },
  {
    num: 27,
    section: "Section E: Programming",
    prompt: `(5 Marks) Write a complete C++ program that reads a positive integer and prints (a) the number of digits, (b) the sum of its digits, and (c) whether the number is a palindrome. For example, for input 1221 output should be: Digits: 4, Sum of digits: 6 and Palindrome. Use only loops and conditions (no arrays or strings).`,
    options: null,
    correctAnswer: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cout << "Enter positive integer: ";
    cin >> n;

    long long temp = n;
    int digitCount = 0;
    int digitSum = 0;
    long long reversedNum = 0;

    if (temp == 0) {
        digitCount = 1;
        digitSum = 0;
        reversedNum = 0;
    } else {
        while (temp > 0) {
            int d = temp % 10;
            digitCount++;
            digitSum += d;
            reversedNum = reversedNum * 10 + d;
            temp /= 10;
        }
    }

    cout << "Digits: " << digitCount 
         << ", Sum of digits: " << digitSum 
         << " and " << (reversedNum == n ? "Palindrome" : "Not Palindrome") << endl;

    return 0;
}`,
    marks: 5,
  },
];

async function seedTest() {
  console.log("Seeding SUPER60 SKILLUP Pen-Paper Test in database...");

  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!workshop) {
    throw new Error("No active workshop found!");
  }

  const title = "SUPER60 SKILLUP (Pen-Paper Test): Basics to Loops and Pattern Printing";

  // Check if test already exists
  let assessment = await prisma.assessment.findFirst({
    where: {
      workshopId: workshop.id,
      title: title,
    },
    include: { questions: true },
  });

  // IMPORTANT: As requested, test must NOT be live now!
  // startsAt set in the future, targetAudience set to DRAFT so students cannot see/start it
  const futureStartsAt = new Date("2026-11-20T09:00:00.000Z");
  const futureEndsAt = new Date("2026-11-20T11:00:00.000Z");

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: {
        workshopId: workshop.id,
        title: title,
        description: "SUPER60 SKILLUP Pen-Paper Test covering C++ Fundamentals, Conditionals, Loops, Pattern Printing, Error Finding, Debugging, Output Prediction, and Core Programming.",
        type: "TEST",
        totalMarks: 60,
        passingMarks: 24, // 40%
        durationMinutes: 120, // 2 hours
        instructions: "Attempt all questions. Section A carries 20 marks (1 mark each), Section B carries 10 marks (5 marks each), Section C carries 10 marks, Section D carries 10 marks (5 marks each), and Section E carries 10 marks (5 marks each). Assume #include <iostream> and using namespace std; wherever they are not shown.",
        targetAudience: "DRAFT", // CRITICAL: Kept as DRAFT so it is NOT LIVE for students
        targetLabIds: [],
        startsAt: futureStartsAt,
        endsAt: futureEndsAt,
      },
      include: { questions: true },
    });
    console.log(`Created Assessment: ${assessment.id} (${assessment.title})`);
  } else {
    // Update metadata to ensure it remains NOT LIVE
    assessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        totalMarks: 60,
        durationMinutes: 120,
        targetAudience: "DRAFT",
        startsAt: futureStartsAt,
        endsAt: futureEndsAt,
      },
      include: { questions: true },
    });
    console.log(`Updated Assessment: ${assessment.id} to ensure DRAFT / NOT LIVE state`);
  }

  // Create or update questions
  if (assessment.questions.length === 0) {
    for (const q of QUESTIONS_DATA) {
      await prisma.assessmentQuestion.create({
        data: {
          assessmentId: assessment.id,
          prompt: `[${q.section} - Q${q.num}]\n${q.prompt}`,
          options: q.options ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
        },
      });
    }
    console.log(`Successfully inserted all ${QUESTIONS_DATA.length} questions into Assessment!`);
  } else {
    console.log(`Assessment already has ${assessment.questions.length} questions.`);
  }

  return assessment;
}

function generateQuestionPaperPdf() {
  console.log("Generating printable Question Paper PDF...");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210
  const pageHeight = doc.internal.pageSize.getHeight(); // 297
  const margin = 14;
  let y = 14;

  const brandDark = [17, 24, 39];
  const brandOrange = [240, 124, 39];

  // Header Banner
  doc.setFillColor(...brandDark);
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setFillColor(...brandOrange);
  doc.rect(0, 26, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SUPER 60 // SKILL UP 2026", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  doc.text("PEN-PAPER ASSESSMENT • BASICS TO LOOPS AND PATTERN PRINTING", margin, 18);

  doc.setFontSize(8);
  doc.text("Max Marks: 60 • Time: 2 Hours (120 Mins)", pageWidth - margin, 18, { align: "right" });

  y = 34;

  // Student details fill-in box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("CANDIDATE NAME: ___________________________________", margin + 4, y + 6);
  doc.text("ROLL NO: _____________________", margin + 115, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("LAB TRACK / BATCH: _________________________________", margin + 4, y + 12);
  doc.text("DATE: _______________________", margin + 115, y + 12);

  y += 20;

  // Instructions Box
  doc.setFillColor(255, 247, 237); // Orange tint
  doc.setDrawColor(...brandOrange);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(154, 52, 18);
  doc.text("GENERAL INSTRUCTIONS:", margin + 4, y + 4.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(67, 20, 7);
  const inst = "1. Attempt all questions. Section A (20 Marks), Section B (10 Marks), Section C (10 Marks), Section D (10 Marks), Section E (10 Marks).\n2. Assume #include <iostream> and using namespace std; wherever they are not shown.\n3. Show clear trace tables for output prediction and dry runs.";
  doc.text(inst, margin + 4, y + 8.5);

  y += 18;

  let currentSection = "";

  for (const q of QUESTIONS_DATA) {
    // Check if new section header needed
    if (q.section !== currentSection) {
      currentSection = q.section;

      if (y > pageHeight - 35) {
        doc.addPage();
        y = 16;
      }

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, pageWidth - margin * 2, 6.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(currentSection.toUpperCase(), margin + 3, y + 4.5);

      y += 10;
    }

    if (y > pageHeight - 30) {
      doc.addPage();
      y = 16;
    }

    // Question Number & Marks badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Q${q.num}. [${q.marks} Mark${q.marks > 1 ? "s" : ""}]`, margin, y);

    // Prompt lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const promptText = q.prompt;
    const promptLines = doc.splitTextToSize(promptText, pageWidth - margin * 2 - 20);
    doc.text(promptLines, margin + 20, y);
    y += promptLines.length * 3.8 + 2;

    // Options (for Section A)
    if (q.options && q.options.length > 0) {
      const letters = ["A", "B", "C", "D"];
      const colW = (pageWidth - margin * 2 - 20) / 2;

      q.options.forEach((opt, idx) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 16;
        }
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const optX = margin + 20 + col * colW;
        const optY = y + row * 4.5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...brandOrange);
        doc.text(`${letters[idx]})`, optX, optY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(opt, optX + 6, optY);
      });

      y += Math.ceil(q.options.length / 2) * 4.5 + 3;
    } else {
      y += 2;
    }
  }

  // Running footer for all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Super 60 Systems & Engineering Excellence • Pen-Paper Assessment (Basics to Loops)",
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 8.5, pageWidth - margin, pageHeight - 8.5);
  }

  const publicTestsDir = path.resolve("public/tests");
  if (!fs.existsSync(publicTestsDir)) fs.mkdirSync(publicTestsDir, { recursive: true });

  const artifactDir = path.resolve("C:\\Users\\uttim\\.gemini\\antigravity\\brain\\c503d66e-ff99-496f-862f-d7f70f08bccf");
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  const pdfFileName = "SUPER60_SkillUp_Pen_Paper_Test_Basics_to_Loops.pdf";
  const publicPdf = path.join(publicTestsDir, pdfFileName);
  const artifactPdf = path.join(artifactDir, pdfFileName);

  const buffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(publicPdf, buffer);
  fs.writeFileSync(artifactPdf, buffer);

  console.log(`Question Paper PDF saved: ${publicPdf}`);
  console.log(`Artifact PDF saved: ${artifactPdf}`);
}

async function main() {
  await seedTest();
  generateQuestionPaperPdf();
  await prisma.$disconnect();
  console.log("Complete setup successful!");
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
