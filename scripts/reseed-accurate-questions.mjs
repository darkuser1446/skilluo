import fs from "fs";
import { PrismaClient } from "@prisma/client";

// Load .env
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

const ACCURATE_QUESTIONS = [
  // ──────────────────────── SECTION A: MCQs (Q1 to Q20) ────────────────────────
  {
    num: 1,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q1]
What is the output of the following code?
\`\`\`cpp
int a = 7, b = 2;
cout << a / b << " " << a % b << " " << (float)a / b;
\`\`\``,
    options: ["3 1 3", "3 0 3.5", "3 1 3.5", "3.5 1 3.5"],
    correctAnswer: "3 1 3.5",
  },
  {
    num: 2,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q2]
What is the output?
\`\`\`cpp
int x = 5;
int y = x++ * 2;
cout << x << y;
\`\`\``,
    options: ["510", "612", "512", "610"],
    correctAnswer: "610",
  },
  {
    num: 3,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q3]
What is the output?
\`\`\`cpp
int a = 5;
cout << (a > 3 && a < 10 || a == 0);
\`\`\``,
    options: ["1", "true", "0", "Compile-time error"],
    correctAnswer: "1",
  },
  {
    num: 4,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q4]
What happens when this code is compiled and run?
\`\`\`cpp
for (int i = 0; i < 3; i++);
cout << i;
\`\`\``,
    options: ["Prints 3", "Prints 2", "Prints 0", "Compile-time error"],
    correctAnswer: "Compile-time error",
  },
  {
    num: 5,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q5]
What is the output?
\`\`\`cpp
int i = 1;
while (i <= 5) {
    if (i == 3) continue;
    cout << i;
    i++;
}
\`\`\``,
    options: ["12345", "1245", "12 and then an infinite loop", "123"],
    correctAnswer: "12 and then an infinite loop",
  },
  {
    num: 6,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q6]
What is the output?
\`\`\`cpp
int count = 0;
for (int i = 1; i <= 10; i++) {
    if (i % 3 == 0) continue;
    if (i == 8) break;
    count++;
}
cout << count;
\`\`\``,
    options: ["4", "5", "6", "7"],
    correctAnswer: "5",
  },
  {
    num: 7,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q7]
What is the output?
\`\`\`cpp
char c = 'A';
c += 2;
cout << c << (int)c;
\`\`\`
(ASCII value of 'A' is 65)`,
    options: ["C67", "C66", "67C", "E67"],
    correctAnswer: "C67",
  },
  {
    num: 8,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q8]
What is the output of:
\`\`\`cpp
cout << 5 / 2 * 2.0;
\`\`\``,
    options: ["5", "2.5", "4", "5.0"],
    correctAnswer: "4",
  },
  {
    num: 9,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q9]
What is the output?
\`\`\`cpp
int x = 0;
if (x = 5) cout << "A";
else cout << "B";
\`\`\``,
    options: ["B", "A", "Compile-time error", "AB"],
    correctAnswer: "A",
  },
  {
    num: 10,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q10]
How many times does the inner loop body execute in total?
\`\`\`cpp
for (int i = 1; i <= 4; i++)
    for (int j = i; j <= 4; j++)
        cout << "*";
\`\`\``,
    options: ["6", "8", "16", "10"],
    correctAnswer: "10",
  },
  {
    num: 11,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q11]
What is the output?
\`\`\`cpp
int x = 2;
switch (x) {
    case 1: cout << "A";
    case 2: cout << "B";
    case 3: cout << "C"; break;
    default: cout << "D";
}
\`\`\``,
    options: ["B", "BCD", "BC", "C"],
    correctAnswer: "BC",
  },
  {
    num: 12,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q12]
What is the output?
\`\`\`cpp
int i = 10;
do {
    cout << i;
    i++;
} while (i < 10);
\`\`\``,
    options: ["Nothing is printed", "10", "Infinite loop", "Compile-time error"],
    correctAnswer: "10",
  },
  {
    num: 13,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q13]
What is the output?
\`\`\`cpp
int x = 7.9;
cout << x;
\`\`\``,
    options: ["8", "7", "7.9", "Compile-time error"],
    correctAnswer: "7",
  },
  {
    num: 14,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q14]
What is the output?
\`\`\`cpp
int a = 5;
cout << !a + 1;
\`\`\``,
    options: ["0", "2", "1", "6"],
    correctAnswer: "1",
  },
  {
    num: 15,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q15]
What is the value of x?
\`\`\`cpp
int x = 2 + 3 * 4 % 5 - 1;
\`\`\``,
    options: ["3", "1", "4", "14"],
    correctAnswer: "3",
  },
  {
    num: 16,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q16]
