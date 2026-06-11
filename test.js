const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.staff.findFirst({ where: { ho_ten: 'Hoàng Mạnh Cương' } }).then(console.log).finally(() => p.$disconnect());
