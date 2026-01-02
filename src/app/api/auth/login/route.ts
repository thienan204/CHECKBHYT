import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me-in-prod';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không đúng' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Tài khoản hoặc mật khẩu không đúng' }, { status: 401 });
        }

        // Create JWT
        const alg = 'HS256';
        const secret = new TextEncoder().encode(JWT_SECRET);

        const token = await new jose.SignJWT({
            id: user.id,
            username: user.username,
            role: user.role
        })
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setExpirationTime('24h') // Token valid for 24 hours
            .sign(secret);

        // Set HttpOnly Cookie
        const response = NextResponse.json({ success: true, user: { name: user.name, role: user.role } });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
    }
}
