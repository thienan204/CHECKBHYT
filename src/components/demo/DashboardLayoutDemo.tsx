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
    AppstoreOutlined
} from '@ant-design/icons';
import { Layout, Menu, Button, theme, Breadcrumb, Avatar, Badge, Dropdown } from 'antd';
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
            <Sider trigger={null} collapsible collapsed={collapsed} width={260} theme="light" className="border-r border-slate-200">
                <div className="h-16 flex items-center justify-center border-b border-slate-100">
                    {collapsed ? (
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">X</div>
                    ) : (
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">XML Reader</h1>
                    )}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    className="border-none mt-2"
                    items={[
                        {
                            key: '1',
                            icon: <HomeOutlined />,
                            label: 'Trang chủ',
                        },
                        {
                            key: '2',
                            icon: <AuditOutlined />,
                            label: 'Kiểm tra hồ sơ',
                        },
                        {
                            key: '3',
                            icon: <FileExcelOutlined />,
                            label: 'Đọc file Excel',
                        },
                        {
                            key: 'sub1',
                            label: 'Quản lý danh mục',
                            icon: <AppstoreOutlined />,
                            children: [
                                { key: '4', label: 'Danh mục Khoa' },
                                { key: '5', label: 'Danh mục Nhân viên' },
                            ],
                        },
                        {
                            type: 'divider',
                        },
                        {
                            key: '6',
                            icon: <SettingOutlined />,
                            label: 'Cấu hình quy tắc',
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex justify-between items-center px-6 border-b border-slate-100 sticky top-0 z-10">
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
                                { title: <HomeOutlined /> },
                                { title: 'Demo Interface' },
                                { title: 'Dashboard' },
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <Badge count={5} size="small">
                            <Button type="text" shape="circle" icon={<BellOutlined />} />
                        </Badge>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                        {/* @ts-ignore */}
                        <Dropdown menu={userMenu}>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                                <Avatar icon={<UserOutlined />} className="bg-blue-600" />
                                <div className="hidden md:block leading-tight">
                                    <div className="text-sm font-semibold text-slate-700">Admin User</div>
                                    <div className="text-xs text-slate-400">Quản trị viên</div>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: 'transparent',
                        // borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
