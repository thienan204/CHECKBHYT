const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.specializedRule.upsert({ 
        where: {slug: 'it-request-fields-config'}, 
        update: {logicConfig: ['NGÀY VÀO VIỆN', 'NGÀY RA VIỆN', 'Tên Người yêu cầu', 'Số điện thoại']}, 
        create: {name: 'IT Config', slug: 'it-request-fields-config', ruleType: 'SYSTEM_CONFIG', logicConfig: ['NGÀY VÀO VIỆN', 'NGÀY RA VIỆN', 'Tên Người yêu cầu', 'Số điện thoại']} 
    }); 
    console.log('Config updated'); 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
