import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Updating rule configuration...');

    // Update "Kiểm tra trùng mã máy thủ thuật" configuration
    await prisma.specializedRule.updateMany({
        where: { slug: 'kiem-tra-trung-ma-may-thu-thuat' },
        data: {
            logicConfig: {
                type: "DUPLICATE_BED",
                fields: {
                    bed: "MA_MAY",
                    room: "MA_PHONG",
                    department: "MA_KHOA",
                    startTime: "NGAY_TH_YL",
                    endTime: "NGAY_KQ"
                },
                filter: {
                    MA_NHOM: 18
                },
                toleranceMinutes: 0
            }
        }
    });

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
