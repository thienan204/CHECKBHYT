'use client';

import React from 'react';
import DashboardLayoutDemo from '@/components/demo/DashboardLayoutDemo';
import { Card, Result, Button, Row, Col, Statistic, Tag } from 'antd';
import {
    ExperimentOutlined,
    MedicineBoxOutlined,
    FileSearchOutlined,
    AlertOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    SafetyOutlined,
    XOutlined,
    RightOutlined,
    BarChartOutlined,
    ScanOutlined
} from '@ant-design/icons';
import Link from 'next/link';

// Mock Data for Summary
const summaryData = [
    { title: 'Tổng hồ sơ', value: 12450, icon: <FileSearchOutlined />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Hợp lệ', value: 10230, icon: <CheckCircleOutlined />, color: 'green', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Cảnh báo', value: 1800, icon: <WarningOutlined />, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600' },
    { title: 'Xuất toán', value: 420, icon: <XOutlined />, color: 'red', bg: 'bg-red-50', text: 'text-red-600' },
];

const features = [
    {
        title: 'Kiểm tra Thuốc',
        desc: 'Phát hiện tương tác thuốc, liều dùng và chỉ định không hợp lý.',
        icon: <MedicineBoxOutlined style={{ fontSize: 24 }} />,
        color: 'text-cyan-600',
        bg: 'bg-cyan-50'
    },
    {
        title: 'Kiểm tra Cận lâm sàng',
        desc: 'Đối chiếu chỉ định xét nghiệm, chẩn đoán hình ảnh với chẩn đoán bệnh.',
        icon: <ExperimentOutlined style={{ fontSize: 24 }} />,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
    },
    {
        title: 'Kiểm tra Mã máy',
        desc: 'Truy vết và xác thực mã máy xét nghiệm, CĐHA theo danh mục.',
        icon: <ScanOutlined style={{ fontSize: 24 }} />,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
    },
    {
        title: 'Phân tích Giới tính',
        desc: 'Kiểm tra các chỉ định dịch vụ mâu thuẫn với giới tính người bệnh.',
        icon: <SafetyOutlined style={{ fontSize: 24 }} />,
        color: 'text-pink-600',
        bg: 'bg-pink-50'
    },
    {
        title: 'Thống kê Chi phí',
        desc: 'Theo dõi biến động chi phí khám chữa bệnh theo thời gian thực.',
        icon: <BarChartOutlined style={{ fontSize: 24 }} />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50'
    },
    {
        title: 'Cảnh báo Quy tắc',
        desc: 'Quản lý và cập nhật các quy tắc xuất toán mới nhất từ BHYT.',
        icon: <AlertOutlined style={{ fontSize: 24 }} />,
        color: 'text-orange-600',
        bg: 'bg-orange-50'
    }
];

export default function KiemTraChuyenDeDemoPage() {
    return (
        <DashboardLayoutDemo>
            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Kiểm tra chuyên đề</h2>
                <p className="text-slate-500 font-medium">Báo cáo tình hình dữ liệu và các công cụ kiểm tra chuyên sâu.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {summaryData.map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.text} text-xl shadow-sm`}>
                                {item.icon}
                            </div>
                            <Tag color={item.color} className="m-0 rounded-full px-3 border-none bg-opacity-10 font-bold">
                                +2.5%
                            </Tag>
                        </div>
                        <div>
                            <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{item.title}</div>
                            <div className="text-3xl font-black text-slate-800">{item.value.toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feature Grid */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-700 mb-4 px-1">Chức năng nghiệp vụ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <Button type="dashed" shape="circle" icon={<RightOutlined />} />
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                {feature.icon}
                            </div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{feature.title}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </DashboardLayoutDemo>
    );
}
