import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const schoolCode = '0000';
  const schoolName = 'Demo School';

  const school = await prisma.school.upsert({
    where: { code: schoolCode },
    create: { name: schoolName, code: schoolCode },
    update: {},
  });

  const email = 'admin@srms.local';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    create: { name: 'Admin', email, password: hashed, role: 'admin', school_id: school.school_id },
    update: {},
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
