const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const role = await prisma.role.findFirst({where: {code: 'KHOA'}});
    console.log(typeof role.permissions);
    console.log(Array.isArray(role.permissions));
    console.log(role.permissions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
