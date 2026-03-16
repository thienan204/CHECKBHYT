import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const staff = await prisma.staff.findMany({
            include: {
                department: true // Include department connection to display `ten_khoa`
            },
            orderBy: {
                ma_bac_si: 'asc'
            }
        });
        return NextResponse.json(staff);
    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Handle Array of Staff (For Excel Import)
        if (Array.isArray(body)) {
            let successCount = 0;
            for (const item of body) {
                if (!item.ho_ten || !item.ma_bac_si || !item.ma_khoa) continue;

                await prisma.staff.upsert({
                    where: { ma_bac_si: item.ma_bac_si },
                    update: {
                        ho_ten: item.ho_ten,
                        trinh_do: item.trinh_do || null,
                        chuc_danh: item.chuc_danh || null,
                        ma_khoa: item.ma_khoa
                    },
                    create: {
                        ma_bac_si: item.ma_bac_si,
                        ho_ten: item.ho_ten,
                        trinh_do: item.trinh_do || null,
                        chuc_danh: item.chuc_danh || null,
                        ma_khoa: item.ma_khoa
                    }
                });
                successCount++;
            }
            return NextResponse.json({ success: true, count: successCount });
        }

        // Handle Single Object (For Form Add/Update)
        const { id, ho_ten, ma_bac_si, trinh_do, chuc_danh, ma_khoa } = body;

        if (!ho_ten || !ma_bac_si || !ma_khoa) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (id) {
            // Update existing
            const updated = await prisma.staff.update({
                where: { id },
                data: { ho_ten, ma_bac_si, trinh_do, chuc_danh, ma_khoa }
            });
            return NextResponse.json(updated);
        } else {
            // Create new
            const created = await prisma.staff.create({
                data: { ho_ten, ma_bac_si, trinh_do, chuc_danh, ma_khoa }
            });
            return NextResponse.json(created);
        }

    } catch (error: any) {
        console.error('Error saving staff:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing staff ID' }, { status: 400 });
        }

        await prisma.staff.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting staff:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
