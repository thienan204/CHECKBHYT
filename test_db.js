const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const rules = await prisma.$queryRaw`SELECT * FROM "DuplicateRule" ORDER BY "createdAt" DESC LIMIT 1`;
        if (rules.length === 0) {
            console.log("No rules found.");
            return;
        }

        const ruleId = rules[0].id;
        console.log("Before Update:", rules[0].name, "| ignoreIfSameField:", rules[0].ignoreIfSameField);

        // Try updating to null using identical code from codebase
        let myVal = null; // simulate values.ignoreIfSameField || null
        await prisma.$executeRaw`UPDATE "DuplicateRule" SET "ignoreIfSameField" = ${myVal} WHERE "id" = ${ruleId}`;
        console.log("ExecuteRaw finished.");

        const rulesAfter = await prisma.$queryRaw`SELECT * FROM "DuplicateRule" WHERE "id" = ${ruleId}`;
        console.log("After Update:", rulesAfter[0].ignoreIfSameField);
    } catch (e) {
        console.error("Loi:", e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
