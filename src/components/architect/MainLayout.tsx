'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarClient from './SidebarClient';
import TopHeader from './TopHeader';

interface MainLayoutProps {
    children: React.ReactNode;
    rules: any[];
    user: any; // UserPayload | null
}

export default function MainLayout({ children, rules, user }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <>
            <SidebarClient rules={rules} isOpen={isSidebarOpen} user={user} />
            <TopHeader
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                user={user}
            />

            <div
                className={`
                    pt-[60px] min-h-screen bg-slate-50 transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'pl-[280px]' : 'pl-0'}
                `}
            >
                {children}
            </div>
        </>
    );
}
