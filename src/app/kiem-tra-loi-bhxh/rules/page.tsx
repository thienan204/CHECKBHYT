'use client';

import React from 'react';
import Link from 'next/link';
import RuleSettings from '@/components/RuleSettings';
import { DEFAULT_RULES } from '@/lib/validation';
import { useRules } from '@/hooks/useRules';

export default function RulesPage() {
    const { rules, saveRules, isLoaded } = useRules();

    if (!isLoaded) return null; // Or a loading spinner

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-200/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 flex-col flex h-full">
                <div className="px-8 py-6 flex items-center justify-between">
                    <Link href="/kiem-tra-loi-bhxh" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </div>
                        <span className="font-bold text-slate-500 group-hover:text-cyan-700 transition-colors">Quay lại kiểm tra</span>
                    </Link>
                    <h1 className="text-2xl font-black text-slate-800 italic">
                        Cấu hình <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Quy tắc Validation</span>
                    </h1>
                    <div className="w-32"></div>
                </div>

                <div className="flex-1 px-8 pb-8 flex flex-col">
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                        <RuleSettings
                            isOpen={true}
                            onClose={() => { }}
                            rules={rules}
                            onSave={saveRules}
                            isModal={false}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
