import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (email: admin@example.com, password: admin123)
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash,
    },
  });

  // Create a sample event and a registration
  const event = await prisma.event.create({
    data: {
      title: 'Community Blood Drive',
      description: 'A community blood donation drive to support local hospitals.',
      location: 'Community Center',
      dateTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      capacity: 50,
    },
  });

  await prisma.registration.create({
    data: {
      eventId: event.id,
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '0123456789',
      status: 'pending',
      notes: 'First time donor',
    },
  });

  console.log('Seed completed. Admin: admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
