'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: string) => {
        // Remove current locale from pathname if it exists
        const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

        // Navigate to new locale
        const newPath = newLocale === 'en' ? pathnameWithoutLocale : `/${newLocale}${pathnameWithoutLocale}`;
        router.push(newPath);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <select
                value={locale}
                onChange={(e) => switchLocale(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
                <option value="en">English</option>
                <option value="ko">한국어</option>
            </select>
        </div>
    );
}
