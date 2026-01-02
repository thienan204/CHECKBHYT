import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-between pointer-events-none">
          {/* Left: Home */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 transition-transform hover:scale-105">
            <a href="/" className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md font-bold text-sm transition-all flex items-center justify-center hover:shadow-cyan-200/50" title="Trang chủ">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </a>
          </div>

          {/* Right: Rules */}
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 transition-transform hover:scale-105">
            <a href="/rules" className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:text-cyan-600 hover:bg-cyan-50 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Cấu hình Quy tắc
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
