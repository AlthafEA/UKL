import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin12345', 10);
  const userPasswordHash = await bcrypt.hash('user12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@mail.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@mail.com' },
    update: {},
    create: {
      name: 'User',
      email: 'user@mail.com',
      passwordHash: userPasswordHash,
      role: Role.CUSTOMER,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });