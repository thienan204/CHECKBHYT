const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfig() {
  const config = await prisma.specializedRule.findUnique({
    where: { slug: 'it-request-fields-config' }
  });
  console.log(JSON.stringify(config, null, 2));
}

checkConfig().catch(console.error).finally(() => prisma.$disconnect());
