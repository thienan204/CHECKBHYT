'use client';

import React from 'react';
import Link from 'next/link';
import {
    RocketOutlined, AppstoreOutlined,
    FileTextOutlined, FileExcelOutlined,
    SettingOutlined, DashboardOutlined,
    TableOutlined
} from '@ant-design/icons';
import { Button } from 'antd';
import { getBasePath } from '@/utils/config';

interface SidebarClientProps {
    rules: any[]; // Or SpecializedRule type
    isOpen: boolean;
    user: any;
}

export default function SidebarClient({ rules, isOpen, user }: SidebarClientProps) {
    return (
        <div
            className={`
                bg-white h-screen fixed left-0 top-0 border-r border-slate-200 z-20 flex flex-col font-sans transition-all duration-300 ease-in-out
                ${isOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full'}
            `}
        >
            {/* Logo Area */}
            <div className="h-[60px] flex items-center px-6 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2 text-slate-800 font-bold text-xl tracking-tight no-underline hover:text-slate-800 h-full">
                    {/* <RocketOutlined className="text-blue-500 text-2xl" />
                    <span>ArchitectUI</span> */}
                    <img src={`${getBasePath()}/logo.png`} alt="Logo" className="max-h-[40px] w-auto object-contain" />
                </Link>
                <div className="ml-auto">
                    {/* Placeholder for internal toggle if needed, or just status icon */}
                </div>
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200">

                {/* Main Dashboard */}
                <div className="px-4 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Tổng quan</p>
                    <Link href="/" className="bg-blue-50 text-blue-600 rounded-lg px-4 py-2.5 font-semibold flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors">
                        <DashboardOutlined className="text-lg" />
                        Trang chủ
                    </Link>
                </div>

                <div className="px-4 mb-2">
                    <Link href="/doc-file-excel" className="text-slate-600 hover:bg-slate-50 hover:text-green-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors">
                        <FileExcelOutlined className="text-lg opacity-70" />
                        Đọc dữ liệu Excel
                    </Link>
                </div>

                {/* Chuyên đề Section */}
                <div className="px-4 mb-2 mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Chuyên đề</p>

                    {/* Dynamic Rules List */}
                    {rules.length > 0 ? (
                        <div className="mb-2 space-y-1">
                            {rules.map((rule) => (
                                <Link
                                    key={rule.id}
                                    href={`/chuyen-de/${rule.slug}`}
                                    className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors"
                                >
                                    <FileTextOutlined className="text-lg opacity-70" />
                                    <span className="truncate">{rule.name}</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-2 text-slate-400 italic text-sm">Chưa có quy tắc</div>
                    )}


                </div>

                {/* Tools Section - Only visible when logged in */}
                {user && (
                    <div className="px-4 mb-2 mt-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Công cụ & Tiện ích</p>

                        <Link href="/chuyen-de/quy-tac-chuyen-de" className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors">
                            <SettingOutlined className="text-lg opacity-70" />
                            Quy tắc chuyên đề
                        </Link>

                        <Link href="/rules" className="text-slate-600 hover:bg-slate-50 hover:text-orange-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors mt-1">
                            <FileTextOutlined className="text-lg opacity-70" />
                            Quy tắc XML
                        </Link>

                        <Link href="/excel-rules" className="text-slate-600 hover:bg-slate-50 hover:text-green-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors mt-1">
                            <TableOutlined className="text-lg opacity-70" />
                            Quy tắc Excel
                        </Link>

                        <Link href="/departments" className="text-slate-600 hover:bg-slate-50 hover:text-purple-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors mt-1">
                            <AppstoreOutlined className="text-lg opacity-70" />
                            Q.Lý Khoa
                        </Link>

                        {/* Staff Link */}
                        <Link href="/staff" className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg px-4 py-2.5 font-medium flex items-center gap-3 cursor-pointer transition-colors mt-1">
                            <RocketOutlined className="text-lg opacity-70" />
                            Q.Lý Nhân Viên
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
