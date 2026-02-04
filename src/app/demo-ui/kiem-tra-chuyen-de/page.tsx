'use client';

import React from 'react';
import DashboardLayoutDemo from '@/components/demo/DashboardLayoutDemo';
import { Card, Result, Button, Alert } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

export default function KiemTraChuyenDeDemoPage() {
    return (
        <DashboardLayoutDemo>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Kiểm tra chuyên đề</h2>
                <p className="text-slate-500">Các báo cáo và kiểm tra chuyên sâu về hồ sơ bảo hiểm y tế.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Cảnh báo quy tắc" bordered={false} className="shadow-sm">
                    <Alert
                        message="Hệ thống đang phát triển"
                        description="Tính năng kiểm tra chuyên sâu đang được xây dựng và sẽ sớm ra mắt."
                        type="info"
                        showIcon
                    />
                    <div className="mt-6 flex justify-center">
                        <Result
                            icon={<ExperimentOutlined style={{ color: '#1890ff' }} />}
                            title="Tính năng đang xây dựng"
                            subTitle="Vui lòng quay lại sau."
                            extra={<Button type="primary">Trở về Trang chủ</Button>}
                        />
                    </div>
                </Card>

                <Card title="Thống kê sơ bộ" bordered={false} className="shadow-sm">
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                        <span className="text-slate-400">Biểu đồ thống kê sẽ hiển thị ở đây</span>
                    </div>
                </Card>
            </div>

        </DashboardLayoutDemo>
    );
}
