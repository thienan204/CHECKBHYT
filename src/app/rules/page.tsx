'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RuleSettings from '@/components/RuleSettings';
import { useRules } from '@/hooks/useRules';

export default function RulesPage() {
    const router = useRouter();
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
                        Cấu hình <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Quy tắc Validation (XML)</span>
                    </h1>

                </div>

                <div className="flex-1 px-8 pb-8 flex flex-col">
                    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                        <RuleSettings
                            isOpen={true}
                            onClose={() => router.push('/')}
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
