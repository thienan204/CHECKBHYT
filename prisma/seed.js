const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const DEFAULT_RULES = [
    {
        id: '1',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        name: 'Không có ngày kết quả',
        code: 'NGAY_KQ == null'
    },
    {
        id: '1b',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        name: 'Không có ngày kết quả (Full Path)',
        code: 'XML3.NGAY_KQ == null'
    },
    {
        id: '2',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        field: 'NGAY_YL',
        name: 'Y lệnh trước khi vào viện',
        code: 'NGAY_YL < XML1.NGAY_VAO'
    }
];

async function main() {
    console.log('Seeding data...');

    // 1. Seed Rules from Backup
    const backupRulesPath = path.join(__dirname, 'seeds/rules.json');
    if (fs.existsSync(backupRulesPath)) {
        console.log('Found backup rules. Seeding from prisma/seeds/rules.json...');
        const backupRules = JSON.parse(fs.readFileSync(backupRulesPath, 'utf8'));

        for (const rule of backupRules) {
            // Prisma will handle ISO date strings, but we can be explicit if needed
            await prisma.validationRule.upsert({
                where: { id: rule.id },
                update: rule,
                create: rule,
            });
        }
        console.log(`Restored ${backupRules.length} rules from backup.`);
    } else {
        console.log('No backup found. Seeding default rules...');
        for (const rule of DEFAULT_RULES) {
            await prisma.validationRule.upsert({
                where: { id: rule.id },
                update: rule,
                create: rule,
            });
            console.log(`Upserted default rule: ${rule.name}`);
        }
    }

    // Seed Admin User
    console.log('Seeding admin user...');
    // Hardcoded hash for '123456' to avoid dependency on bcryptjs in standalone Docker build
    const adminPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {}, // Don't overwrite if exists
        create: {
            username: 'admin',
            password: adminPassword,
            name: 'Administrator',
            role: 'ADMIN'
        },
    });
    console.log('Upserted user: admin');

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
