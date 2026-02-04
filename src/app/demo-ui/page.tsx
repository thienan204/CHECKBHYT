'use client';

import React from 'react';
import DashboardLayoutDemo from '@/components/demo/DashboardLayoutDemo';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { ArrowUpOutlined, FileTextOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function DemoPage() {
    const dataSource = [
        {
            key: '1',
            maHoSo: 'HS001',
            benhNhan: 'Nguyễn Văn A',
            ngayVao: '2025-01-20',
            trangThai: 'Đã duyệt',
            loi: 0,
        },
        {
            key: '2',
            maHoSo: 'HS002',
            benhNhan: 'Trần Thị B',
            ngayVao: '2025-01-21',
            trangThai: 'Cảnh báo',
            loi: 2,
        },
        {
            key: '3',
            maHoSo: 'HS003',
            benhNhan: 'Lê Văn C',
            ngayVao: '2025-01-22',
            trangThai: 'Lỗi',
            loi: 5,
        },
    ];

    const columns = [
        {
            title: 'Mã Hồ Sơ',
            dataIndex: 'maHoSo',
            key: 'maHoSo',
        },
        {
            title: 'Bệnh Nhân',
            dataIndex: 'benhNhan',
            key: 'benhNhan',
        },
        {
            title: 'Ngày Vào',
            dataIndex: 'ngayVao',
            key: 'ngayVao',
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'trangThai',
            key: 'trangThai',
            render: (text: string) => {
                let color = 'green';
                if (text === 'Cảnh báo') color = 'orange';
                if (text === 'Lỗi') color = 'red';
                return <Tag color={color}>{text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Số Lỗi',
            dataIndex: 'loi',
            key: 'loi',
        },
    ];

    return (
        <DashboardLayoutDemo>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
                <p className="text-slate-500">Báo cáo tình hình kiểm tra hồ sơ ngày 01/02/2026</p>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tổng hồ sơ"
                            value={1128}
                            prefix={<FileTextOutlined className="mr-2" />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Cảnh báo mới"
                            value={93}
                            prefix={<WarningOutlined className="mr-2" />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tỷ lệ đạt"
                            value={98.5}
                            precision={2}
                            suffix="%"
                            prefix={<CheckCircleOutlined className="mr-2" />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tăng trưởng"
                            value={15.3}
                            precision={1}
                            suffix="%"
                            prefix={<ArrowUpOutlined className="mr-2" />}
                            valueStyle={{ color: '#cf1322' }} // Example color
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Hồ sơ gần đây</h3>
                    <button className="text-blue-600 hover:underline text-sm font-medium">Xem tất cả</button>
                </div>
                <Table dataSource={dataSource} columns={columns} pagination={false} />
            </div>
        </DashboardLayoutDemo>
    );
}
