import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ authenticated: false });
        
        return NextResponse.json({ authenticated: true, user });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
