import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Navbar from '@/components/Navbar';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/request';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: '셀프 체크인',
    description: '방문 고객 관리 시스템',
};

export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${inter.className} bg-gray-50 min-h-screen`}>
                <NextIntlClientProvider messages={messages}>
                    <Navbar />
                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
