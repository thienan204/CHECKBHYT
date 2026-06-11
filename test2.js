const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.iTRequest.findFirst({ orderBy: { createdAt: 'desc' } }).then(console.log).finally(() => p.$disconnect());
