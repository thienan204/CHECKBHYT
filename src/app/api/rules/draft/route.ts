import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Remove id if present to let DB generate a new one, or handle updates
        const { id, ...rest } = data;

        const draft = await prisma.draftRule.create({
            data: rest,
        });

        return NextResponse.json(draft);
    } catch (error) {
        console.error('Error creating draft:', error);
        return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const drafts = await prisma.draftRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(drafts);
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }
}
