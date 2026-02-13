import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

import { MtsWaitProvider } from '@/context/MtsWaitContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마트의원 직원용",
  description: "마트의원 직원용 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full bg-gray-50">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full`}>
        <MtsWaitProvider>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </MtsWaitProvider>
      </body>
    </html>
  );
}
