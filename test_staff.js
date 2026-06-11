const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.staff.count().then(console.log).finally(() => p.$disconnect());
