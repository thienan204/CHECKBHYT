import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding Specialized Rules...');

    const rules = [
        {
            name: 'Trùng giường (Nhóm 15)',
            slug: 'trung-giuong-nhom-15',
            description: 'Kiểm tra các trường hợp trùng giường bệnh nhân trong cùng khoảng thời gian',
            isActive: true,
            order: 1,
            ruleType: 'DUPLICATE_BED',
            logicConfig: {
                type: "DUPLICATE_BED",
                fields: {
                    bed: "MA_GIUONG",
                    room: "MA_PHONG",
                    department: "MA_KHOA",
                    startTime: "NGAY_VAO",
                    endTime: "NGAY_RA"
                },
                toleranceMinutes: 15
            }
        },
        {
            name: 'Kiểm tra Mã máy (Xét nghiệm)',
            slug: 'kiem-tra-ma-may-xet-nghiem',
            description: 'Kiểm tra tính hợp lệ của mã máy xét nghiệm và tần suất sử dụng',
            isActive: true,
            order: 2,
            ruleType: 'MACHINE_CHECK',
            logicConfig: {
                type: "MACHINE_CHECK",
                fields: {
                    machineCode: "MA_MAY",
                    serviceCode: "MA_DICH_VU",
                    time: "NGAY_KQ"
                },
                constraints: {
                    maxPerDay: 200,
                    minDurationMinutes: 5
                },
                filter: {
                    ma_nhom: 1
                }
            }
        },
        {
            name: 'Kiểm tra Mã máy (CĐHA)',
            slug: 'kiem-tra-ma-may-cdha',
            description: 'Kiểm tra tính hợp lệ của mã máy chẩn đoán hình ảnh',
            isActive: true,
            order: 3,
            ruleType: 'MACHINE_CHECK',
            logicConfig: {
                type: "MACHINE_CHECK",
                fields: {
                    machineCode: "MA_MAY",
                    serviceCode: "MA_DICH_VU",
                    time: "NGAY_KQ"
                },
                constraints: {
                    maxPerDay: 100,
                    minDurationMinutes: 10
                },
                filter: {
                    ma_nhom: 2
                }
            }
        }
    ];

    for (const rule of rules) {
        const existing = await prisma.specializedRule.findUnique({
            where: { slug: rule.slug },
        });

        if (!existing) {
            await prisma.specializedRule.create({
                data: rule,
            });
            console.log(`Created rule: ${rule.name}`);
        } else {
            console.log(`Rule already exists: ${rule.name}`);
            // Optional: Update logic if needed
            await prisma.specializedRule.update({
                where: { slug: rule.slug },
                data: {
                    ruleType: rule.ruleType,
                    logicConfig: rule.logicConfig as any // Check typing
                }
            })
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
