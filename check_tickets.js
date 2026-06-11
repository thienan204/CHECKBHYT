const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTickets() {
  const tickets = await prisma.iTRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(tickets);
}

checkTickets().catch(console.error).finally(() => prisma.$disconnect());
