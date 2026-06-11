const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const roles = await prisma.role.findMany();
    console.log('Roles:', JSON.stringify(roles, null, 2));

    const khoas = await prisma.user.findMany({ where: { role: 'KHOA' } });
    console.log('Users (KHOA):', JSON.stringify(khoas, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
