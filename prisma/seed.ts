import { PrismaClient, BugStatus, BugSeverity, BugPriority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create user
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'dummy',
    },
  });

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      ownerId: user.id,
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Project Phoenix',
      organizationId: org.id,
    },
  });

  // Add bugs
  await prisma.bug.create({
    data: {
      title: 'Login page crashes on Safari',
      description: 'When clicking the login button on Safari iOS, the app crashes completely.',
      status: BugStatus.OPEN,
      severity: BugSeverity.CRITICAL,
      priority: BugPriority.URGENT,
      projectId: project.id,
      reportedBy: user.id,
    },
  });

  await prisma.bug.create({
    data: {
      title: 'Typo in header',
      description: 'The word "Welcome" is spelled "Welcom".',
      status: BugStatus.IN_PROGRESS,
      severity: BugSeverity.MINOR,
      priority: BugPriority.LOW,
      projectId: project.id,
      reportedBy: user.id,
      assignedTo: user.id,
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
