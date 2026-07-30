import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: 'free', displayName: 'Free', price: 0, maxFileSize: 10, maxOpsPerDay: 5, apiCallsPerDay: 0, teamSeats: 1, features: JSON.stringify(['Local PDF tools']), isPopular: false },
    { name: 'pro', displayName: 'Pro', price: 9.99, maxFileSize: 100, maxOpsPerDay: -1, apiCallsPerDay: 100, teamSeats: 1, features: JSON.stringify(['Expanded local tools', 'Usage history']), isPopular: true },
    { name: 'enterprise', displayName: 'Enterprise', price: 49, maxFileSize: 500, maxOpsPerDay: -1, apiCallsPerDay: -1, teamSeats: 5, features: JSON.stringify(['All Pro features', 'Team seats', 'Managed support']), isPopular: false },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log('Plan seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
