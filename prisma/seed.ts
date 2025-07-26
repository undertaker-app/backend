import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      password: hashedPassword,
      nickname: '지하철마스터',
      phoneNumber: '010-1234-5678',
      coinBalance: 1000,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      password: hashedPassword,
      nickname: '좌석헌터',
      phoneNumber: '010-9876-5432',
      coinBalance: 500,
    },
  });

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: '2호선 강남역 좌석 정보',
        content: '강남역 지하철 2호선에서 좌석 상황을 공유합니다.',
        published: true,
        authorId: user1.id,
      },
      {
        title: '1호선 서울역 혼잡도',
        content: '서울역 1호선 현재 혼잡도와 좌석 정보입니다.',
        published: false,
        authorId: user2.id,
      },
      {
        title: '9호선 신논현역 실시간 정보',
        content: '신논현역 9호선 실시간 좌석 정보를 공유합니다.',
        published: true,
        authorId: user1.id,
      },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log(`📧 Test accounts:`);
  console.log(`   john@example.com / Password123!`);
  console.log(`   jane@example.com / Password123!`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
