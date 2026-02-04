'use client';

import React from 'react';
import DashboardLayoutDemo from '@/components/demo/DashboardLayoutDemo';
import { Card, Upload, Button, Table, message, Empty } from 'antd';
import { InboxOutlined, FileExcelOutlined, ReloadOutlined, DownloadOutlined, SettingOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

export default function DocFileExcelDemoPage() {
    const dataSource = [
        {
            key: '1',
            hoTen: 'Nguyễn Văn A',
            maThe: 'HS4827482',
            ngayKham: '2025-01-20',
            chanDoan: 'Viêm họng cấp',
        },
        {
            key: '2',
            hoTen: 'Trần Thị B',
            maThe: 'HS4827483',
            ngayKham: '2025-01-21',
            chanDoan: 'Đau dạ dày',
        },
        {
            key: '3',
            hoTen: 'Lê Văn C',
            maThe: 'HS4827484',
            ngayKham: '2025-01-22',
            chanDoan: 'Sốt xuất huyết',
        },
    ];

    const columns = [
        { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
        { title: 'Mã thẻ', dataIndex: 'maThe', key: 'maThe' },
        { title: 'Ngày khám', dataIndex: 'ngayKham', key: 'ngayKham' },
        { title: 'Chẩn đoán', dataIndex: 'chanDoan', key: 'chanDoan' },
    ];

    return (
        <DashboardLayoutDemo>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Đọc dữ liệu Excel (Demo)</h2>
                    <p className="text-slate-500">Tải lên và xem nhanh nội dung file Excel.</p>
                </div>
                <Button icon={<ReloadOutlined />}>Tải file khác</Button>
            </div>

            <Card className="mb-6 shadow-sm border-slate-200">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <FileExcelOutlined className="text-xl" />
                        </div>
                        <span className="font-bold text-slate-700">demo_data.xlsx</span>
                    </div>

                    <div className="flex gap-2">
                        <Button icon={<SettingOutlined />}>Cấu hình</Button>
                        <Button type="primary" icon={<PlayCircleOutlined />} className="bg-blue-600">Kiểm tra ngay</Button>
                        <Button icon={<DownloadOutlined />} className="text-green-600 border-green-600">Xuất Excel</Button>
                    </div>
                </div>
            </Card>

            <Card className="shadow-sm border-slate-200" title="Kết quả đọc file">
                <Table dataSource={dataSource} columns={columns} pagination={false} size="middle" bordered />
            </Card>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Giao diện Upload (Khi chưa có file)</h3>
                <Card className="border-2 border-dashed border-slate-300 shadow-none bg-slate-50/50">
                    <div className="p-8 text-center">
                        <p className="text-6xl text-blue-400 mb-4"><InboxOutlined /></p>
                        <p className="text-lg font-semibold text-slate-600">Nhấp hoặc kéo thả file Excel vào đây</p>
                        <p className="text-slate-400">Hỗ trợ .xlsx, .xls</p>
                    </div>
                </Card>
            </div>
        </DashboardLayoutDemo>
    );
}
