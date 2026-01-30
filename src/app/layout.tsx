import { cookies } from 'next/headers';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdRegistry from "@/lib/AntdRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiểm tra lỗi BHXH",
  description: "Công cụ kiểm tra và phân tích lỗi hồ sơ Bảo Hiểm Xã Hội",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('auth_token');

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <nav className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-between pointer-events-none">
          {/* Left: Home & XML3 */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 transition-transform hover:scale-105">
            <a href="/" className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md font-bold text-sm transition-all flex items-center justify-center hover:shadow-cyan-200/50" title="Trang chủ">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </a>

            <a href="/kiem-tra-chuyen-de" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Kiểm tra chuyên đề
            </a>

            <a href="/doc-file-excel" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Đọc Excel
            </a>

            {isLoggedIn && (
              <a href="/departments" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Q.Lý Khoa
              </a>
            )}
          </div>

          {/* Right: Rules */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 transition-transform hover:scale-105">
            <a href="/rules" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Quy tắc XML
            </a>
            <a href="/excel-rules" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Quy tắc Excel
            </a>
          </div>
        </nav>
        <AntdRegistry>
          <div className="pt-20">
            {children}
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}
