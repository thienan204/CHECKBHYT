import React from 'react';

export default function ChuyenDeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="p-6">
            <div className="min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px] p-6">
                {children}
            </div>
        </main>
    );
}
