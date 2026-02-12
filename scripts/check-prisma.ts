import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// @ts-ignore
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function check() {
    if ('specializedRule' in prisma) {
        console.log('SUCCESS: SpecializedRule model found.');
    } else {
        console.log('FAILURE: SpecializedRule model NOT found.');
        console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
