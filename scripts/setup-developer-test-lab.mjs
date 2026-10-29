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

async function main() {
  const targetEmail = "sharmar09565@gmail.com";
  const labName = "testonlyfordeveloper";

  console.log(`Setting up lab "${labName}" and assigning ${targetEmail}...`);

  // 1. Get active workshop
  const workshop = await prisma.workshop.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!workshop) throw new Error("No active workshop found");
  console.log(`Active Workshop: ${workshop.name} (${workshop.id})`);

  // 2. Find user
  const user = await prisma.user.findFirst({
    where: { email: { equals: targetEmail, mode: "insensitive" } },
    include: { mentorProfile: true },
  });
  if (!user) throw new Error(`User with email ${targetEmail} not found!`);
  console.log(`User found: ${user.name} (${user.id}), Role: ${user.role}`);

  // 3. Ensure MentorProfile exists for user
  if (!user.mentorProfile) {
    await prisma.mentorProfile.create({
      data: {
        userId: user.id,
        title: "Lead Developer & System Mentor",
        specialty: "C++, Systems, Anti-cheat & Platform Testing",
        bio: "Platform Administrator and Lead Developer for Super 60 test and sandbox environments.",
      },
    });
    console.log(`Created MentorProfile for ${user.email}`);
  }

  // 4. Create or get Lab "testonlyfordeveloper"
  let lab = await prisma.lab.findFirst({
    where: {
      workshopId: workshop.id,
      name: labName,
    },
  });

  if (!lab) {
    lab = await prisma.lab.create({
      data: {
        workshopId: workshop.id,
        name: labName,
        schedule: "Developer Sandbox & Testing (24/7)",
        capacity: 10,
      },
    });
    console.log(`Created new Lab "${lab.name}" with ID: ${lab.id}`);
  } else {
    console.log(`Lab "${lab.name}" already exists with ID: ${lab.id}`);
  }

  // 5. Add user as Mentor in LabMentor
  const existingMentor = await prisma.labMentor.findUnique({
    where: {
      labId_mentorId: {
        labId: lab.id,
        mentorId: user.id,
      },
    },
  });

  if (!existingMentor) {
    await prisma.labMentor.create({
      data: {
        labId: lab.id,
        mentorId: user.id,
        isLead: true,
      },
    });
    console.log(`Added ${user.email} as LEAD MENTOR in lab "${lab.name}"`);
  } else {
    console.log(`${user.email} is already a mentor in lab "${lab.name}"`);
  }

  // 6. Add user as Student in LabStudent
  // First, remove from any previous lab to ensure clean assignment
  await prisma.labStudent.deleteMany({
    where: { studentId: user.id },
  });

  await prisma.labStudent.create({
    data: {
      labId: lab.id,
      studentId: user.id,
    },
  });
  console.log(`Added ${user.email} as STUDENT in lab "${lab.name}"`);

  // 7. Update WorkshopEnrollment to SELECTED
  await prisma.workshopEnrollment.upsert({
    where: {
      workshopId_studentId: {
        workshopId: workshop.id,
        studentId: user.id,
      },
    },
    create: {
      workshopId: workshop.id,
      studentId: user.id,
      status: "SELECTED",
    },
    update: {
      status: "SELECTED",
    },
  });
  console.log(`Updated WorkshopEnrollment for ${user.email} to "SELECTED"`);

  // 8. Find the newly created SUPER60 assessment and start it ONLY for this lab
  const assessment = await prisma.assessment.findFirst({
    where: {
      workshopId: workshop.id,
      title: { contains: "SUPER60 SKILLUP (Pen-Paper Test)" },
    },
  });

  if (!assessment) {
    throw new Error("Could not find SUPER60 SKILLUP assessment in database!");
  }

  const now = new Date();
  const startsAt = new Date(now.getTime() - 10 * 60 * 1000); // Started 10 mins ago
  const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Open for 7 days

  const updatedAssessment = await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      labId: lab.id, // Strictly bound to testonlyfordeveloper
      targetLabIds: [lab.id], // Target only testonlyfordeveloper
      targetAudience: "LABS", // Only for target lab
      startsAt: startsAt, // LIVE NOW!
      endsAt: endsAt,
    },
  });

  console.log(`\n========================================`);
  console.log(`ASSESSMENT IS NOW LIVE FOR "${lab.name}"!`);
  console.log(`Assessment ID: ${updatedAssessment.id}`);
  console.log(`Title: ${updatedAssessment.title}`);
  console.log(`Target Audience: ${updatedAssessment.targetAudience}`);
  console.log(`Target Lab: ${lab.name} (${lab.id})`);
  console.log(`Starts At: ${updatedAssessment.startsAt.toISOString()} (LIVE NOW)`);
  console.log(`Ends At: ${updatedAssessment.endsAt.toISOString()}`);
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error setting up developer test lab:", err);
  await prisma.$disconnect();
  process.exit(1);
});
