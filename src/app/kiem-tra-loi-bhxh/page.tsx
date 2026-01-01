import XmlReader from '@/components/XmlReader';
import Link from 'next/link';

export default function KiemTraLoiBhxh() {
    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-200/20 blur-[100px] rounded-full -z-10"></div>

            <nav className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1">
                    <Link href="/" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Trang chủ
                    </Link>
                    <Link href="/kiem-tra-loi-bhxh" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md font-bold text-sm transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Kiểm tra lỗi BHXH
                    </Link>
                    <Link href="/kiem-tra-loi-bhxh/rules" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Cấu hình Quy tắc
                    </Link>
                </div>
            </nav>



            <div className="w-full px-[20px] py-16">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4 animate-bounce duration-[2000ms]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">XML System v1.0</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight italic py-2">
                        Công cụ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 pr-2">Kiểm tra lỗi</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto italic">
                        Tải lên hồ sơ XML và hệ thống sẽ tự động phát hiện các lỗi logic, quy tắc bảo hiểm.
                    </p>
                </div>

                <XmlReader />
            </div>

            <footer className="py-12 text-center">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    &copy; 2025 XML Reader System • Powered by Antigravity
                </p>
            </footer>
        </main>
    );
}
