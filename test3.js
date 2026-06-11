const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.staff.findMany({ where: { ho_ten: 'Hoàng Mạnh Cương' } }).then(console.log).finally(() => p.$disconnect());
