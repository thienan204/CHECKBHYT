import React from 'react';
import DynamicSidebar from '@/components/specialized/DynamicSidebar';

export default function ChuyenDeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-slate-50 pt-36 pb-12 px-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
                {/* Sidebar */}
                <div className="sticky top-32 h-[calc(100vh-160px)]">
                    <DynamicSidebar />
                </div>

                {/* Main Content */}
                <div className="min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] p-6">
                    {children}
                </div>
            </div>
        </main>
    );
}
