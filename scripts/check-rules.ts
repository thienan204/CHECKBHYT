
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
} catch (e) {
    console.log('Could not read .env:', e);
}

const connectionString = process.env.DATABASE_URL;
console.log('Using DB URL:', connectionString ? 'Found' : 'Missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const rules = await prisma.validationRule.findMany();
    console.log(`--- Found ${rules.length} Rules in DB ---`);
    rules.forEach(r => {
        if (r.conditionMaDichVuValue || r.name.includes('MA_MAY')) {
            console.log(`ID: ${r.id}`);
            console.log(`Name: ${r.name}`);
            console.log(`CondMaDichVu: '${r.conditionMaDichVu}'`);
            console.log(`CondMaDichVuValue: '${r.conditionMaDichVuValue}'`); // The critical value
            console.log('---');
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
