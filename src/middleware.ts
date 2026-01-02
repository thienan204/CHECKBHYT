import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me-in-prod';

export async function middleware(request: NextRequest) {
    // 1. Check if route is protected
    // Protected routes: /kiem-tra-loi-bhxh/*, /admin/*
    // Public routes: /login, /api/auth/*, /_next/*, /favicon.ico, /images/*

    const path = request.nextUrl.pathname;

    // Define protected paths
    const startWithProtected = ['/rules', '/settings', '/admin'];
    const isProtected = startWithProtected.some(p => path.startsWith(p));


    if (isProtected) {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            await jose.jwtVerify(token, secret);
            // Token is valid
            return NextResponse.next();
        } catch (error) {
            // Token invalid or expired
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes except specific protected ones? for now let's protect UI only or check inside API)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
