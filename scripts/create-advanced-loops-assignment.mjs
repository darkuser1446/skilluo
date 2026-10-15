import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  {
    prompt: 'Which statement best explains the difference between "while" and "do-while" loops?',
    options: [
      'Both loops always execute at least once.',
      'A "while" loop checks the condition before execution, while a "do-while" loop checks it afterward.',
      'A "do-while" loop cannot execute more than once.',
      'A "while" loop cannot use a counter variable.'
    ],
    correctAnswer: 'A "while" loop checks the condition before execution, while a "do-while" loop checks it afterward.',
    marks: 5
  },
  {
    prompt: 'What is the main purpose of nested loops in pattern printing?',
    options: [
      'To terminate a program.',
      'To execute a function only once.',
      'To control rows and columns or repeated operations within each row.',
      'To prevent conditions from being checked.'
    ],
    correctAnswer: 'To control rows and columns or repeated operations within each row.',
    marks: 5
  },
  {
    prompt: 'What happens when the condition of a "while" loop is initially false?',
    options: [
      'The loop executes exactly once.',
      'The loop executes twice.',
      'The loop body does not execute.',
      'The program terminates immediately.'
    ],
    correctAnswer: 'The loop body does not execute.',
    marks: 5
  },
  {
    prompt: 'What is the primary purpose of the "break" statement inside a loop?',
    options: [
      'To skip the current iteration.',
      'To terminate the nearest enclosing loop.',
      'To restart the loop.',
      'To pause the program temporarily.'
    ],
    correctAnswer: 'To terminate the nearest enclosing loop.',
    marks: 5
  },
  {
    prompt: 'What is the difference between "break" and "continue"?',
    options: [
      'Both terminate the entire program.',
      '"break" skips one iteration, while "continue" terminates the loop.',
      '"break" terminates the loop, while "continue" skips the remaining statements in the current iteration.',
      'Both restart the loop from the beginning.'
    ],
    correctAnswer: '"break" terminates the loop, while "continue" skips the remaining statements in the current iteration.',
    marks: 5
  },
  {
    prompt: 'Which component of a "for" loop updates the loop control variable?',
    options: [
      'Initialization',
      'Condition',
      'Update expression',
      'Header file'
    ],
    correctAnswer: 'Update expression',
    marks: 5
  },
  {
    prompt: 'What is a common cause of an infinite loop?',
    options: [
      'Declaring an integer variable.',
      'Using a condition that never becomes false.',
      'Printing a message inside the loop.',
      'Using a nested loop.'
    ],
    correctAnswer: 'Using a condition that never becomes false.',
    marks: 5
  },
  {
    prompt: 'Which operator is used to obtain the remainder after division?',
    options: [
      '"/"',
      '"%"',
      '"*"',
      '"+"'
    ],
    correctAnswer: '"%"',
    marks: 5
  },
  {
    prompt: 'Which operator is commonly used to extract the last digit of a positive integer?',
    options: [
      '"n / 10"',
      '"n % 10"',
      '"n * 10"',
      '"n + 10"'
    ],
    correctAnswer: '"n % 10"',
    marks: 5
  },
  {
    prompt: 'What is the purpose of integer division by 10 when reversing a positive integer?',
    options: [
      'To multiply the number by ten.',
      'To extract the last digit.',
      'To remove the last digit from the original number.',
      'To calculate the square of the number.'
    ],
    correctAnswer: 'To remove the last digit from the original number.',
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int sum = 0;

    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0)
            sum += i;
    }

    cout << sum;
    return 0;
}`,
    options: [
      '25',
      '30',
      '45',
      '55'
    ],
    correctAnswer: '30',
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int count = 0;

    for (int i = 1; i <= 4; i++) {
        for (int j = 1; j <= i; j++) {
            count++;
        }
    }

    cout << count;
    return 0;
}`,
    options: [
      '8',
      '10',
      '12',
      '16'
    ],
    correctAnswer: '10',
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int sum = 0;

    for (int i = 1; i <= 5; i++) {
        if (i == 3)
            continue;

        sum += i;
    }

    cout << sum;
    return 0;
}`,
    options: [
      '12',
      '15',
      '9',
      '8'
    ],
    correctAnswer: '12',
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int i = 1;

    do {
        cout << i << " ";
        i *= 2;
    } while (i < 10);

    return 0;
}`,
    options: [
      '"1 2 4 8"',
      '"1 2 4 8 16"',
      '"2 4 8"',
      '"1 2 4"'
    ],
    correctAnswer: '"1 2 4 8"',
    marks: 5
  },
  {
    prompt: `What will be printed by the following code?

#include <iostream>
using namespace std;

int main() {
    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            if (i == j)
                cout << "* ";
            else
                cout << "# ";
        }
        cout << endl;
    }

    return 0;
}`,
    options: [
      `* # #\n# * #\n# # *`,
      `* * *\n# # #\n* * *`,
      `# * #\n* # *\n# * #`,
      `* # *\n# * #\n* # *`
    ],
    correctAnswer: `* # #\n# * #\n# # *`,
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int n = 1234;
    int rev = 0;

    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }

    cout << rev;
    return 0;
}`,
    options: [
      '1234',
      '4321',
      '4312',
      '2341'
    ],
    correctAnswer: '4321',
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int count = 0;

    for (int i = 1; i <= 3; i++) {
        for (int j = 1; j <= 3; j++) {
            if (i + j == 4)
                count++;
        }
    }

    cout << count;
    return 0;
}`,
    options: [
      '1',
      '2',
      '3',
      '4'
    ],
    correctAnswer: '3',
    marks: 5
  },
  {
    prompt: `Which code correctly prints the following pattern?

1
12
123
1234
12345`,
    options: [
      `for (int i = 1; i <= 5; i++) {\n    for (int j = 1; j <= 5; j++)\n        cout << j;\n    cout << endl;\n}`,
      `for (int i = 1; i <= 5; i++) {\n    for (int j = 1; j <= i; j++)\n        cout << j;\n    cout << endl;\n}`,
      `for (int i = 1; i <= 5; i++) {\n    for (int j = 1; j < i; j++)\n        cout << j;\n    cout << endl;\n}`,
      `for (int i = 1; i <= 5; i++) {\n    for (int j = i; j <= 5; j++)\n        cout << j;\n    cout << endl;\n}`
    ],
    correctAnswer: `for (int i = 1; i <= 5; i++) {\n    for (int j = 1; j <= i; j++)\n        cout << j;\n    cout << endl;\n}`,
    marks: 5
  },
  {
    prompt: `What will be the output?

#include <iostream>
using namespace std;

int main() {
    int sum = 0;

    for (int i = 1; i <= 5; i++) {
        for (int j = i; j <= 5; j++) {
            sum++;
        }
    }

    cout << sum;
    return 0;
}`,
    options: [
      '10',
      '15',
      '20',
      '25'
    ],
    correctAnswer: '15',
    marks: 5
  },
  {
    prompt: `What will be printed by the following code?

#include <iostream>
using namespace std;

int main() {
    int n = 4;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++)
            cout << " ";

        for (int k = 1; k <= 2 * i - 1; k++)
            cout << "*";

        cout << endl;
    }

    return 0;
}`,
    options: [
      `*\n**\n***\n****`,
      `   *\n  ***\n *****\n*******`,
      `*******\n *****\n  ***\n   *`,
      `****\n ***\n  **\n   *`
    ],
    correctAnswer: `   *\n  ***\n *****\n*******`,
    marks: 5
  }
];

async function main() {
  const activeWs = await prisma.workshop.findFirst({
    where: { status: 'ACTIVE' },
    include: { labs: true }
  });

  if (!activeWs) throw new Error('No active workshop found!');

  const workshopId = activeWs.id;
  const targetLabIds = activeWs.labs.map(l => l.id);
  if (!targetLabIds.includes('cmv6vdt1q0001up107c4z1mzw')) {
    targetLabIds.push('cmv6vdt1q0001up107c4z1mzw');
  }

  // Set startsAt to 1 hour ago so it is LIVE IMMEDIATELY
  const startsAt = new Date(Date.now() - 3600 * 1000);
  // Set endsAt to 14 days in future
  const endsAt = new Date(Date.now() + 14 * 24 * 3600 * 1000);

  let assessment = await prisma.assessment.findFirst({
    where: { workshopId, title: { in: ['Day 4: Advanced Loops', 'Advanced Loops'] } },
    include: { questions: true }
  });

  if (!assessment) {
    console.log('Creating live Assessment: Day 4: Advanced Loops...');
    assessment = await prisma.assessment.create({
      data: {
        workshopId,
        title: 'Day 4: Advanced Loops',
        description: 'Super 60 C++ Assignment: Advanced Loops, Pattern Printing & Basic Programming. 20 MCQs covering while vs do-while loops, break, continue, nested loops, and pattern printing algorithms.',
        type: 'ASSIGNMENT',
        targetAudience: 'LABS',
        targetLabIds,
        totalMarks: 100,
        passingMarks: 50,
        durationMinutes: 45,
        allowedViolations: 0,
        instructions: 'Advanced Loops Assignment: 20 MCQs on loops and pattern printing. Open-practice assignment: Self-paced, no proctoring, no tab-switch lockouts.',
        startsAt,
        endsAt,
        questions: {
          create: questions.map(q => ({
            prompt: q.prompt,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks
          }))
        }
      },
      include: {
        questions: true
      }
    });
    console.log(`✔ Assessment created successfully! ID: ${assessment.id}`);
  } else {
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { title: 'Day 4: Advanced Loops' }
    });
    console.log(`✔ Found existing Assessment: ID: ${assessment.id} (${assessment.questions.length} questions), updated title to Day 4: Advanced Loops`);
  }


  // Create Assignment record for dashboard & grading consistency
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  let assign = await prisma.assignment.findFirst({
    where: { workshopId, title: { in: ['Day 4: Advanced Loops', 'Advanced Loops'] } }
  });

  if (!assign) {
    assign = await prisma.assignment.create({
      data: {
        workshopId,
        title: 'Day 4: Advanced Loops',
        description: 'Super 60 C++ Assignment: Advanced Loops, Pattern Printing & Basic Programming. Complete the interactive 20 MCQ assessment under the Assignments and Tests tab.',
        maxScore: 100,
        dueDate: endsAt,
        createdBy: admin.id
      }
    });
    console.log(`✔ Assignment record created: ID: ${assign.id} (${assign.title})`);
  } else {
    await prisma.assignment.update({
      where: { id: assign.id },
      data: { title: 'Day 4: Advanced Loops' }
    });
    console.log(`✔ Found existing Assignment record: ID: ${assign.id}, updated title to Day 4: Advanced Loops`);
  }
}

main()
  .catch((e) => {
    console.error('Error creating Advanced Loops assignment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
