import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/actions/auth';

const prisma = new PrismaClient();

async function requireAdmin() {
    const user = await getCurrentUser();
    // Assuming hardcoded admin bypass doesn't have a token, wait, it does! We set a token with role ADMIN.
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
    return user;
}

export async function GET() {
    try {
        await requireAdmin();
        const roles = await prisma.role.findMany({
            orderBy: { createdAt: 'asc' }
        });
        return NextResponse.json(roles);
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { code, name, description, permissions } = body;

        if (!code || !name) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc (code, name)' }, { status: 400 });
        }

        const upperCode = code.toUpperCase().trim();

        const existingRole = await prisma.role.findUnique({ where: { code: upperCode } });
        if (existingRole) {
            return NextResponse.json({ error: 'Mã Role đã tồn tại' }, { status: 400 });
        }

        const newRole = await prisma.role.create({
            data: {
                code: upperCode,
                name,
                description,
                permissions: permissions || {}
            }
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { id, code, name, description, permissions } = body;

        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID role' }, { status: 400 });
        }

        const upperCode = code?.toUpperCase().trim();

        const updatedRole = await prisma.role.update({
            where: { id },
            data: {
                ...(upperCode && { code: upperCode }),
                ...(name && { name }),
                description,
                ...(permissions && { permissions })
            }
        });

        return NextResponse.json(updatedRole);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Mã Role đã tồn tại' }, { status: 400 });
        }
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID role cần xóa' }, { status: 400 });
        }

        // Check if role is used by any user? Currently user.role is just a String field in Prisma.
        // We could manually check if any user has this role string.
        const roleToDelete = await prisma.role.findUnique({ where: { id } });
        if (roleToDelete) {
            const usersWithRole = await prisma.user.count({ where: { role: roleToDelete.code } });
            if (usersWithRole > 0) {
                return NextResponse.json({ error: `Không thể xóa vì đang có ${usersWithRole} tài khoản mang Role này` }, { status: 400 });
            }
        }

        await prisma.role.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Xóa Role thành công' });
    } catch (error: any) {
        if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        return NextResponse.json({ error: 'Lỗi khi xóa Role' }, { status: 500 });
    }
}
