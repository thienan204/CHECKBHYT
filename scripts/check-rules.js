
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const rules = await prisma.validationRule.findMany();
        console.log('--- Rules in DB ---');
        rules.forEach(r => {
            console.log(`Rule ID: ${r.id}, Name: ${r.name}`);
            console.log(`  ConditionMaDichVu: ${r.conditionMaDichVu}`);
            console.log(`  ConditionMaDichVuValue: ${r.conditionMaDichVuValue}`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
