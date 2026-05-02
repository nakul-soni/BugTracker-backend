const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('USERS:');
  users.forEach(u => console.log(u.id, u.email, u.name));
  
  const members = await prisma.member.findMany({ include: { user: true } });
  console.log('\nMEMBERS:');
  members.forEach(m => console.log(m.projectId, m.userId, m.role, m.user?.email));
}
main().finally(() => prisma.$disconnect());
