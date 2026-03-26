import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const refsParam = searchParams.get('refs');
        if (!refsParam) return NextResponse.json({});

        const refs = refsParam.split(',').filter(Boolean);
        const result: Record<string, string[]> = {};

        for (const ref of refs) {
            const [table, column] = ref.split('.');
            if (!table || !column) continue;

            const modelName = table.charAt(0).toLowerCase() + table.slice(1);
            if (typeof (prisma as any)[modelName] !== 'object') continue;

            try {
                const data = await (prisma as any)[modelName].findMany({
                    select: { [column]: true }
                });

                // map values, filter nulls, and ensure they are strings
                result[ref] = data.map((d: any) => d[column]).filter((v: any) => v !== null && v !== undefined).map(String);
            } catch (err: any) {
                console.error(`Error fetching dynamic master data for ${table}.${column}:`, err.message);
                // Continue to next ref
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error in dynamic master API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
