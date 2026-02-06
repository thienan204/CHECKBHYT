'use client';

import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    FileExcelOutlined,
    AuditOutlined,
    SettingOutlined,
    UserOutlined,
    BellOutlined,
    AppstoreOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Breadcrumb, Avatar, Badge, Dropdown, ConfigProvider } from 'antd';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

export default function DashboardLayoutDemo({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const userMenu = {
        items: [
            { key: '1', label: 'Thông tin cá nhân' },
            { key: '2', label: 'Cài đặt' },
            { type: 'divider' },
            { key: '3', label: 'Đăng xuất', danger: true },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                style={{
                    background: '#002838', // Deep Teal/Navy
                    backgroundImage: 'linear-gradient(180deg, #002838 0%, #001529 100%)'
                }}
                className="shadow-xl z-20"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-white/10 mx-4 mb-2">
                    {collapsed ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            M
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                <MedicineBoxOutlined />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white tracking-wide leading-none">MEDSIGHT</h1>
                                <span className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">Analytics</span>
                            </div>
                        </div>
                    )}
                </div>

                <ConfigProvider
                    theme={{
                        components: {
                            Menu: {
                                darkItemBg: 'transparent',
                                darkItemColor: '#94a3b8', // Slate-400
                                darkItemSelectedBg: 'rgba(6, 182, 212, 0.15)', // Cyan with opacity
                                darkItemSelectedColor: '#fff',
                                darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
                                iconSize: 18,
                            }
                        }
                    }}
                >
                    <Menu
                        theme="dark"
                        mode="inline"
                        defaultSelectedKeys={['2']} // Default to "Kiem tra ho so" as requested context
                        className="bg-transparent border-none px-2 space-y-1 font-medium"
                        items={[
                            {
                                key: '1',
                                icon: <HomeOutlined />,
                                label: 'Tổng quan',
                            },
                            {
                                type: 'group',
                                label: collapsed ? '' : <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold pl-2">Nghiệp vụ</span>,
                                children: [
                                    {
                                        key: '2',
                                        icon: <AuditOutlined />,
                                        label: 'Kiểm tra chuyên đề', // Renamed for context
                                        className: 'my-1'
                                    },
                                    {
                                        key: '3',
                                        icon: <FileExcelOutlined />,
                                        label: 'Dữ liệu Excel',
                                    },
                                ]
                            },
                            {
                                type: 'group',
                                label: collapsed ? '' : <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold pl-2">Quản trị</span>,
                                children: [
                                    {
                                        key: 'sub1',
                                        label: 'Danh mục hệ thống',
                                        icon: <AppstoreOutlined />,
                                        children: [
                                            { key: '4', label: 'Danh mục Khoa' },
                                            { key: '5', label: 'Danh mục Nhân viên' },
                                        ],
                                    },
                                    {
                                        key: '6',
                                        icon: <SettingOutlined />,
                                        label: 'Cấu hình quy tắc',
                                    },
                                    {
                                        key: '7',
                                        icon: <SafetyCertificateOutlined />,
                                        label: 'Phân quyền',
                                    }
                                ]
                            }
                        ]}
                    />
                </ConfigProvider>

                {/* Bottom User Area for compact mode or styling */}
                {!collapsed && (
                    <div className="absolute bottom-6 left-4 right-4 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-slate-300">Hệ thống hoạt động</span>
                        </div>
                    </div>
                )}
            </Sider>
            <Layout className="bg-[#f0f2f5]">
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-6 border-b border-slate-100 sticky top-0 z-10 shadow-sm h-16">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 32,
                                height: 32,
                            }}
                        />
                        <Breadcrumb
                            items={[
                                { title: <HomeOutlined className="text-slate-400" /> },
                                { title: <span className="text-slate-600 font-medium">Kiểm tra chuyên đề</span> },
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                            <span className="text-xs font-semibold text-slate-600">v2.4.0 Stable</span>
                        </div>

                        <Badge count={5} size="small" offset={[-2, 2]}>
                            <Button type="text" shape="circle" icon={<BellOutlined className="text-slate-600 text-lg" />} />
                        </Badge>
                        <div className="h-8 w-px bg-slate-200"></div>
                        {/* @ts-ignore */}
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-full pr-3 transition-colors border border-transparent hover:border-slate-200">
                                <Avatar icon={<UserOutlined />} className="bg-gradient-to-r from-cyan-500 to-blue-500" />
                                <div className="hidden md:block leading-tight text-right">
                                    <div className="text-sm font-bold text-slate-700">Admin User</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Administrator</div>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 24px',
                        padding: 0,
                        minHeight: 280,
                        background: 'transparent',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