Which of the following code fragments results in an infinite loop?`,
    options: [
      "for (int i = 10; i > 0; i--) { }",
      "int i = 0; while (i < 5); i++;",
      "int i = 0; while (i < 5) i++;",
      "do { } while (0);",
    ],
    correctAnswer: "int i = 0; while (i < 5); i++;",
  },
  {
    num: 17,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q17]
What pattern does this code print?
\`\`\`cpp
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3 - i; j++) cout << " ";
    for (int j = 1; j <= i; j++) cout << "* ";
    cout << endl;
}
\`\`\``,
    options: [
      "A centred pyramid",
      "A left-aligned right triangle",
      "An inverted triangle",
      "A rectangle",
    ],
    correctAnswer: "A centred pyramid",
  },
  {
    num: 18,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q18]
What is the output?
\`\`\`cpp
int n = 1234, r = 0;
while (n) {
    r = r * 10 + n % 10;
    n /= 10;
}
cout << r;
\`\`\``,
    options: ["1234", "10", "4321", "0"],
    correctAnswer: "4321",
  },
  {
    num: 19,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q19]
What is the output?
\`\`\`cpp
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) break;
        cout << i << j << " ";
    }
}
\`\`\``,
    options: ["00 01", "00 10 20", "00 01 02", "00"],
    correctAnswer: "00 10 20",
  },
  {
    num: 20,
    marks: 1,
    prompt: `[Section A: Multiple Choice Questions - Q20]
What is the output?
\`\`\`cpp
int x = 5;
cout << (x > 3 ? x < 10 ? "A" : "B" : "C");
\`\`\``,
    options: ["B", "C", "1", "A"],
    correctAnswer: "A",
  },

  // ──────────────────────── SECTION B: Error Finding (Q21 to Q22) ────────────────────────
  {
    num: 21,
    marks: 5,
    prompt: `[Section B: Error Finding - Q21]
(5 Marks) The program should read n and print the sum of the first n natural numbers. Identify each of the 5 errors by line number, explain what is wrong, and write the correction.

\`\`\`cpp
1   #include <iostream>
2   using namespace std
3   int Main()
4   {
5       int n, sum = 0;
6       cout >> "Enter a number: ";
7       cin >> n;
8       for (int i = 1, i <= n, i++)
9           sum += i;
10      cout << "Sum = " << Sum << endl;
11      return 0;
12  }
\`\`\``,
    options: [],
    correctAnswer: `1. Line 2: Missing semicolon -> using namespace std;
2. Line 3: Main() capitalized -> int main()
3. Line 6: Wrong operator >> -> cout << "Enter a number: ";
4. Line 8: Commas instead of semicolons in for loop -> for (int i = 1; i <= n; i++)
5. Line 10: Sum capitalized -> cout << "Sum = " << sum << endl;`,
  },
  {
    num: 22,
    marks: 5,
    prompt: `[Section B: Error Finding - Q22]
(5 Marks) The program should read n, print its factorial, print the digits 0 to 4, and report if n is zero. The errors can be syntax errors or logical errors. Identify 5 errors by line number, explain what is wrong, and write the correction.

\`\`\`cpp
1   #include <iostream>
2   using namespace std;
3
4   int main() {
5       int n;
6       cout << "Enter n: ";
7       cin >> n;
8       int fact;
9       for (int i = 1; i <= n; i++) {
10          fact = fact * i;
11      }
12      cout << "Factorial = " << fact << endl;
13      int i = 0;
14      while (i < 5);
15      {
16          cout << i;
17          i++;
18      }
19      if (n = 0)
20          cout << "Zero";
21      char ch = "A";
22      cout << ch
23      return 0;
24  }
\`\`\``,
    options: [],
    correctAnswer: `1. Line 8: fact is uninitialized (contains garbage) -> int fact = 1;
2. Line 14: Semicolon after while loop creates infinite loop -> while (i < 5)
3. Line 19: Assignment = instead of comparison == -> if (n == 0)
4. Line 21: Double quotes "A" used for char instead of single quotes -> char ch = 'A';
5. Line 22: Missing semicolon at end of statement -> cout << ch;`,
  },

  // ──────────────────────── SECTION C: Debugging (Q23) ────────────────────────
  {
    num: 23,
    marks: 10,
    prompt: `[Section C: Debugging - Q23]
(10 Marks) The program below is meant to read the number of rows n and print a centred star pyramid, followed by the total number of stars printed. For n = 4 the expected output is:
\`\`\`text
   *
  ***
 *****
*******
Total stars printed: 16
\`\`\`
The code below does not produce this output:

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    int stars;
    cout << "Enter number of rows: ";
    cin >> n;

    for (int i = 0; i <= n; i++) {
        for (int s = 1; s <= i; s++) {
            cout << " ";
        }
        for (int j = 1; j <= i; j++) {
            cout << "*";
            stars++;
            cout << endl;
        }
    }
    cout << "Total stars printed: " << stars;
    return 0;
}
\`\`\`

(a) Identify the 5 bugs and explain why each one is wrong. (5 marks)
(b) Write the complete corrected program. (3 marks)
(c) Dry run your corrected program for n = 3 and write the exact output. (2 marks)`,
    options: [],
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
  },

  // ──────────────────────── SECTION D: Output Prediction and Dry Run (Q24 to Q25) ────────────────────────
  {
    num: 24,
    marks: 5,
    prompt: `[Section D: Output Prediction and Dry Run - Q24]
(5 Marks) Write the exact output of the program and answer the sub-question:

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int n = 4;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            if (j <= n - i) cout << " ";
            else cout << j - (n - i);
        }
        cout << endl;
    }
    return 0;
}
\`\`\`

(a) Write the exact output, keeping the alignment. (4 marks)
(b) How many times is cout << " " executed in total? (1 mark)`,
    options: [],
    correctAnswer: `(a) Exact Output:
   1
  12
 123
1234

(b) Total space executions: 3 + 2 + 1 + 0 = 6 times.`,
  },
  {
    num: 25,
    marks: 5,
    prompt: `[Section D: Output Prediction and Dry Run - Q25]
(5 Marks) Write the exact output of the program. Show your dry run (trace table) for full marks. (1 mark for each of the four printed i:total pairs and 1 mark for the final line.)

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    int total = 0;
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) continue;
        if (i > 7) break;
        for (int j = 1; j <= i; j++) {
            if (j % 3 == 0) total += j;
            else total -= 1;
        }
        cout << i << ":" << total << " ";
    }
    cout << endl << "Final: " << total;
    return 0;
}
\`\`\``,
    options: [],
    correctAnswer: `1:-1 3:0 5:-1 7:3 
Final: 3`,
  },

  // ──────────────────────── SECTION E: Programming (Q26 to Q27) ────────────────────────
  {
    num: 26,
    marks: 5,
    prompt: `[Section E: Programming - Q26]
(5 Marks) Write a complete C++ program that reads n and prints the following number pyramid (sample for n = 5). Use only loops and conditions (no arrays or strings).

\`\`\`text
    1
   121
  12321
 1234321
123454321
\`\`\``,
    options: [],
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
} `,
  },
  {
    num: 27,
    marks: 5,
    prompt: `[Section E: Programming - Q27]
