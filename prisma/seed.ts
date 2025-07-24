import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is the first post content.',
        published: true,
        authorId: user1.id,
      },
      {
        title: 'Second Post',
        content: 'This is the second post content.',
        published: false,
        authorId: user2.id,
      },
      {
        title: 'Third Post',
        content: 'This is the third post content.',
        published: true,
        authorId: user1.id,
      },
    ],
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
