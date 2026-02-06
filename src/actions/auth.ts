'use server';

import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me-in-prod';

export type UserPayload = {
    id: string;
    username: string;
    role: string;
};

export async function getCurrentUser(): Promise<UserPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);

        return {
            id: payload.id as string,
            username: payload.username as string,
            role: payload.role as string,
        };
    } catch (error) {
        return null; // Invalid or expired token
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
}