(5 Marks) Write a complete C++ program that reads a positive integer and prints:
(a) the number of digits
(b) the sum of its digits
(c) whether the number is a palindrome

For example, for input 1221 the output should be:
\`\`\`text
Digits: 4, Sum of digits: 6 and Palindrome
\`\`\`

Constraint: Use only loops and conditions (no arrays or strings).`,
    options: [],
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
  },
];

async function reseed() {
  const assessment = await prisma.assessment.findFirst({
    where: { title: { contains: "SUPER60 SKILLUP (Pen-Paper Test)" } },
    include: { questions: true },
  });

  if (!assessment) {
    throw new Error("Assessment not found in database!");
  }

  console.log(`Found Assessment: ${assessment.title} (ID: ${assessment.id})`);
  console.log(`Current questions count: ${assessment.questions.length}`);

  // Delete existing questions
  const del = await prisma.assessmentQuestion.deleteMany({
    where: { assessmentId: assessment.id },
  });
  console.log(`Deleted ${del.count} old question records.`);

  // Re-insert strictly in sequential order Q1 to Q27
  let totalMarks = 0;
  for (const q of ACCURATE_QUESTIONS) {
    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
      },
    });
    totalMarks += q.marks;
    console.log(`Created Q${q.num} (ID: ${created.id}, Marks: ${q.marks})`);
  }

  // Update total marks and instructions
  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      totalMarks,
      durationMinutes: 120, // 2 hours
      passingMarks: 36, // 60%
      instructions:
        "Attempt all questions. Section A carries 20 marks (1 mark each), Section B carries 10 marks (5 marks each), Section C carries 10 marks, Section D carries 10 marks (5 marks each), and Section E carries 10 marks (5 marks each). Total Marks: 60. Time: 2 hours. Assume #include <iostream> and using namespace std; wherever not shown.",
    },
  });

  console.log(`\nSuccessfully reseeded all 27 questions in exact Q1..Q27 order! Total marks: ${totalMarks}`);
}

reseed()
  .catch((e) => {
    console.error("Reseed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
