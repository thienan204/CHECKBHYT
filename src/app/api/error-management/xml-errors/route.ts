import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/actions/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status');

        let whereClause: any = {};
        
        // Phân quyền: KHOA chỉ thấy phiếu của mình
        if (user.role === 'KHOA') {
            if (!user.ma_khoa) return NextResponse.json({ error: 'Tài khoản chưa gán khoa' }, { status: 403 });
            
            // Xử lý logic mã khoa trong db (đôi khi ma_khoa chứa nhiều khoa cách nhau bằng dấu phẩy/chấm phẩy)
            whereClause.ma_khoa = {
                contains: user.ma_khoa
            };
        }

        if (statusFilter) {
            whereClause.status = statusFilter;
        }

        const errors = await prisma.xmlErrorRecord.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(errors);
    } catch (error) {
        console.error('Error GET xml-errors:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            // Chỉ ADMIN mới được đẩy lỗi từ hệ thống đọc XML
            return NextResponse.json({ error: 'Unauthorized. Only ADMIN can push errors.' }, { status: 403 });
        }

        const body = await request.json();
        const { records } = body; // Array of error records from XMLReader

        if (!Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: 'Không có dữ liệu lỗi hợp lệ' }, { status: 400 });
        }

        // Tạo hàng loạt các bản ghi lỗi
        const createData = records.map(record => ({
            ma_lk: record.ma_lk || '',
            ma_bn: record.ma_bn || '',
            ma_khoa: record.ma_khoa || '',
            ten_khoa: record.ten_khoa || '',
            ho_ten: record.ho_ten || '',
            ma_the: record.ma_the || '',
            ngay_vao: record.ngay_vao ? new Date(record.ngay_vao) : null,
            ngay_ra: record.ngay_ra ? new Date(record.ngay_ra) : null,
            ngay_yl: record.ngay_yl ? new Date(record.ngay_yl) : null,
            ngay_th_yl: record.ngay_th_yl ? new Date(record.ngay_th_yl) : null,
            ngay_kq: record.ngay_kq ? new Date(record.ngay_kq) : null,
            ngay_vao_noi_tru: record.ngay_vao_noi_tru ? new Date(record.ngay_vao_noi_tru) : null,
            ma_dv: record.ma_dv || '',
            ten_dv: record.ten_dv || '',
            ma_doituong_kcb: record.ma_doituong_kcb || '',
            chi_tiet_loi: record.error || '',
            status: 'PENDING'
        }));

        await prisma.xmlErrorRecord.createMany({
            data: createData
        });

        return NextResponse.json({ success: true, count: createData.length });
    } catch (error) {
        console.error('Error POST xml-errors:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, status, departmentNote, adminNote } = body;

        if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 });

        const errRecord = await prisma.xmlErrorRecord.findUnique({ where: { id } });
        if (!errRecord) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (user.role === 'KHOA' && !errRecord.ma_khoa?.includes(user.ma_khoa || '')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await prisma.xmlErrorRecord.update({
            where: { id },
            data: {
                status: status !== undefined ? status : errRecord.status,
                departmentNote: departmentNote !== undefined ? departmentNote : errRecord.departmentNote,
                adminNote: adminNote !== undefined ? adminNote : errRecord.adminNote
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error PUT xml-errors:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
