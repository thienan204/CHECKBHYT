
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Connecting to DB with Adapter...');
    try {
        const rules = await prisma.duplicateRule.findMany();
        console.log('Successfully fetched rules:', rules);

        const newRule = await prisma.duplicateRule.create({
            data: {
                name: 'Test Rule Script',
                machineCols: ['MA_MAY_TEST'],
                startCol: 'START_TEST',
                endCol: 'END_TEST',
                ignoreMaMayMinusOne: true,
                serviceValues: []
            }
        });
        console.log('Successfully created rule:', newRule);

        await prisma.duplicateRule.delete({
            where: { id: newRule.id }
        });
        console.log('Successfully deleted test rule');

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
