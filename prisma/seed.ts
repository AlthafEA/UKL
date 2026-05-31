import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@ukl.local' },
    update: {},
    create: {
      name: 'Admin UKL',
      email: 'admin@ukl.local',
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@ukl.local' },
    update: {},
    create: {
      name: 'Student UKL',
      email: 'student@ukl.local',
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });