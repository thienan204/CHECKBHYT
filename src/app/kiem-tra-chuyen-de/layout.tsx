import React from 'react';
import { Card } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

// Actually, let's inline for now or use a simple client component if needed for active state. 
// Since it's server component, normal <a> is fine for navigation, but for active state highlighting we might want a client component.
// For now, I'll stick to a simple <a> tag structure similar to the previous implementation.

export default function KiemTraChuyenDeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-slate-50 pt-36 pb-12 px-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
                {/* Sidebar */}
                <div>
                    <Card className="shadow-sm border-slate-200 rounded-2xl h-full bg-white">
                        <div className="mb-4 px-2 pt-2">
                            <h2 className="text-lg font-bold text-slate-700 px-2">Danh sách</h2>
                        </div>
                        <nav className="flex flex-col space-y-1">
                            <div>
                                <a href="/kiem-tra-chuyen-de/xml3" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors font-medium group">
                                    <FileTextOutlined className="text-slate-400 group-hover:text-blue-500" />
                                    <span>XML3</span>
                                </a>
                                <div className="pl-12 space-y-1">
                                    <a href="/kiem-tra-chuyen-de/xml3/15" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Trùng giường (Nhóm 15)
                                    </a>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 px-4 py-3 text-slate-600 font-medium group cursor-default">
                                    <FileTextOutlined className="text-slate-400 group-hover:text-blue-500" />
                                    <span>Kiểm tra mã máy</span>
                                </div>
                                <div className="pl-12 space-y-1">
                                    <a href="/kiem-tra-chuyen-de/ma-may/1" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Xét nghiệm
                                    </a>
                                    <a href="/kiem-tra-chuyen-de/ma-may/2" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Chẩn đoán hình ảnh
                                    </a>
                                    <a href="/kiem-tra-chuyen-de/ma-may/3" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Thăm dò chức năng
                                    </a>
                                    <a href="/kiem-tra-chuyen-de/ma-may/8" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Phẫu thuật
                                    </a>
                                    <a href="/kiem-tra-chuyen-de/ma-may/18" className="block text-sm text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">
                                        Thủ thuật
                                    </a>
                                </div>
                            </div>
                            {/* Future items */}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="min-w-0">
                    {children}
                </div>
            </div>
        </main>
    );
}
