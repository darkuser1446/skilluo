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

const FORMATTED_QUESTIONS = [
  // SECTION A: MCQs (Q1 to Q20, 1 Mark each = 20 Marks)
  {
    num: 1,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q1]
What is the output of the following code?
\`\`\`cpp
int a = 7, b = 2;
cout << a / b << " " << a % b << " " << (float)a / b;
\`\`\``,
  },
  {
    num: 2,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q2]
What is the output?
\`\`\`cpp
int x = 5;
int y = x++ * 2;
cout << x << y;
\`\`\``,
  },
  {
    num: 3,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q3]
What is the output?
\`\`\`cpp
int a = 5;
cout << (a > 3 && a < 10 || a == 0);
\`\`\``,
  },
  {
    num: 4,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q4]
What happens when this code is compiled and run?
\`\`\`cpp
for (int i = 0; i < 3; i++);
cout << i;
\`\`\``,
  },
  {
    num: 5,
    section: "Section A: Multiple Choice Questions",
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
  },
  {
    num: 6,
    section: "Section A: Multiple Choice Questions",
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
  },
  {
    num: 7,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q7]
What is the output?
\`\`\`cpp
char c = 'A';
c += 2;
cout << c << (int)c;
\`\`\`
(ASCII value of 'A' is 65)`,
  },
  {
    num: 8,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q8]
What is the output of:
\`\`\`cpp
cout << 5 / 2 * 2.0;
\`\`\``,
  },
  {
    num: 9,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q9]
What is the output?
\`\`\`cpp
int x = 0;
if (x = 5) cout << "A";
else cout << "B";
\`\`\``,
  },
  {
    num: 10,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q10]
How many times does the inner loop body execute in total?
\`\`\`cpp
for (int i = 1; i <= 4; i++)
    for (int j = i; j <= 4; j++)
        cout << "*";
\`\`\``,
  },
  {
    num: 11,
    section: "Section A: Multiple Choice Questions",
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
  },
  {
    num: 12,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q12]
What is the output?
\`\`\`cpp
int i = 10;
do {
    cout << i;
    i++;
} while (i < 10);
\`\`\``,
  },
  {
    num: 13,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q13]
What is the output?
\`\`\`cpp
int x = 7.9;
cout << x;
\`\`\``,
  },
  {
    num: 14,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q14]
What is the output?
\`\`\`cpp
int a = 5;
cout << !a + 1;
\`\`\``,
  },
  {
    num: 15,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q15]
What is the value of x?
\`\`\`cpp
int x = 2 + 3 * 4 % 5 - 1;
\`\`\``,
  },
  {
    num: 16,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q16]
Which of the following code fragments results in an infinite loop?`,
  },
  {
    num: 17,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q17]
What pattern does this code print?
\`\`\`cpp
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3 - i; j++) cout << " ";
    for (int j = 1; j <= i; j++) cout << "* ";
    cout << endl;
}
\`\`\``,
  },
  {
    num: 18,
    section: "Section A: Multiple Choice Questions",
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
  },
  {
    num: 19,
    section: "Section A: Multiple Choice Questions",
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
  },
  {
    num: 20,
    section: "Section A: Multiple Choice Questions",
    prompt: `[Section A: Multiple Choice Questions - Q20]
What is the output?
\`\`\`cpp
int x = 5;
cout << (x > 3 ? x < 10 ? "A" : "B" : "C");
\`\`\``,
  },

  // SECTION B: Error Finding (2 × 5 = 10 Marks)
  {
    num: 21,
    section: "Section B: Error Finding",
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
  },
  {
    num: 22,
    section: "Section B: Error Finding",
    prompt: `[Section B: Error Finding - Q22]
(5 Marks) The program should read n, print its factorial, print the digits 0 to 4, and report if n is zero. Identify 5 errors by line number, explain what is wrong, and write the correction.

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
  },

  // SECTION C: Debugging (10 Marks)
  {
    num: 23,
    section: "Section C: Debugging",
    prompt: `[Section C: Debugging - Q23]
(10 Marks) The program below is meant to read the number of rows n and print a centred star pyramid, followed by the total number of stars printed. For n = 4 the expected output is:
   *
  ***
 *****
*******
Total stars printed: 16
The code below does not produce this output.

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
  },

  // SECTION D: Output Prediction and Dry Run (2 × 5 = 10 Marks)
  {
    num: 24,
    section: "Section D: Output Prediction and Dry Run",
    prompt: `[Section D: Output Prediction and Dry Run - Q24]
(5 Marks)
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
  },
  {
    num: 25,
    section: "Section D: Output Prediction and Dry Run",
    prompt: `[Section D: Output Prediction and Dry Run - Q25]
(5 Marks) Write the exact output of the program. Show your dry run for full marks.

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
  },

  // SECTION E: Programming (2 × 5 = 10 Marks)
  {
    num: 26,
    section: "Section E: Programming",
    prompt: `[Section E: Programming - Q26]
(5 Marks) Write a complete C++ program that reads n and prints the following number pyramid (sample for n = 5). Use only loops and conditions (no arrays or strings).

\`\`\`text
    1
   121
  12321
 1234321
123454321
\`\`\``,
  },
  {
    num: 27,
    section: "Section E: Programming",
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
  },
];

async function updatePrompts() {
  const assessment = await prisma.assessment.findFirst({
    where: { title: { contains: "SUPER60 SKILLUP (Pen-Paper Test)" } },
    include: { questions: true },
  });

  if (!assessment) throw new Error("Assessment not found");

  console.log(`Updating ${assessment.questions.length} questions for: ${assessment.title}`);

  for (const fq of FORMATTED_QUESTIONS) {
    const matchingQ = assessment.questions.find((q) =>
      q.prompt.includes(`Q${fq.num}]`) || q.prompt.includes(`Q${fq.num}.`)
    );

    if (matchingQ) {
      await prisma.assessmentQuestion.update({
        where: { id: matchingQ.id },
        data: { prompt: fq.prompt },
      });
      console.log(`Updated Q${fq.num} prompt with structured code fences.`);
    } else {
      console.warn(`Could not find question for Q${fq.num}`);
    }
  }

  console.log("All questions successfully updated in the database!");
  await prisma.$disconnect();
}

updatePrompts().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
