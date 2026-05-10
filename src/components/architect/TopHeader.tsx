'use client';

import React from 'react';
import {
    AppstoreOutlined, SearchOutlined,
    BellOutlined, MessageOutlined, LogoutOutlined
} from '@ant-design/icons';
import { Button, Badge, Avatar, Dropdown } from 'antd';
import { logout } from '@/actions/auth';
import { useRouter } from 'next/navigation';

interface TopHeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    user: any; // UserPayload | null
}

const TopHeader = ({ onToggleSidebar, isSidebarOpen, user }: TopHeaderProps) => {
    const router = useRouter();

    return (
        <div
            className={`
                h-[60px] bg-white/90 backdrop-blur fixed top-0 right-0 z-10 border-b border-slate-200 px-8 flex items-center justify-between shadow-sm transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'left-[280px]' : 'left-0'}
            `}
        >
            <div className="flex items-center gap-4">
                <Button
                    shape="circle"
                    icon={<AppstoreOutlined className="text-slate-500" />}
                    className="border-none shadow-none bg-transparent hover:bg-slate-100"
                    onClick={onToggleSidebar}
                />

            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                {user ? (
                    <Dropdown menu={{
                        items: [
                            {
                                key: 'logout',
                                label: 'Đăng xuất',
                                icon: <LogoutOutlined />,
                                danger: true,
                                onClick: async () => {
                                    await logout();
                                    router.push('/login');
                                    router.refresh();
                                }
                            }
                        ]
                    }}>
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-slate-700">{user.name || user.username}</div>
                                <div className="text-xs text-slate-400 font-medium">{user.role}</div>
                            </div>
                            <Avatar size="large" className="bg-blue-500 border-2 border-white shadow-sm">
                                {(user.name || user.username)?.[0]?.toUpperCase()}
                            </Avatar>
                        </div>
                    </Dropdown>
                ) : (
                    <Button type="primary" onClick={() => router.push('/login')} className="bg-blue-500 hover:bg-blue-600 font-bold shadow-md shadow-blue-200 border-none">
                        Đăng nhập
                    </Button>
                )}
            </div>
        </div>
    );
};

export default TopHeader;
