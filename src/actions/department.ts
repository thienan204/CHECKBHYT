'use server'

import prisma from '@/lib/prisma'

export async function getDepartments() {
    try {
        const departments = await prisma.department.findMany({
            select: {
                ma_khoa: true,
                ten_khoa: true
            }
        });
        return departments;
    } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
    }
}
