const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding specialized rules...');

    // Default rules expected by the application
    const specializedRules = [
        {
            name: 'Kiểm tra trùng giường',
            slug: 'kiem-tra-trung-giuong',
            ruleType: 'DUPLICATE_BED',
            order: 1,
            isActive: true,
            logicConfig: {
                type: "DUPLICATE_BED",
                fields: {
                    bed: "MA_GIUONG",
                    room: "MA_PHONG",
                    department: "MA_KHOA",
                    startTime: "NGAY_YL",
                    endTime: "NGAY_KQ"
                },
                filter: {
                    MA_NHOM: 15
                },
                toleranceMinutes: 15
            }
        },
        {
            name: 'Phân tích tổng hợp',
            slug: 'phan-tich-tong-hop',
            ruleType: 'SQL',
            order: 2,
            isActive: true
        }
    ];

    for (const rule of specializedRules) {
        await prisma.specializedRule.upsert({
            where: { slug: rule.slug },
            update: rule,
            create: rule,
        });
        console.log(`Upserted specialized rule: ${rule.name}`);
    }
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
