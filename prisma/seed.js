const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://root:root@localhost:5432/readFileXML?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    console.log('Seeding default rules...');
    for (const rule of DEFAULT_RULES) {
        // Upsert to avoid duplicates if re-run
        await prisma.validationRule.upsert({
            where: { id: rule.id },
            update: rule,
            create: rule,
        });
        console.log(`Upserted rule: ${rule.name}`);
    }

    // Seed Admin User
    console.log('Seeding admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('123456', 10);

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
