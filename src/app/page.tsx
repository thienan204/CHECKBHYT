import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-50/50 to-transparent -z-10"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-200/20 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-200/20 blur-[100px] rounded-full -z-10"></div>

      <nav className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md font-bold text-sm transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Trang chủ
          </Link>
          <Link href="/kiem-tra-loi-bhxh" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Kiểm tra lỗi BHXH
          </Link>
        </div>
      </nav>




      <div className="w-full px-[20px] max-w-4xl mx-auto text-center space-y-8">
        <div className="w-full px-[20px] max-w-4xl mx-auto text-center space-y-8">
          {/* Content removed as per user request */}
        </div>
      </div>

      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          &copy; 2025 PCNTT-BVĐKLS • Powered by Antigravity
        </p>
      </footer>
    </main>
  );
}
