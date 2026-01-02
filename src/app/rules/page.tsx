'use client';

import React from 'react';
import Link from 'next/link';
import RuleSettings from '@/components/RuleSettings';
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

            <div className="relative z-10 flex-col flex h-full pt-20">
                <div className="px-8 py-6 flex items-center justify-between">

                    <h1 className="text-2xl font-black text-slate-800 italic">
                        Cấu hình <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Quy tắc Validation</span>
                    </h1>
                    <div className="flex items-center justify-end w-32">
                        <button
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/';
                            }}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Đăng xuất
                        </button>
                    </div>
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
