import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This API is used by the middleware to resolve custom URLs
export async function GET() {
    try {
        const menusWithTarget = await prisma.menu.findMany({
            where: {
                targetPath: { not: null },
                isActive: true
            },
            select: {
                path: true,
                targetPath: true
            }
        });

        const aliases: Record<string, string> = {};
        menusWithTarget.forEach(m => {
            if (m.path && m.targetPath) {
                aliases[m.path] = m.targetPath;
            }
        });

        // Use cache-control to cache this at the Edge (Next.js server) for 60 seconds
        return NextResponse.json(aliases, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error("Failed to fetch menu aliases", error);
        return NextResponse.json({}, { status: 500 });
    }
}
