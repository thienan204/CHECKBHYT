const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || "postgresql://root:root@localhost:5432/readFileXML?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Exporting data...');

    // Export Validation Rules
    const rules = await prisma.validationRule.findMany({
        orderBy: { id: 'asc' }
    });

    // Export Draft Rules
    const drafts = await prisma.draftRule.findMany({
        orderBy: { createdAt: 'asc' }
    });

    // Write to files
    const seedsDir = path.join(__dirname, '../prisma/seeds');
    if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(seedsDir, 'rules.json'),
        JSON.stringify(rules, null, 2)
    );
    console.log(`Exported ${rules.length} rules to prisma/seeds/rules.json`);

    fs.writeFileSync(
        path.join(seedsDir, 'drafts.json'),
        JSON.stringify(drafts, null, 2)
    );
    console.log(`Exported ${drafts.length} drafts to prisma/seeds/drafts.json`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
