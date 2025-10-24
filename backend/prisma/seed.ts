import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@srms.local';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { name: 'Admin', email, password: hashed, role: 'admin' },
    update: { },
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
