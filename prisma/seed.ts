import { PrismaClient, UserRole, WorkshopStatus, EnrollmentStatus, AttendanceStatus, SubmissionStatus, NoteCategory, AssessmentType, DoubtStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Neon database for Super 60 Skill Up platform...");

  // Password hashes
  const adminPass = await bcrypt.hash("admin123", 10);
  const mentorPass = await bcrypt.hash("mentor123", 10);
  const studentPass = await bcrypt.hash("student123", 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@super60.org" },
    update: {},
    create: {
      email: "admin@super60.org",
      passwordHash: adminPass,
      name: "Super 60 Admin",
      role: UserRole.ADMIN,
      phone: "+91 98765 00000",
    },
  });

  // 2. Create Mentors
  const mentor1 = await prisma.user.upsert({
    where: { email: "vikram@super60.org" },
    update: {},
    create: {
      email: "vikram@super60.org",
      passwordHash: mentorPass,
      name: "Vikram Rathod",
      role: UserRole.MENTOR,
      phone: "+91 98765 11111",
      mentorProfile: {
        create: {
          title: "Senior Systems Architect",
          company: "Ex-Google · Super 60 Alumni",
          specialty: "Low-Latency C++ & Kernel Bypass",
          bio: "Specializing in zero-overhead abstractions, cache hierarchies, and lock-free systems.",
        },
      },
    },
  });

  const mentor2 = await prisma.user.upsert({
    where: { email: "ananya@super60.org" },
    update: {},
    create: {
      email: "ananya@super60.org",
      passwordHash: mentorPass,
      name: "Dr. Ananya Roy",
      role: UserRole.MENTOR,
      phone: "+91 98765 22222",
      mentorProfile: {
        create: {
          title: "Compilers & Concurrency Lead",
          company: "Systems Researcher",
          specialty: "Memory Models & Lock-Free Data Structures",
          bio: "Author of modern C++ concurrency papers and mentor for Super 60 batches.",
        },
      },
    },
  });

  // 3. Create Students
  const student1 = await prisma.user.upsert({
    where: { email: "aditya@student.super60.org" },
    update: {},
    create: {
      email: "aditya@student.super60.org",
      passwordHash: studentPass,
      name: "Aditya Sharma",
      role: UserRole.STUDENT,
      college: "Indian Institute of Information Technology",
      phone: "+91 98765 33333",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "rohan@student.super60.org" },
    update: {},
    create: {
      email: "rohan@student.super60.org",
      passwordHash: studentPass,
      name: "Rohan Verma",
      role: UserRole.STUDENT,
      college: "National Institute of Technology",
      phone: "+91 98765 44444",
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "sneha@student.super60.org" },
    update: {},
    create: {
      email: "sneha@student.super60.org",
      passwordHash: studentPass,
      name: "Sneha Nair",
      role: UserRole.STUDENT,
      college: "Vellore Institute of Technology",
      phone: "+91 98765 55555",
    },
  });

  // 4. Create Workshops (Multi-year isolation test: 2026 and 2025)
  const workshop2026 = await prisma.workshop.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      name: "Skill Up 2026",
      year: 2026,
      slug: "skill-up-2026",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-07-31"),
      status: WorkshopStatus.ACTIVE,
      evaluationConfig: {
        assignments: 30,
        assessments: 35,
        attendance: 15,
        exercises: 10,
        doubts: 5,
        feedbackThreshold: 4.0,
      },
    },
  });

  const workshop2025 = await prisma.workshop.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      name: "Skill Up 2025",
      year: 2025,
      slug: "skill-up-2025",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-07-31"),
      status: WorkshopStatus.COMPLETED,
    },
  });

  // 5. Create Labs for 2026
  const labA = await prisma.lab.upsert({
    where: {
      workshopId_name: {
        workshopId: workshop2026.id,
        name: "Lab A — High-Performance Systems",
      },
    },
    update: {},
    create: {
      workshopId: workshop2026.id,
      name: "Lab A — High-Performance Systems",
      schedule: "Mon/Wed/Fri 18:00 - 20:30 IST",
      capacity: 30,
    },
  });

  const labB = await prisma.lab.upsert({
    where: {
      workshopId_name: {
        workshopId: workshop2026.id,
        name: "Lab B — Compilers & Concurrency",
      },
    },
    update: {},
    create: {
      workshopId: workshop2026.id,
      name: "Lab B — Compilers & Concurrency",
      schedule: "Tue/Thu/Sat 18:00 - 20:30 IST",
      capacity: 30,
    },
  });

  // 6. Assign Mentors to Labs
  await prisma.labMentor.upsert({
    where: { labId_mentorId: { labId: labA.id, mentorId: mentor1.id } },
    update: {},
    create: { labId: labA.id, mentorId: mentor1.id, isLead: true },
  });

  await prisma.labMentor.upsert({
    where: { labId_mentorId: { labId: labB.id, mentorId: mentor2.id } },
    update: {},
    create: { labId: labB.id, mentorId: mentor2.id, isLead: true },
  });

  // 7. Enroll Students in Workshop & Assign to Labs
  for (const s of [student1, student2, student3]) {
    await prisma.workshopEnrollment.upsert({
      where: { workshopId_studentId: { workshopId: workshop2026.id, studentId: s.id } },
      update: {},
      create: { workshopId: workshop2026.id, studentId: s.id, status: EnrollmentStatus.ENROLLED },
    });
  }

  await prisma.labStudent.upsert({
    where: { labId_studentId: { labId: labA.id, studentId: student1.id } },
    update: {},
    create: { labId: labA.id, studentId: student1.id },
  });

  await prisma.labStudent.upsert({
    where: { labId_studentId: { labId: labA.id, studentId: student2.id } },
    update: {},
    create: { labId: labA.id, studentId: student2.id },
  });

  await prisma.labStudent.upsert({
    where: { labId_studentId: { labId: labB.id, studentId: student3.id } },
    update: {},
    create: { labId: labB.id, studentId: student3.id },
  });

  // 8. Create Learning Notes
  await prisma.note.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      title: "C++ Memory Model & Cache Line Alignment",
      description: "Understanding L1/L2/L3 cache misses, false sharing, and alignas specifier.",
      content: `# C++ Cache Optimization & Memory Alignment\n\nModern CPUs load memory in 64-byte cache lines. When multiple threads write to adjacent variables on the same cache line, **false sharing** destroys performance.\n\n\`\`\`cpp\nstruct alignas(64) ThreadCounter {\n    std::atomic<uint64_t> count{0};\n};\n\`\`\``,
      category: NoteCategory.NOTES,
      tags: ["C++20", "Memory", "Optimization", "Cache"],
      uploadedBy: mentor1.id,
    },
  });

  await prisma.note.create({
    data: {
      workshopId: workshop2026.id,
      labId: labB.id,
      title: "Lock-Free Ring Buffer Implementation Guide",
      description: "Designing a single-producer single-consumer circular queue without mutexes.",
      content: `# SPSC Lock-Free Queue\n\nKey invariants for wait-free circular buffers:\n1. Producer only modifies head.\n2. Consumer only modifies tail.\n3. Use memory_order_acquire and memory_order_release.`,
      category: NoteCategory.CODE,
      tags: ["Concurrency", "Lock-Free", "Data Structures"],
      uploadedBy: mentor2.id,
    },
  });

  // 9. Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      title: "Assignment 01: Fast Slab Allocator",
      description: "Implement a fixed-size memory pool allocator with O(1) allocation and deallocation without malloc/free overhead.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      createdBy: mentor1.id,
    },
  });

  // Sample submission by Aditya
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      content: `// Fast Slab Allocator Submission by Aditya Sharma\n#include <cstddef>\n#include <new>\n\ntemplate<size_t BlockSize, size_t BlockCount>\nclass SlabAllocator {\n    struct Node { Node* next; };\n    alignas(alignof(std::max_align_t)) char storage[BlockSize * BlockCount];\n    Node* freeList = nullptr;\npublic:\n    SlabAllocator() {\n        for(size_t i = 0; i < BlockCount; ++i) {\n            deallocate(storage + i * BlockSize);\n        }\n    }\n    void* allocate() {\n        if (!freeList) throw std::bad_alloc();\n        Node* node = freeList;\n        freeList = freeList->next;\n        return node;\n    }\n    void deallocate(void* ptr) {\n        Node* node = reinterpret_cast<Node*>(ptr);\n        node->next = freeList;\n        freeList = node;\n    }\n};`,
      status: SubmissionStatus.REVIEWED,
      score: 98,
      feedback: "Exceptional alignment handling and zero allocation overhead. Benchmarks pass all latency tests.",
      reviewedBy: mentor1.id,
    },
  });

  // 10. Sessions & Attendance
  const session1 = await prisma.session.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      title: "Session 01: Systems Foundations & Toolchain Setup",
      date: new Date("2026-06-03"),
      topic: "Clang, GCC, Valgrind, GDB, and ASan integration.",
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session1.id,
      studentId: student1.id,
      status: AttendanceStatus.PRESENT,
      markedBy: mentor1.id,
    },
  });

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session1.id,
      studentId: student2.id,
      status: AttendanceStatus.PRESENT,
      markedBy: mentor1.id,
    },
  });

  // 11. Assessments
  const assessment1 = await prisma.assessment.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      title: "Benchmark Test: Modern C++ Systems Fundamentals",
      type: AssessmentType.TEST,
      totalMarks: 100,
      startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      questions: {
        create: [
          {
            prompt: "What is the primary difference between std::memory_order_relaxed and std::memory_order_seq_cst?",
            options: [
              "Relaxed provides only atomicity without synchronization or ordering constraints",
              "Relaxed guarantees global sequentially consistent order",
              "Seq_cst disables compiler optimizations only",
              "There is no performance difference on x86 architectures"
            ],
            correctAnswer: "Relaxed provides only atomicity without synchronization or ordering constraints",
            marks: 25,
          },
          {
            prompt: "Why should custom allocators ensure memory alignment to std::max_align_t?",
            options: [
              "To prevent unaligned memory access penalties or bus errors across SIMD registers",
              "To save RAM in heap buffers",
              "Because the C++ compiler rejects unaligned variables",
              "To make pointers 64-bit instead of 32-bit"
            ],
            correctAnswer: "To prevent unaligned memory access penalties or bus errors across SIMD registers",
            marks: 25,
          }
        ],
      },
    },
  });

  await prisma.assessmentResult.create({
    data: {
      assessmentId: assessment1.id,
      studentId: student1.id,
      score: 96,
      status: "COMPLETED",
    },
  });

  // 12. Sample Doubt & Conversation
  const doubt1 = await prisma.doubt.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      studentId: student2.id,
      mentorId: mentor1.id,
      title: "Segmentation fault when freeing circular buffer pointer",
      description: "In the lock-free queue assignment, when the consumer reads faster than producer, tail wraps around and dereferences invalid memory.",
      status: DoubtStatus.RESOLVED,
      messages: {
        create: [
          {
            senderId: student2.id,
            body: "Hi Vikram sir, I am getting an intermittent SIGSEGV in test bench 4 under 8 consumer threads.",
          },
          {
            senderId: mentor1.id,
            body: "Check your modulo indexing logic. If your buffer capacity is a power of 2, use bitwise AND (`index & (CAPACITY - 1)`) instead of `%` to avoid negative index undefined behavior.",
          },
          {
            senderId: student2.id,
            body: "That fixed it immediately! Thank you so much!",
          }
        ]
      }
    }
  });

  // 13. Feedback
  await prisma.feedback.create({
    data: {
      workshopId: workshop2026.id,
      labId: labA.id,
      studentId: student1.id,
      mentorId: mentor1.id,
      rating: 5,
      comment: "Vikram sir's line-by-line review of my slab allocator completely changed how I think about heap fragmentation and pointer arithmetic.",
      category: "MENTORSHIP_EXCELLENCE",
      isAnonymous: false,
    },
  });

  console.log("Database seeded successfully with Admin, Mentors, Students, Labs, and 2026/2025 Workshop data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
