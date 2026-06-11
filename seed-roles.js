const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const defaultRoles = [
        { code: 'ADMIN', name: 'Quản trị viên', description: 'Có toàn quyền truy cập hệ thống' },
        { code: 'CNTT', name: 'Phòng CNTT', description: 'Quyền xử lý lỗi hệ thống' },
        { code: 'KHOA', name: 'Khoa / Phòng ban', description: 'Quyền xem và giải trình lỗi của Khoa' }
    ];

    for (const role of defaultRoles) {
        await prisma.role.upsert({
            where: { code: role.code },
            update: role,
            create: role
        });
        console.log('Upserted role:', role.code);
    }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
