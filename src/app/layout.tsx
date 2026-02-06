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

import prisma from "@/lib/prisma";
import MainLayout from "@/components/architect/MainLayout";
import { getCurrentUser } from "@/actions/auth";

async function getSpecializedRules() {
  try {
    const rules = await prisma.specializedRule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return JSON.parse(JSON.stringify(rules));
  } catch (error) {
    console.error("Failed to fetch specialized rules:", error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('auth_token');
  const rules = await getSpecializedRules();
  const user = await getCurrentUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AntdRegistry>
          {/* Main Layout Wrapper */}
          <MainLayout rules={rules} user={user}>
            {children}
          </MainLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
