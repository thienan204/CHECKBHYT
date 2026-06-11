const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany({ where: { role: 'KHOA' } });
  console.log('Khoa Users: ', users.map(u => u.ma_khoa));
  
  const staffs = await p.staff.findMany({ select: { ma_khoa: true }, distinct: ['ma_khoa'] });
  console.log('Staff ma_khoa: ', staffs.map(s => s.ma_khoa));
}
main().finally(() => p.$disconnect());
