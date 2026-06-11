import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename
        const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filename = `${Date.now()}-${originalName}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'tickets');

        // Create directory if it doesn't exist
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Ignore if exists
        }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        // Return the relative URL
        const fileUrl = `/uploads/tickets/${filename}`;
        
        return NextResponse.json({ url: fileUrl, success: true });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Lỗi tải file lên máy chủ' }, { status: 500 });
    }
}
