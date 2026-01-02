const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || "postgresql://root:root@localhost:5432/readFileXML?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const newPassword = process.argv[2];
    if (!newPassword) {
        console.error('Usage: node scripts/update-password.js <new_password>');
        process.exit(1);
    }

    console.log(`Updating admin password...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const updatedUser = await prisma.user.update({
            where: { username: 'admin' },
            data: {
                password: hashedPassword
            },
        });
        console.log(`Password for user '${updatedUser.username}' updated successfully.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error('Error: User "admin" not found.');
        } else {
            console.error('An unexpected error occurred:', error);
        }
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
