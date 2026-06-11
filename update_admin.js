const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            role: 'ADMIN',
            isAvailable: true,
            dutyOrder: 1
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Quản trị viên',
            role: 'ADMIN',
            isAvailable: true,
            dutyOrder: 1
        }
    });

    console.log('Đã cập nhật/tạo tài khoản admin thành công:', admin.username, 'với role:', admin.role);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
