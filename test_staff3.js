const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const count = await p.staff.groupBy({
    by: ['ma_khoa'],
    _count: {
      ma_khoa: true,
    },
  });
  console.log(count);
}
main().finally(() => p.$disconnect());
